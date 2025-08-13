<?php
/**
 * Rate Limiter Class
 * يوفر حماية ضد هجمات Brute Force و DDoS
 */

class RateLimiter {
    private $conn;
    private $default_limit = 10; // عدد المحاولات المسموحة
    private $default_window = 900; // النافزة الزمنية بالثواني (15 دقيقة)
    
    public function __construct($database_connection) {
        $this->conn = $database_connection;
        $this->createRateLimitTable();
    }
    
    /**
     * إنشاء جدول Rate Limiting إذا لم يكن موجوداً
     */
    private function createRateLimitTable() {
        $sql = "CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) NOT NULL,
            action VARCHAR(100) NOT NULL,
            attempts INT DEFAULT 1,
            first_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            blocked_until TIMESTAMP NULL,
            INDEX idx_identifier_action (identifier, action),
            INDEX idx_blocked_until (blocked_until)
        )";
        
        $this->conn->query($sql);
    }
    
    /**
     * فحص ما إذا كان المستخدم محظوراً
     */
    public function isBlocked($identifier, $action = 'default') {
        $stmt = $this->conn->prepare("
            SELECT blocked_until 
            FROM rate_limits 
            WHERE identifier = ? AND action = ? AND blocked_until > NOW()
        ");
        $stmt->bind_param("ss", $identifier, $action);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->num_rows > 0;
    }
    
    /**
     * تسجيل محاولة جديدة وفحص الحد المسموح
     */
    public function checkLimit($identifier, $action = 'default', $limit = null, $window = null) {
        $limit = $limit ?? $this->default_limit;
        $window = $window ?? $this->default_window;
        
        // فحص إذا كان محظوراً
        if ($this->isBlocked($identifier, $action)) {
            return [
                'allowed' => false,
                'reason' => 'blocked',
                'retry_after' => $this->getRetryAfter($identifier, $action)
            ];
        }
        
        // تنظيف المحاولات القديمة
        $this->cleanOldAttempts($identifier, $action, $window);
        
        // الحصول على المحاولات الحالية
        $current_attempts = $this->getCurrentAttempts($identifier, $action, $window);
        
        if ($current_attempts >= $limit) {
            // حظر المستخدم
            $this->blockUser($identifier, $action, $window);
            return [
                'allowed' => false,
                'reason' => 'rate_limit_exceeded',
                'attempts' => $current_attempts,
                'limit' => $limit,
                'retry_after' => $window
            ];
        }
        
        // تسجيل المحاولة
        $this->recordAttempt($identifier, $action);
        
        return [
            'allowed' => true,
            'attempts' => $current_attempts + 1,
            'limit' => $limit,
            'remaining' => $limit - ($current_attempts + 1)
        ];
    }
    
    /**
     * تنظيف المحاولات القديمة
     */
    private function cleanOldAttempts($identifier, $action, $window) {
        $stmt = $this->conn->prepare("
            DELETE FROM rate_limits 
            WHERE identifier = ? AND action = ? 
            AND first_attempt < DATE_SUB(NOW(), INTERVAL ? SECOND)
            AND blocked_until IS NULL
        ");
        $stmt->bind_param("ssi", $identifier, $action, $window);
        $stmt->execute();
    }
    
    /**
     * الحصول على عدد المحاولات الحالية
     */
    private function getCurrentAttempts($identifier, $action, $window) {
        $stmt = $this->conn->prepare("
            SELECT SUM(attempts) as total_attempts 
            FROM rate_limits 
            WHERE identifier = ? AND action = ? 
            AND first_attempt >= DATE_SUB(NOW(), INTERVAL ? SECOND)
            AND blocked_until IS NULL
        ");
        $stmt->bind_param("ssi", $identifier, $action, $window);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return (int)($row['total_attempts'] ?? 0);
    }
    
    /**
     * تسجيل محاولة جديدة
     */
    private function recordAttempt($identifier, $action) {
        // فحص إذا كان هناك سجل موجود في النافزة الزمنية الحالية
        $stmt = $this->conn->prepare("
            SELECT id FROM rate_limits 
            WHERE identifier = ? AND action = ? 
            AND first_attempt >= DATE_SUB(NOW(), INTERVAL 900 SECOND)
            AND blocked_until IS NULL
            ORDER BY first_attempt DESC LIMIT 1
        ");
        $stmt->bind_param("ss", $identifier, $action);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // تحديث السجل الموجود
            $row = $result->fetch_assoc();
            $stmt = $this->conn->prepare("
                UPDATE rate_limits 
                SET attempts = attempts + 1, last_attempt = NOW() 
                WHERE id = ?
            ");
            $stmt->bind_param("i", $row['id']);
            $stmt->execute();
        } else {
            // إنشاء سجل جديد
            $stmt = $this->conn->prepare("
                INSERT INTO rate_limits (identifier, action, attempts) 
                VALUES (?, ?, 1)
            ");
            $stmt->bind_param("ss", $identifier, $action);
            $stmt->execute();
        }
    }
    
    /**
     * حظر المستخدم
     */
    private function blockUser($identifier, $action, $block_duration) {
        $stmt = $this->conn->prepare("
            UPDATE rate_limits 
            SET blocked_until = DATE_ADD(NOW(), INTERVAL ? SECOND) 
            WHERE identifier = ? AND action = ?
        ");
        $stmt->bind_param("iss", $block_duration, $identifier, $action);
        $stmt->execute();
    }
    
    /**
     * الحصول على وقت إعادة المحاولة
     */
    private function getRetryAfter($identifier, $action) {
        $stmt = $this->conn->prepare("
            SELECT TIMESTAMPDIFF(SECOND, NOW(), blocked_until) as retry_after 
            FROM rate_limits 
            WHERE identifier = ? AND action = ? AND blocked_until > NOW()
        ");
        $stmt->bind_param("ss", $identifier, $action);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return (int)($row['retry_after'] ?? 0);
    }
    
    /**
     * إزالة الحظر يدوياً
     */
    public function unblock($identifier, $action = 'default') {
        $stmt = $this->conn->prepare("
            UPDATE rate_limits 
            SET blocked_until = NULL 
            WHERE identifier = ? AND action = ?
        ");
        $stmt->bind_param("ss", $identifier, $action);
        return $stmt->execute();
    }
    
    /**
     * الحصول على معرف المستخدم (IP + User Agent)
     */
    public static function getIdentifier() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        return hash('sha256', $ip . '|' . $user_agent);
    }
    
    /**
     * تنظيف السجلات القديمة (يجب تشغيلها دورياً)
     */
    public function cleanup($days = 7) {
        $stmt = $this->conn->prepare("
            DELETE FROM rate_limits 
            WHERE first_attempt < DATE_SUB(NOW(), INTERVAL ? DAY)
        ");
        $stmt->bind_param("i", $days);
        return $stmt->execute();
    }
}

/**
 * دالة مساعدة لفحص Rate Limiting
 */
function checkRateLimit($conn, $action = 'default', $limit = null, $window = null) {
    $rate_limiter = new RateLimiter($conn);
    $identifier = RateLimiter::getIdentifier();
    
    $result = $rate_limiter->checkLimit($identifier, $action, $limit, $window);
    
    if (!$result['allowed']) {
        http_response_code(429); // Too Many Requests
        
        if ($result['reason'] === 'blocked') {
            echo json_encode([
                'error' => 'You are temporarily blocked due to too many failed attempts',
                'retry_after' => $result['retry_after']
            ]);
        } else {
            echo json_encode([
                'error' => 'Rate limit exceeded',
                'attempts' => $result['attempts'],
                'limit' => $result['limit'],
                'retry_after' => $result['retry_after']
            ]);
        }
        exit();
    }
    
    return $result;
}
?>

