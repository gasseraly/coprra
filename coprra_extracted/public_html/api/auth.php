<?php
/**
 * auth.php - نظام تسجيل الدخول/الخروج وإدارة المستخدمين
 * متوافق مع سكيمة قاعدة البيانات المرسلة (PDO) ومحتويقواعد البيانات.
 *
 * ملاحظات مهمة:
 * - يستخدم DB_PDO من config.php (PDO connection).
 * - يحتوي على تنفيذ بسيط للـ rate limiting عبر جدول rate_limits (PDO).
 * - يفترض وجود جدول user_wishlists (بجمع) كما في السكيمة.
 */

require_once __DIR__ . '/../config.php'; // يجب أن يُعرّف DB_PDO
header('Content-Type: application/json; charset=utf-8');

// CORS — اضبط النطاق حسب بيئتك
$allowed_origin = 'https://coprra.com';
header("Access-Control-Allow-Origin: {$allowed_origin}");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/** ----------------------
 *  Helpers: security & utils
 *  --------------------- */

function json_exit($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function generateToken($length = 32) {
    // length number of bytes -> hex doubles length
    return bin2hex(random_bytes($length));
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePassword($password) {
    if (strlen($password) < 8) return ['valid' => false, 'message' => 'Password must be at least 8 characters long'];
    if (!preg_match('/[A-Z]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one uppercase letter'];
    if (!preg_match('/[a-z]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one lowercase letter'];
    if (!preg_match('/[0-9]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one number'];
    if (!preg_match('/[^A-Za-z0-9]/', $password)) return ['valid' => false, 'message' => 'Password must contain at least one special character'];
    return ['valid' => true, 'message' => 'Password is valid'];
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function sendEmail($to, $subject, $message) {
    // placeholder: لا ترسل فعليًا أثناء التطوير — سجل فقط
    error_log("Email to: $to, Subject: $subject, Message: $message");
    return true;
}

function getIdentifier() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    return hash('sha256', $ip . '|' . $ua);
}

/** ----------------------
 *  Simple PDO Rate Limiter (works with table `rate_limits`)
 *  This is a lightweight, compatible-with-PDO implementation so auth.php
 *  لا يعتمد على rate_limiter.php الذي يستخدم mysqli.
 *  --------------------- */
function checkRateLimitPDO(PDO $pdo, $identifier, $action = 'default', $limit = 10, $window = 900) {
    // Ensure rate_limits table exists (best effort). If not, we still try to operate.
    try {
        // Start transaction to avoid race conditions
        $pdo->beginTransaction();

        // 1) Remove old attempts (optional cleanup)
        $cleanupStmt = $pdo->prepare("
            DELETE FROM rate_limits 
            WHERE identifier = :identifier AND action = :action
              AND first_attempt < DATE_SUB(NOW(), INTERVAL :window SECOND)
              AND blocked_until IS NULL
        ");
        $cleanupStmt->execute([':identifier' => $identifier, ':action' => $action, ':window' => $window]);

        // 2) Check blocked
        $blockedStmt = $pdo->prepare("
            SELECT blocked_until, TIMESTAMPDIFF(SECOND, NOW(), blocked_until) AS retry_after
            FROM rate_limits
            WHERE identifier = :identifier AND action = :action AND blocked_until > NOW()
            LIMIT 1
        ");
        $blockedStmt->execute([':identifier' => $identifier, ':action' => $action]);
        $blockedRow = $blockedStmt->fetch(PDO::FETCH_ASSOC);
        if ($blockedRow) {
            $pdo->commit();
            return [
                'allowed' => false,
                'reason' => 'blocked',
                'retry_after' => max(0, intval($blockedRow['retry_after']))
            ];
        }

        // 3) Count attempts in window
        $countStmt = $pdo->prepare("
            SELECT IFNULL(SUM(attempts),0) AS total_attempts
            FROM rate_limits
            WHERE identifier = :identifier AND action = :action
              AND first_attempt >= DATE_SUB(NOW(), INTERVAL :window SECOND)
              AND blocked_until IS NULL
        ");
        $countStmt->execute([':identifier' => $identifier, ':action' => $action, ':window' => $window]);
        $totalAttempts = intval($countStmt->fetchColumn() ?? 0);

        if ($totalAttempts >= $limit) {
            // Block: set blocked_until on existing records for identifier/action
            $blockDuration = $window; // block for window seconds (configurable)
            $updateBlock = $pdo->prepare("
                UPDATE rate_limits
                SET blocked_until = DATE_ADD(NOW(), INTERVAL :block_duration SECOND)
                WHERE identifier = :identifier AND action = :action
            ");
            $updateBlock->execute([':block_duration' => $blockDuration, ':identifier' => $identifier, ':action' => $action]);
            $pdo->commit();
            return [
                'allowed' => false,
                'reason' => 'rate_limit_exceeded',
                'attempts' => $totalAttempts,
                'limit' => $limit,
                'retry_after' => $blockDuration
            ];
        }

        // 4) Record attempt: if there's a recent row (first_attempt within window), increment attempts, else insert new
        $recentStmt = $pdo->prepare("
            SELECT id FROM rate_limits
            WHERE identifier = :identifier AND action = :action
              AND first_attempt >= DATE_SUB(NOW(), INTERVAL :window SECOND)
              AND blocked_until IS NULL
            ORDER BY first_attempt DESC
            LIMIT 1
        ");
        $recentStmt->execute([':identifier' => $identifier, ':action' => $action, ':window' => $window]);
        $recent = $recentStmt->fetch(PDO::FETCH_ASSOC);

        if ($recent) {
            $upd = $pdo->prepare("UPDATE rate_limits SET attempts = attempts + 1, last_attempt = NOW() WHERE id = :id");
            $upd->execute([':id' => $recent['id']]);
        } else {
            $ins = $pdo->prepare("INSERT INTO rate_limits (identifier, action, attempts, first_attempt, last_attempt) VALUES (:identifier, :action, 1, NOW(), NOW())");
            $ins->execute([':identifier' => $identifier, ':action' => $action]);
        }

        $pdo->commit();

        return [
            'allowed' => true,
            'attempts' => $totalAttempts + 1,
            'limit' => $limit,
            'remaining' => max(0, $limit - ($totalAttempts + 1))
        ];
    } catch (Exception $e) {
        // On any DB error, rollback and allow (fail-open) but log error
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("RateLimiter PDO error: " . $e->getMessage());
        // Fallback: allow request to proceed (to avoid lockout due to limiter errors)
        return ['allowed' => true, 'attempts' => 0, 'limit' => $limit, 'remaining' => $limit];
    }
}

/** ----------------------
 *  DB utility wrappers (PDO)
 *  --------------------- */

function getUserByEmail($email) {
    global $DB_PDO;
    $stmt = DB_PDO->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getUserById($id) {
    $stmt = DB_PDO->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function createUser($email, $password, $first_name, $last_name) {
    $hashed_password = hashPassword($password);
    $verification_token = generateToken(16);
    $stmt = DB_PDO->prepare("INSERT INTO users (email, password, first_name, last_name, verification_token, created_at, is_active, email_verified) VALUES (?, ?, ?, ?, ?, NOW(), 1, 0)");
    try {
        $stmt->execute([$email, $hashed_password, $first_name, $last_name, $verification_token]);
        return ['success' => true, 'user_id' => DB_PDO->lastInsertId(), 'verification_token' => $verification_token];
    } catch (PDOException $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

function createSession($user_id) {
    $session_token = generateToken(24);
    $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));
    $stmt = DB_PDO->prepare("INSERT INTO user_sessions (user_id, session_token, expires_at, created_at, is_active) VALUES (?, ?, ?, NOW(), 1)");
    try {
        $stmt->execute([$user_id, $session_token, $expires_at]);
        return $session_token;
    } catch (PDOException $e) {
        error_log("createSession error: " . $e->getMessage());
        return false;
    }
}

function validateSession($session_token) {
    $stmt = DB_PDO->prepare("SELECT us.*, u.* FROM user_sessions us JOIN users u ON us.user_id = u.id WHERE us.session_token = ? AND us.expires_at > NOW() AND us.is_active = 1");
    $stmt->execute([$session_token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function invalidateSession($session_token) {
    $stmt = DB_PDO->prepare("UPDATE user_sessions SET is_active = 0 WHERE session_token = ?");
    return $stmt->execute([$session_token]);
}

/** ----------------------
 *  Main: handle requests
 *  --------------------- */

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// prepare identifier for rate limiter
$identifier = getIdentifier();

switch ($action) {
    case 'register':
        // apply rate limiter (3 attempts per hour)
        $rl = checkRateLimitPDO(DB_PDO, $identifier, 'register', 3, 3600);
        if (!$rl['allowed']) {
            // if blocked, return 429
            json_exit(['error' => 'Too many attempts', 'retry_after' => $rl['retry_after'] ?? $rl['retry_after'] ?? 60], 429);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $required_fields = ['email', 'password', 'first_name', 'last_name'];
        foreach ($required_fields as $field) {
            if (empty(trim($input[$field] ?? ''))) {
                json_exit(['error' => "Missing required field: $field"], 400);
            }
        }

        $email = trim($input['email']);
        $password = $input['password'];
        $first_name = trim($input['first_name']);
        $last_name = trim($input['last_name']);

        if (!validateEmail($email)) {
            json_exit(['error' => 'Invalid email'], 400);
        }

        $pass_check = validatePassword($password);
        if (!$pass_check['valid']) {
            json_exit(['error' => $pass_check['message']], 400);
        }

        if (getUserByEmail($email)) {
            json_exit(['error' => 'User already exists'], 409);
        }

        $result = createUser($email, $password, $first_name, $last_name);
        if ($result['success']) {
            $link = "https://coprra.com/verify-email?token=" . urlencode($result['verification_token']);
            // send verification email (placeholder)
            sendEmail($email, 'Verify your CopRRA account', "Click to verify: $link");
            json_exit(['success' => true, 'message' => 'Registered, verify email', 'user_id' => (int)$result['user_id']]);
        } else {
            json_exit(['error' => 'Failed to create user', 'details' => $result['error']], 500);
        }
        break;

    case 'login':
        // rate limiter: 5 attempts per 15 minutes
        $rl = checkRateLimitPDO(DB_PDO, $identifier, 'login', 5, 900);
        if (!$rl['allowed']) {
            json_exit(['error' => 'Too many login attempts', 'retry_after' => $rl['retry_after'] ?? 900], 429);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            json_exit(['error' => 'Email and password are required'], 400);
        }

        $user = getUserByEmail($email);
        if (!$user || !verifyPassword($password, $user['password'])) {
            json_exit(['error' => 'Invalid email or password'], 401);
        }

        if (!(int)$user['email_verified']) {
            json_exit(['error' => 'Email not verified'], 403);
        }

        if (!(int)$user['is_active']) {
            json_exit(['error' => 'Account inactive'], 403);
        }

        $session_token = createSession($user['id']);
        if ($session_token) {
            // update last login
            DB_PDO->prepare("UPDATE users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

            // get wishlist count using the correct table name from schema: user_wishlists
            try {
                $wc = DB_PDO->prepare("SELECT COUNT(*) FROM user_wishlists WHERE user_id = ?");
                $wc->execute([$user['id']]);
                $wishlistCount = (int)$wc->fetchColumn();
            } catch (Exception $e) {
                // fallback if table name differs or error
                $wishlistCount = 0;
            }

            json_exit([
                'success' => true,
                'message' => 'Login successful',
                'session_token' => $session_token,
                'user' => [
                    'id' => (int)$user['id'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'avatar_url' => $user['avatar_url'] ?? null,
                    'role' => $user['role'] ?? 'user',
                    'wishlist_count' => $wishlistCount
                ]
            ]);
        } else {
            json_exit(['error' => 'Failed to create session'], 500);
        }
        break;

    case 'logout':
        // Expect Authorization: Bearer {token} header
        $headers = getallheaders();
        $session_token = '';
        if (!empty($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (strpos($auth, 'Bearer ') === 0) $session_token = substr($auth, 7);
        }
        if (empty($session_token)) {
            json_exit(['error' => 'Session token required'], 400);
        }
        if (invalidateSession($session_token)) {
            json_exit(['success' => true, 'message' => 'Logged out']);
        } else {
            json_exit(['error' => 'Failed to invalidate session'], 500);
        }
        break;

    default:
        json_exit(['error' => 'Action not found'], 404);
        break;
}
