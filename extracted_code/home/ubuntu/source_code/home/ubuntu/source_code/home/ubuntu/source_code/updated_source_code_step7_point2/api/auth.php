<?php
require_once __DIR__ . "/../config.php";
require_once __DIR__ . "/rate_limiter.php";

header("Content-Type: application/json");

// Enable CORS for all origins (for development purposes)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle OPTIONS requests (preflight for CORS)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

// Helper functions
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePassword($password) {
    // Password must be at least 8 characters long
    if (strlen($password) < 8) {
        return ["valid" => false, "message" => "Password must be at least 8 characters long"];
    }
    
    // Check for at least one uppercase letter
    if (!preg_match('/[A-Z]/', $password)) {
        return ["valid" => false, "message" => "Password must contain at least one uppercase letter"];
    }
    
    // Check for at least one lowercase letter
    if (!preg_match('/[a-z]/', $password)) {
        return ["valid" => false, "message" => "Password must contain at least one lowercase letter"];
    }
    
    // Check for at least one number
    if (!preg_match('/[0-9]/', $password)) {
        return ["valid" => false, "message" => "Password must contain at least one number"];
    }
    
    // Check for at least one special character
    if (!preg_match('/[^A-Za-z0-9]/', $password)) {
        return ["valid" => false, "message" => "Password must contain at least one special character"];
    }
    
    return ["valid" => true, "message" => "Password is valid"];
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function sendEmail($to, $subject, $message) {
    // In a real application, you would use a proper email service
    // For now, we'll just log the email content
    error_log("Email to: $to, Subject: $subject, Message: $message");
    return true; // Simulate successful email sending
}

function getUserByEmail($conn, $email) {
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

function getUserById($conn, $id) {
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

function createUser($conn, $email, $password, $first_name, $last_name) {
    $hashed_password = hashPassword($password);
    $verification_token = generateToken();
    
    $stmt = $conn->prepare("INSERT INTO users (email, password, first_name, last_name, verification_token, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("sssss", $email, $hashed_password, $first_name, $last_name, $verification_token);
    
    if ($stmt->execute()) {
        return [
            "success" => true,
            "user_id" => $conn->insert_id,
            "verification_token" => $verification_token
        ];
    } else {
        return ["success" => false, "error" => $stmt->error];
    }
}

function createSession($conn, $user_id) {
    $session_token = generateToken();
    $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));
    
    $stmt = $conn->prepare("INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("iss", $user_id, $session_token, $expires_at);
    
    if ($stmt->execute()) {
        return $session_token;
    }
    return false;
}

function validateSession($conn, $session_token) {
    $stmt = $conn->prepare("SELECT us.*, u.* FROM user_sessions us JOIN users u ON us.user_id = u.id WHERE us.session_token = ? AND us.expires_at > NOW() AND us.is_active = 1");
    $stmt->bind_param("s", $session_token);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

function invalidateSession($conn, $session_token) {
    $stmt = $conn->prepare("UPDATE user_sessions SET is_active = 0 WHERE session_token = ?");
    $stmt->bind_param("s", $session_token);
    return $stmt->execute();
}

// Get request method and action
$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "";

// Handle different authentication actions
switch ($action) {
    case "register":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        // فحص Rate Limiting للتسجيل
        checkRateLimit($conn, 'register', 3, 3600); // 3 محاولات كل ساعة
        
        $input = json_decode(file_get_contents("php://input"), true);
        
        // Validate required fields
        $required_fields = ["email", "password", "first_name", "last_name"];
        foreach ($required_fields as $field) {
            if (!isset($input[$field]) || empty(trim($input[$field]))) {
                http_response_code(400);
                echo json_encode(["error" => "Missing required field: $field"]);
                exit();
            }
        }
        
        $email = trim($input["email"]);
        $password = $input["password"];
        $first_name = trim($input["first_name"]);
        $last_name = trim($input["last_name"]);
        
        // Validate email
        if (!validateEmail($email)) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid email address"]);
            break;
        }
        
        // Validate password
        $password_validation = validatePassword($password);
        if (!$password_validation["valid"]) {
            http_response_code(400);
            echo json_encode(["error" => $password_validation["message"]]);
            break;
        }
        
        // Check if user already exists
        if (getUserByEmail($conn, $email)) {
            http_response_code(409);
            echo json_encode(["error" => "User with this email already exists"]);
            break;
        }
        
        // Create user
        $result = createUser($conn, $email, $password, $first_name, $last_name);
        
        if ($result["success"]) {
            // Send verification email
            $verification_link = "https://coprra.com/verify-email?token=" . $result["verification_token"];
            $subject = "Verify your CopRRA account";
            $message = "Please click the following link to verify your account: $verification_link";
            sendEmail($email, $subject, $message);
            
            echo json_encode([
                "success" => true,
                "message" => "User registered successfully. Please check your email to verify your account.",
                "user_id" => $result["user_id"]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create user: " . $result["error"]]);
        }
        break;
        
    case "login":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        // فحص Rate Limiting لتسجيل الدخول
        checkRateLimit($conn, 'login', 5, 900); // 5 محاولات كل 15 دقيقة
        
        $input = json_decode(file_get_contents("php://input"), true);
        
        // Validate required fields
        if (!isset($input["email"]) || !isset($input["password"])) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password are required"]);
            break;
        }
        
        $email = trim($input["email"]);
        $password = $input["password"];
        
        // Get user by email
        $user = getUserByEmail($conn, $email);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password"]);
            break;
        }
        
        // Verify password
        if (!verifyPassword($password, $user["password"])) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid email or password"]);
            break;
        }
        
        // Check if email is verified
        if (!$user["email_verified"]) {
            http_response_code(403);
            echo json_encode(["error" => "Please verify your email address before logging in"]);
            break;
        }
        
        // Check if account is active
        if (!$user["is_active"]) {
            http_response_code(403);
            echo json_encode(["error" => "Your account has been deactivated"]);
            break;
        }
        
        // Create session
        $session_token = createSession($conn, $user["id"]);
        
        if ($session_token) {
            // Update last login
            $stmt = $conn->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->bind_param("i", $user["id"]);
            $stmt->execute();
            
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "session_token" => $session_token,
                "user" => [
                    "id" => $user["id"],
                    "email" => $user["email"],
                    "first_name" => $user["first_name"],
                    "last_name" => $user["last_name"],
                    "avatar_url" => $user["avatar_url"],
                    "role" => $user["role"]
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create session"]);
        }
        break;
        
    case "logout":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = $headers["Authorization"] ?? "";
        
        if (strpos($session_token, "Bearer ") === 0) {
            $session_token = substr($session_token, 7);
        }
        
        if (empty($session_token)) {
            http_response_code(400);
            echo json_encode(["error" => "Session token is required"]);
            break;
        }
        
        if (invalidateSession($conn, $session_token)) {
            echo json_encode(["success" => true, "message" => "Logged out successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to logout"]);
        }
        break;
        
    case "verify-email":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $input = json_decode(file_get_contents("php://input"), true);
        $token = $input["token"] ?? "";
        
        if (empty($token)) {
            http_response_code(400);
            echo json_encode(["error" => "Verification token is required"]);
            break;
        }
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE verification_token = ? AND email_verified = 0");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!$user) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or expired verification token"]);
            break;
        }
        
        // Update user as verified
        $stmt = $conn->prepare("UPDATE users SET email_verified = 1, verification_token = NULL, verified_at = NOW() WHERE id = ?");
        $stmt->bind_param("i", $user["id"]);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Email verified successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to verify email"]);
        }
        break;
        
    case "forgot-password":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $input = json_decode(file_get_contents("php://input"), true);
        $email = trim($input["email"] ?? "");
        
        if (empty($email) || !validateEmail($email)) {
            http_response_code(400);
            echo json_encode(["error" => "Valid email address is required"]);
            break;
        }
        
        $user = getUserByEmail($conn, $email);
        
        if ($user) {
            $reset_token = generateToken();
            $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $stmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?");
            $stmt->bind_param("ssi", $reset_token, $expires_at, $user["id"]);
            
            if ($stmt->execute()) {
                $reset_link = "https://coprra.com/reset-password?token=" . $reset_token;
                $subject = "Reset your CopRRA password";
                $message = "Please click the following link to reset your password: $reset_link";
                sendEmail($email, $subject, $message);
            }
        }
        
        // Always return success to prevent email enumeration
        echo json_encode(["success" => true, "message" => "If an account with this email exists, a password reset link has been sent"]);
        break;
        
    case "reset-password":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $input = json_decode(file_get_contents("php://input"), true);
        $token = $input["token"] ?? "";
        $new_password = $input["password"] ?? "";
        
        if (empty($token) || empty($new_password)) {
            http_response_code(400);
            echo json_encode(["error" => "Token and new password are required"]);
            break;
        }
        
        // Validate new password
        $password_validation = validatePassword($new_password);
        if (!$password_validation["valid"]) {
            http_response_code(400);
            echo json_encode(["error" => $password_validation["message"]]);
            break;
        }
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        
        if (!$user) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or expired reset token"]);
            break;
        }
        
        // Update password
        $hashed_password = hashPassword($new_password);
        $stmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?");
        $stmt->bind_param("si", $hashed_password, $user["id"]);
        
        if ($stmt->execute()) {
            // Invalidate all existing sessions
            $stmt = $conn->prepare("UPDATE user_sessions SET is_active = 0 WHERE user_id = ?");
            $stmt->bind_param("i", $user["id"]);
            $stmt->execute();
            
            echo json_encode(["success" => true, "message" => "Password reset successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to reset password"]);
        }
        break;
        
    case "profile":
        if ($method === "GET") {
            // Get user profile
            $headers = getallheaders();
            $session_token = $headers["Authorization"] ?? "";
            
            if (strpos($session_token, "Bearer ") === 0) {
                $session_token = substr($session_token, 7);
            }
            
            if (empty($session_token)) {
                http_response_code(401);
                echo json_encode(["error" => "Authentication required"]);
                break;
            }
            
            $session = validateSession($conn, $session_token);
            
            if (!$session) {
                http_response_code(401);
                echo json_encode(["error" => "Invalid or expired session"]);
                break;
            }
            
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $session["id"],
                    "email" => $session["email"],
                    "first_name" => $session["first_name"],
                    "last_name" => $session["last_name"],
                    "avatar_url" => $session["avatar_url"],
                    "role" => $session["role"],
                    "created_at" => $session["created_at"],
                    "last_login" => $session["last_login"]
                ]
            ]);
            
        } elseif ($method === "PUT") {
            // Update user profile
            $headers = getallheaders();
            $session_token = $headers["Authorization"] ?? "";
            
            if (strpos($session_token, "Bearer ") === 0) {
                $session_token = substr($session_token, 7);
            }
            
            if (empty($session_token)) {
                http_response_code(401);
                echo json_encode(["error" => "Authentication required"]);
                break;
            }
            
            $session = validateSession($conn, $session_token);
            
            if (!$session) {
                http_response_code(401);
                echo json_encode(["error" => "Invalid or expired session"]);
                break;
            }
            
            $input = json_decode(file_get_contents("php://input"), true);
            $first_name = trim($input["first_name"] ?? "");
            $last_name = trim($input["last_name"] ?? "");
            $avatar_url = trim($input["avatar_url"] ?? "");
            
            if (empty($first_name) || empty($last_name)) {
                http_response_code(400);
                echo json_encode(["error" => "First name and last name are required"]);
                break;
            }
            
            $stmt = $conn->prepare("UPDATE users SET first_name = ?, last_name = ?, avatar_url = ?, updated_at = NOW() WHERE id = ?");
            $stmt->bind_param("sssi", $first_name, $last_name, $avatar_url, $session["id"]);
            
            if ($stmt->execute()) {
                echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to update profile"]);
            }
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;
        
    case "change-password":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = $headers["Authorization"] ?? "";
        
        if (strpos($session_token, "Bearer ") === 0) {
            $session_token = substr($session_token, 7);
        }
        
        if (empty($session_token)) {
            http_response_code(401);
            echo json_encode(["error" => "Authentication required"]);
            break;
        }
        
        $session = validateSession($conn, $session_token);
        
        if (!$session) {
            http_response_code(401);
            echo json_encode(["error" => "Invalid or expired session"]);
            break;
        }
        
        $input = json_decode(file_get_contents("php://input"), true);
        $current_password = $input["current_password"] ?? "";
        $new_password = $input["new_password"] ?? "";
        
        if (empty($current_password) || empty($new_password)) {
            http_response_code(400);
            echo json_encode(["error" => "Current password and new password are required"]);
            break;
        }
        
        // Verify current password
        if (!verifyPassword($current_password, $session["password"])) {
            http_response_code(400);
            echo json_encode(["error" => "Current password is incorrect"]);
            break;
        }
        
        // Validate new password
        $password_validation = validatePassword($new_password);
        if (!$password_validation["valid"]) {
            http_response_code(400);
            echo json_encode(["error" => $password_validation["message"]]);
            break;
        }
        
        // Update password
        $hashed_password = hashPassword($new_password);
        $stmt = $conn->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
        $stmt->bind_param("si", $hashed_password, $session["id"]);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Password changed successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to change password"]);
        }
        break;
        
    default:
        http_response_code(404);
        echo json_encode(["error" => "Action not found"]);
        break;
}

$conn->close();
?>

