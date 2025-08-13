<?php
// Load environment variables
require_once 'env_loader.php';

// Database configuration from environment variables
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_NAME', env('DB_NAME', 'u990109832_coprra'));
define('DB_USER', env('DB_USER', 'u990109832_gasser'));
define('DB_PASS', env('DB_PASS', 'Hamo1510@Rayan146'));

// JWT Secret Key from environment variables
define('JWT_SECRET', env('JWT_SECRET', 'default-secret-key-change-in-production'));

// OAuth configuration from environment variables
define('GOOGLE_CLIENT_ID', env('GOOGLE_CLIENT_ID', ''));
define('GOOGLE_CLIENT_ID', env('GOOGLE_CLIENT_ID', ''));
define('GOOGLE_CLIENT_SECRET', env('GOOGLE_CLIENT_SECRET', ''));
define('GOOGLE_REDIRECT_URI', env('GOOGLE_REDIRECT_URI', ''));

define('FACEBOOK_APP_ID', env('FACEBOOK_APP_ID', ''));
define('FACEBOOK_APP_SECRET', env('FACEBOOK_APP_SECRET', ''));
define('FACEBOOK_REDIRECT_URI', env('FACEBOOK_REDIRECT_URI', ''));

// Application settings
define('APP_ENV', env('APP_ENV', 'production'));
define('APP_DEBUG', env('APP_DEBUG', false));
define('APP_URL', env('APP_URL', 'https://coprra.com'));

// CORS headers for React frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection with error handling
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch(PDOException $e) {
    // Log error instead of exposing it
    error_log('Database connection failed: ' . $e->getMessage());
    
    if (APP_DEBUG) {
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    } else {
        echo json_encode(['error' => 'Database connection failed']);
    }
    exit();
}

/**
 * Validate JWT token
 */
function validateJWTToken($token) {
    if (empty($token)) {
        return false;
    }
    
    // Remove "Bearer " prefix if present
    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    // Verify signature
    $expectedSignature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($expectedSignature));
    
    if (!hash_equals($expectedSignature, $signature)) {
        return false;
    }
    
    // Decode payload
    $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    // Check expiration
    if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
        return false;
    }
    
    return $payloadData;
}

/**
 * Get current user from JWT token
 */
function getCurrentUser() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    
    $payload = validateJWTToken($token);
    if (!$payload) {
        return null;
    }
    
    global $pdo;
    $stmt = $pdo->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    return $stmt->fetch();
}

/**
 * Check if user has required role
 */
function hasRole($requiredRole) {
    $user = getCurrentUser();
    if (!$user) {
        return false;
    }
    
    $userRole = $user['role'] ?? 'user';
    
    // Define role hierarchy
    $roleHierarchy = [
        'user' => 1,
        'moderator' => 2,
        'admin' => 3,
        'super_admin' => 4
    ];
    
    $userLevel = $roleHierarchy[$userRole] ?? 0;
    $requiredLevel = $roleHierarchy[$requiredRole] ?? 999;
    
    return $userLevel >= $requiredLevel;
}

/**
 * Require authentication
 */
function requireAuth() {
    $user = getCurrentUser();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit();
    }
    return $user;
}

/**
 * Require specific role
 */
function requireRole($role) {
    if (!hasRole($role)) {
        http_response_code(403);
        echo json_encode(['error' => 'Insufficient permissions']);
        exit();
    }
}
?>

