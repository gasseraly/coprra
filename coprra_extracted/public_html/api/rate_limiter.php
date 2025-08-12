<?php
/**
 * Rate Limiter Class (PDO Version)
 * حماية ضد Brute Force و DDoS
 */
class RateLimiter {
    private $pdo;
    private $default_limit = 10;  // عدد المحاولات المسموحة
    private $default_window = 900; // النافذة الزمنية (بالثواني)

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function isBlocked($identifier, $action = 'default') {
        $stmt = $this->pdo->prepare("
            SELECT 1 
            FROM rate_limits 
            WHERE identifier = ? AND action = ? AND blocked_until > NOW()
            LIMIT 1
        ");
        $stmt->execute([$identifier, $action]);
        return (bool) $stmt->fetch();
    }

    public function checkLimit($identifier, $action = 'default', $limit = null, $window = null) {
        $limit = $limit ?? $this->default_limit;
        $window = $window ?? $this->default_window;

        if ($this->isBlocked($identifier, $action)) {
            return [
                'allowed' => false,
                'reason' => 'blocked',
                'retry_after' => $this->getRetryAfter($identifier, $action)
            ];
        }

        $this->cleanOldAttempts($identifier, $action, $window);

        $current_attempts = $this->getCurrentAttempts($identifier, $action, $window);

        if ($current_attempts >= $limit) {
            $this->blockUser($identifier, $action, $window);
            return [
                'allowed' => false,
                'reason' => 'rate_limit_exceeded',
                'attempts' => $current_attempts,
                'limit' => $limit,
                'retry_after' => $window
            ];
        }

        $this->recordAttempt($identifier, $action);
        return [
            'allowed' => true,
            'attempts' => $current_attempts + 1,
            'limit' => $limit,
            'remaining' => $limit - ($current_attempts + 1)
        ];
    }

    private function cleanOldAttempts($identifier, $action, $window) {
        $stmt = $this->pdo->prepare("
            DELETE FROM rate_limits 
            WHERE identifier = ? AND action = ? 
            AND first_attempt < DATE_SUB(NOW(), INTERVAL ? SECOND)
            AND blocked_until IS NULL
        ");
        $stmt->execute([$identifier, $action, $window]);
    }

    private function getCurrentAttempts($identifier, $action, $window) {
        $stmt = $this->pdo->prepare("
            SELECT SUM(attempts) as total_attempts 
            FROM rate_limits 
            WHERE identifier = ? AND action = ? 
            AND first_attempt >= DATE_SUB(NOW(), INTERVAL ? SECOND)
            AND blocked_until IS NULL
        ");
        $stmt->execute([$identifier, $action, $window]);
        $row = $stmt->fetch();
        return (int)($row['total_attempts'] ?? 0);
    }

    private function recordAttempt($identifier, $action) {
        $stmt = $this->pdo->prepare("
            SELECT id 
            FROM rate_limits 
            WHERE identifier = ? AND action = ? 
            AND first_attempt >= DATE_SUB(NOW(), INTERVAL ? SECOND)
            AND blocked_until IS NULL
            ORDER BY first_attempt DESC 
            LIMIT 1
        ");
        $stmt->execute([$identifier, $action, $this->default_window]);
        $row = $stmt->fetch();

        if ($row) {
            $stmt = $this->pdo->prepare("
                UPDATE rate_limits 
                SET attempts = attempts + 1, last_attempt = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$row['id']]);
        } else {
            $stmt = $this->pdo->prepare("
                INSERT INTO rate_limits (identifier, action, attempts) 
                VALUES (?, ?, 1)
            ");
            $stmt->execute([$identifier, $action]);
        }
    }

    private function blockUser($identifier, $action, $block_duration) {
        $stmt = $this->pdo->prepare("
            UPDATE rate_limits 
            SET blocked_until = DATE_ADD(NOW(), INTERVAL ? SECOND) 
            WHERE identifier = ? AND action = ?
        ");
        $stmt->execute([$block_duration, $identifier, $action]);
    }

    private function getRetryAfter($identifier, $action) {
        $stmt = $this->pdo->prepare("
            SELECT TIMESTAMPDIFF(SECOND, NOW(), blocked_until) as retry_after 
            FROM rate_limits 
            WHERE identifier = ? AND action = ? AND blocked_until > NOW()
        ");
        $stmt->execute([$identifier, $action]);
        $row = $stmt->fetch();
        return (int)($row['retry_after'] ?? 0);
    }

    public function unblock($identifier, $action = 'default') {
        $stmt = $this->pdo->prepare("
            UPDATE rate_limits 
            SET blocked_until = NULL 
            WHERE identifier = ? AND action = ?
        ");
        return $stmt->execute([$identifier, $action]);
    }

    public static function getIdentifier() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        return hash('sha256', $ip . '|' . $user_agent);
    }

    public function cleanup($days = 7) {
        $stmt = $this->pdo->prepare("
            DELETE FROM rate_limits 
            WHERE first_attempt < DATE_SUB(NOW(), INTERVAL ? DAY)
        ");
        return $stmt->execute([$days]);
    }
}

/**
 * دالة مساعدة لفحص Rate Limiting
 */
function checkRateLimit(PDO $pdo, $action = 'default', $limit = null, $window = null) {
    $rate_limiter = new RateLimiter($pdo);
    $identifier = RateLimiter::getIdentifier();

    $result = $rate_limiter->checkLimit($identifier, $action, $limit, $window);

    if (!$result['allowed']) {
        http_response_code(429);
        echo json_encode([
            'error' => $result['reason'] === 'blocked'
                ? 'You are temporarily blocked due to too many failed attempts'
                : 'Rate limit exceeded',
            'retry_after' => $result['retry_after'],
            'attempts' => $result['attempts'] ?? null,
            'limit' => $result['limit'] ?? null
        ]);
        exit();
    }
    return $result;
}
