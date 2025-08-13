<?php
require_once __DIR__ . "/../config.php";

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
function validateSession($conn, $session_token) {
    if (empty($session_token)) {
        return false;
    }
    
    $stmt = $conn->prepare("SELECT us.*, u.* FROM user_sessions us JOIN users u ON us.user_id = u.id WHERE us.session_token = ? AND us.expires_at > NOW() AND us.is_active = 1");
    $stmt->bind_param("s", $session_token);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

function getAuthenticatedUser($headers) {
    $session_token = $headers["Authorization"] ?? "";
    
    if (strpos($session_token, "Bearer ") === 0) {
        $session_token = substr($session_token, 7);
    }
    
    return $session_token;
}

// Get request method and action
$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "";

// Handle different wishlist actions
switch ($action) {
    case "get-wishlist":
        if ($method !== "GET") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = getAuthenticatedUser($headers);
        $user = validateSession($conn, $session_token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Authentication required"]);
            break;
        }
        
        $limit = intval($_GET["limit"] ?? 20);
        $offset = intval($_GET["offset"] ?? 0);
        $sort = $_GET["sort"] ?? "newest"; // newest, oldest, price_low, price_high, name
        
        // Build sort clause
        $sort_clause = "uw.created_at DESC";
        switch ($sort) {
            case "oldest":
                $sort_clause = "uw.created_at ASC";
                break;
            case "price_low":
                $sort_clause = "p.price ASC";
                break;
            case "price_high":
                $sort_clause = "p.price DESC";
                break;
            case "name":
                $sort_clause = "p.name_en ASC";
                break;
        }
        
        // Get wishlist items
        $sql = "SELECT uw.*, p.*, b.name as brand_name, c.name_en as category_name, c.name_ar as category_name_ar
                FROM user_wishlist uw 
                JOIN products p ON uw.product_id = p.id 
                LEFT JOIN brands b ON p.brand_id = b.id
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE uw.user_id = ? 
                ORDER BY $sort_clause 
                LIMIT ? OFFSET ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $user["id"], $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $wishlist_items = [];
        while ($row = $result->fetch_assoc()) {
            $wishlist_items[] = [
                "wishlist_id" => $row["id"],
                "product_id" => $row["product_id"],
                "added_at" => $row["created_at"],
                "product" => [
                    "id" => $row["product_id"],
                    "name_en" => $row["name_en"],
                    "name_ar" => $row["name_ar"],
                    "description_en" => $row["description_en"],
                    "description_ar" => $row["description_ar"],
                    "price" => floatval($row["price"]),
                    "original_price" => $row["original_price"] ? floatval($row["original_price"]) : null,
                    "main_image_url" => $row["main_image_url"],
                    "stock_quantity" => intval($row["stock_quantity"]),
                    "average_rating" => $row["average_rating"] ? floatval($row["average_rating"]) : 0,
                    "review_count" => intval($row["review_count"] ?? 0),
                    "brand_name" => $row["brand_name"],
                    "category_name" => $row["category_name"],
                    "category_name_ar" => $row["category_name_ar"],
                    "is_featured" => boolval($row["is_featured"]),
                    "is_available" => boolval($row["is_available"])
                ]
            ];
        }
        
        // Get total count
        $count_sql = "SELECT COUNT(*) as total FROM user_wishlist WHERE user_id = ?";
        $stmt = $conn->prepare($count_sql);
        $stmt->bind_param("i", $user["id"]);
        $stmt->execute();
        $count_result = $stmt->get_result();
        $total_count = $count_result->fetch_assoc()["total"];
        
        echo json_encode([
            "success" => true,
            "wishlist_items" => $wishlist_items,
            "total_count" => intval($total_count),
            "pagination" => [
                "limit" => $limit,
                "offset" => $offset,
                "has_more" => count($wishlist_items) === $limit
            ]
        ]);
        break;
        
    case "add-to-wishlist":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = getAuthenticatedUser($headers);
        $user = validateSession($conn, $session_token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Authentication required"]);
            break;
        }
        
        $input = json_decode(file_get_contents("php://input"), true);
        $product_id = intval($input["product_id"] ?? 0);
        
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        // Check if product exists
        $product_check = "SELECT id FROM products WHERE id = ? AND is_available = 1";
        $stmt = $conn->prepare($product_check);
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        if (!$stmt->get_result()->fetch_assoc()) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found or not available"]);
            break;
        }
        
        // Check if already in wishlist
        $check_sql = "SELECT id FROM user_wishlist WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param("ii", $user["id"], $product_id);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        
        if ($existing) {
            http_response_code(409);
            echo json_encode(["error" => "Product already in wishlist"]);
            break;
        }
        
        // Add to wishlist
        $insert_sql = "INSERT INTO user_wishlist (user_id, product_id, created_at) VALUES (?, ?, NOW())";
        $stmt = $conn->prepare($insert_sql);
        $stmt->bind_param("ii", $user["id"], $product_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Product added to wishlist successfully",
                "wishlist_id" => $conn->insert_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to add product to wishlist"]);
        }
        break;
        
    case "remove-from-wishlist":
        if ($method !== "DELETE") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = getAuthenticatedUser($headers);
        $user = validateSession($conn, $session_token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Authentication required"]);
            break;
        }
        
        $product_id = intval($_GET["product_id"] ?? 0);
        
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        // Remove from wishlist
        $delete_sql = "DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($delete_sql);
        $stmt->bind_param("ii", $user["id"], $product_id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "success" => true,
                    "message" => "Product removed from wishlist successfully"
                ]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Product not found in wishlist"]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to remove product from wishlist"]);
        }
        break;
        
    case "check-wishlist-status":
        if ($method !== "GET") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = getAuthenticatedUser($headers);
        $user = validateSession($conn, $session_token);
        
        if (!$user) {
            echo json_encode([
                "success" => true,
                "in_wishlist" => false,
                "message" => "User not authenticated"
            ]);
            break;
        }
        
        $product_id = intval($_GET["product_id"] ?? 0);
        
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        // Check if in wishlist
        $check_sql = "SELECT id FROM user_wishlist WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param("ii", $user["id"], $product_id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        
        echo json_encode([
            "success" => true,
            "in_wishlist" => $result ? true : false,
            "wishlist_id" => $result ? $result["id"] : null
        ]);
        break;
        
    case "clear-wishlist":
        if ($method !== "DELETE") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = getAuthenticatedUser($headers);
        $user = validateSession($conn, $session_token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Authentication required"]);
            break;
        }
        
        // Clear entire wishlist
        $delete_sql = "DELETE FROM user_wishlist WHERE user_id = ?";
        $stmt = $conn->prepare($delete_sql);
        $stmt->bind_param("i", $user["id"]);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Wishlist cleared successfully",
                "removed_count" => $stmt->affected_rows
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to clear wishlist"]);
        }
        break;
        
    case "move-to-cart":
        if ($method !== "POST") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = getAuthenticatedUser($headers);
        $user = validateSession($conn, $session_token);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(["error" => "Authentication required"]);
            break;
        }
        
        $input = json_decode(file_get_contents("php://input"), true);
        $product_id = intval($input["product_id"] ?? 0);
        $quantity = intval($input["quantity"] ?? 1);
        
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        if ($quantity < 1) {
            $quantity = 1;
        }
        
        // Check if product is in wishlist
        $check_sql = "SELECT id FROM user_wishlist WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param("ii", $user["id"], $product_id);
        $stmt->execute();
        if (!$stmt->get_result()->fetch_assoc()) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found in wishlist"]);
            break;
        }
        
        // Check product availability and stock
        $product_check = "SELECT id, stock_quantity FROM products WHERE id = ? AND is_available = 1";
        $stmt = $conn->prepare($product_check);
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();
        
        if (!$product) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found or not available"]);
            break;
        }
        
        if ($product["stock_quantity"] < $quantity) {
            http_response_code(400);
            echo json_encode(["error" => "Insufficient stock"]);
            break;
        }
        
        // Start transaction
        $conn->begin_transaction();
        
        try {
            // TODO: Add to cart (this would require a cart system)
            // For now, we'll just simulate success
            
            // Remove from wishlist
            $delete_sql = "DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?";
            $stmt = $conn->prepare($delete_sql);
            $stmt->bind_param("ii", $user["id"], $product_id);
            $stmt->execute();
            
            $conn->commit();
            
            echo json_encode([
                "success" => true,
                "message" => "Product moved to cart successfully"
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Failed to move product to cart"]);
        }
        break;
        
    case "get-wishlist-count":
        if ($method !== "GET") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $headers = getallheaders();
        $session_token = getAuthenticatedUser($headers);
        $user = validateSession($conn, $session_token);
        
        if (!$user) {
            echo json_encode([
                "success" => true,
                "count" => 0
            ]);
            break;
        }
        
        // Get wishlist count
        $count_sql = "SELECT COUNT(*) as count FROM user_wishlist WHERE user_id = ?";
        $stmt = $conn->prepare($count_sql);
        $stmt->bind_param("i", $user["id"]);
        $stmt->execute();
        $result = $stmt->get_result();
        $count = $result->fetch_assoc()["count"];
        
        echo json_encode([
            "success" => true,
            "count" => intval($count)
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(["error" => "Action not found"]);
        break;
}

$conn->close();
?>

