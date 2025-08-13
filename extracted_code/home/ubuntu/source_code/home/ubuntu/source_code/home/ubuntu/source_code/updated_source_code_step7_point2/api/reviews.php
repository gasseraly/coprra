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

function sanitizeInput($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

function validateRating($rating) {
    return is_numeric($rating) && $rating >= 1 && $rating <= 5;
}

// Get request method and action
$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "";

// Handle different review actions
switch ($action) {
    case "product-reviews":
        if ($method !== "GET") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $product_id = intval($_GET["product_id"] ?? 0);
        $limit = intval($_GET["limit"] ?? 10);
        $offset = intval($_GET["offset"] ?? 0);
        $sort = $_GET["sort"] ?? "newest"; // newest, oldest, highest, lowest, helpful
        
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        // Build sort clause
        $sort_clause = "ur.created_at DESC";
        switch ($sort) {
            case "oldest":
                $sort_clause = "ur.created_at ASC";
                break;
            case "highest":
                $sort_clause = "ur.rating DESC, ur.created_at DESC";
                break;
            case "lowest":
                $sort_clause = "ur.rating ASC, ur.created_at DESC";
                break;
            case "helpful":
                $sort_clause = "ur.helpful_votes DESC, ur.created_at DESC";
                break;
        }
        
        // Get reviews
        $sql = "SELECT ur.*, u.first_name, u.last_name, u.avatar_url 
                FROM user_reviews ur 
                JOIN users u ON ur.user_id = u.id 
                WHERE ur.product_id = ? AND ur.is_approved = 1 
                ORDER BY $sort_clause 
                LIMIT ? OFFSET ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $product_id, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = [
                "id" => $row["id"],
                "rating" => intval($row["rating"]),
                "title" => $row["title"],
                "review_text" => $row["review_text"],
                "is_verified_purchase" => boolval($row["is_verified_purchase"]),
                "helpful_votes" => intval($row["helpful_votes"]),
                "created_at" => $row["created_at"],
                "user" => [
                    "name" => $row["first_name"] . " " . $row["last_name"],
                    "avatar_url" => $row["avatar_url"]
                ]
            ];
        }
        
        // Get review statistics
        $stats_sql = "SELECT 
                        COUNT(*) as total_reviews,
                        AVG(rating) as average_rating,
                        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
                      FROM user_reviews 
                      WHERE product_id = ? AND is_approved = 1";
        
        $stmt = $conn->prepare($stats_sql);
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $stats_result = $stmt->get_result();
        $stats = $stats_result->fetch_assoc();
        
        echo json_encode([
            "success" => true,
            "reviews" => $reviews,
            "statistics" => [
                "total_reviews" => intval($stats["total_reviews"]),
                "average_rating" => round(floatval($stats["average_rating"]), 1),
                "rating_breakdown" => [
                    "5" => intval($stats["five_star"]),
                    "4" => intval($stats["four_star"]),
                    "3" => intval($stats["three_star"]),
                    "2" => intval($stats["two_star"]),
                    "1" => intval($stats["one_star"])
                ]
            ],
            "pagination" => [
                "limit" => $limit,
                "offset" => $offset,
                "has_more" => count($reviews) === $limit
            ]
        ]);
        break;
        
    case "add-review":
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
        $rating = intval($input["rating"] ?? 0);
        $title = sanitizeInput($input["title"] ?? "");
        $review_text = sanitizeInput($input["review_text"] ?? "");
        
        // Validation
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        if (!validateRating($rating)) {
            http_response_code(400);
            echo json_encode(["error" => "Rating must be between 1 and 5"]);
            break;
        }
        
        if (empty($title)) {
            http_response_code(400);
            echo json_encode(["error" => "Review title is required"]);
            break;
        }
        
        if (empty($review_text)) {
            http_response_code(400);
            echo json_encode(["error" => "Review text is required"]);
            break;
        }
        
        // Check if user already reviewed this product
        $check_sql = "SELECT id FROM user_reviews WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param("ii", $user["id"], $product_id);
        $stmt->execute();
        $existing = $stmt->get_result()->fetch_assoc();
        
        if ($existing) {
            http_response_code(409);
            echo json_encode(["error" => "You have already reviewed this product"]);
            break;
        }
        
        // Check if product exists
        $product_check = "SELECT id FROM products WHERE id = ?";
        $stmt = $conn->prepare($product_check);
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        if (!$stmt->get_result()->fetch_assoc()) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            break;
        }
        
        // Insert review
        $insert_sql = "INSERT INTO user_reviews (user_id, product_id, rating, title, review_text, is_approved, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())";
        $stmt = $conn->prepare($insert_sql);
        $stmt->bind_param("iisss", $user["id"], $product_id, $rating, $title, $review_text);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Review added successfully",
                "review_id" => $conn->insert_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to add review"]);
        }
        break;
        
    case "helpful-vote":
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
        $review_id = intval($input["review_id"] ?? 0);
        
        if (!$review_id) {
            http_response_code(400);
            echo json_encode(["error" => "Review ID is required"]);
            break;
        }
        
        // Check if review exists
        $check_sql = "SELECT id, helpful_votes FROM user_reviews WHERE id = ? AND is_approved = 1";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param("i", $review_id);
        $stmt->execute();
        $review = $stmt->get_result()->fetch_assoc();
        
        if (!$review) {
            http_response_code(404);
            echo json_encode(["error" => "Review not found"]);
            break;
        }
        
        // Update helpful votes
        $update_sql = "UPDATE user_reviews SET helpful_votes = helpful_votes + 1 WHERE id = ?";
        $stmt = $conn->prepare($update_sql);
        $stmt->bind_param("i", $review_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Vote recorded successfully",
                "new_helpful_votes" => $review["helpful_votes"] + 1
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to record vote"]);
        }
        break;
        
    case "product-qa":
        if ($method !== "GET") {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
            break;
        }
        
        $product_id = intval($_GET["product_id"] ?? 0);
        $limit = intval($_GET["limit"] ?? 10);
        $offset = intval($_GET["offset"] ?? 0);
        $sort = $_GET["sort"] ?? "newest"; // newest, oldest, helpful
        
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        // Build sort clause
        $sort_clause = "pqa.created_at DESC";
        switch ($sort) {
            case "oldest":
                $sort_clause = "pqa.created_at ASC";
                break;
            case "helpful":
                $sort_clause = "pqa.helpful_votes DESC, pqa.created_at DESC";
                break;
        }
        
        // Get Q&A
        $sql = "SELECT pqa.*, 
                       u1.first_name as questioner_first_name, u1.last_name as questioner_last_name, u1.avatar_url as questioner_avatar,
                       u2.first_name as answerer_first_name, u2.last_name as answerer_last_name, u2.avatar_url as answerer_avatar
                FROM product_qa pqa 
                JOIN users u1 ON pqa.user_id = u1.id 
                LEFT JOIN users u2 ON pqa.answered_by = u2.id
                WHERE pqa.product_id = ? AND pqa.is_approved = 1 
                ORDER BY $sort_clause 
                LIMIT ? OFFSET ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $product_id, $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $qa_items = [];
        while ($row = $result->fetch_assoc()) {
            $qa_items[] = [
                "id" => $row["id"],
                "question" => $row["question"],
                "answer" => $row["answer"],
                "helpful_votes" => intval($row["helpful_votes"]),
                "created_at" => $row["created_at"],
                "answered_at" => $row["answered_at"],
                "questioner" => [
                    "name" => $row["questioner_first_name"] . " " . $row["questioner_last_name"],
                    "avatar_url" => $row["questioner_avatar"]
                ],
                "answerer" => $row["answered_by"] ? [
                    "name" => $row["answerer_first_name"] . " " . $row["answerer_last_name"],
                    "avatar_url" => $row["answerer_avatar"]
                ] : null
            ];
        }
        
        // Get total count
        $count_sql = "SELECT COUNT(*) as total FROM product_qa WHERE product_id = ? AND is_approved = 1";
        $stmt = $conn->prepare($count_sql);
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        $count_result = $stmt->get_result();
        $total_count = $count_result->fetch_assoc()["total"];
        
        echo json_encode([
            "success" => true,
            "qa_items" => $qa_items,
            "total_count" => intval($total_count),
            "pagination" => [
                "limit" => $limit,
                "offset" => $offset,
                "has_more" => count($qa_items) === $limit
            ]
        ]);
        break;
        
    case "ask-question":
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
        $question = sanitizeInput($input["question"] ?? "");
        
        // Validation
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        if (empty($question)) {
            http_response_code(400);
            echo json_encode(["error" => "Question is required"]);
            break;
        }
        
        if (strlen($question) < 10) {
            http_response_code(400);
            echo json_encode(["error" => "Question must be at least 10 characters long"]);
            break;
        }
        
        // Check if product exists
        $product_check = "SELECT id FROM products WHERE id = ?";
        $stmt = $conn->prepare($product_check);
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        if (!$stmt->get_result()->fetch_assoc()) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            break;
        }
        
        // Insert question
        $insert_sql = "INSERT INTO product_qa (product_id, user_id, question, is_approved, created_at) VALUES (?, ?, ?, 1, NOW())";
        $stmt = $conn->prepare($insert_sql);
        $stmt->bind_param("iis", $product_id, $user["id"], $question);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Question submitted successfully",
                "question_id" => $conn->insert_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to submit question"]);
        }
        break;
        
    case "answer-question":
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
        
        $question_id = intval($input["question_id"] ?? 0);
        $answer = sanitizeInput($input["answer"] ?? "");
        
        // Validation
        if (!$question_id) {
            http_response_code(400);
            echo json_encode(["error" => "Question ID is required"]);
            break;
        }
        
        if (empty($answer)) {
            http_response_code(400);
            echo json_encode(["error" => "Answer is required"]);
            break;
        }
        
        if (strlen($answer) < 10) {
            http_response_code(400);
            echo json_encode(["error" => "Answer must be at least 10 characters long"]);
            break;
        }
        
        // Check if question exists and is not already answered
        $check_sql = "SELECT id, answer FROM product_qa WHERE id = ? AND is_approved = 1";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param("i", $question_id);
        $stmt->execute();
        $question = $stmt->get_result()->fetch_assoc();
        
        if (!$question) {
            http_response_code(404);
            echo json_encode(["error" => "Question not found"]);
            break;
        }
        
        if (!empty($question["answer"])) {
            http_response_code(409);
            echo json_encode(["error" => "Question already has an answer"]);
            break;
        }
        
        // Update question with answer
        $update_sql = "UPDATE product_qa SET answer = ?, answered_by = ?, answered_at = NOW() WHERE id = ?";
        $stmt = $conn->prepare($update_sql);
        $stmt->bind_param("sii", $answer, $user["id"], $question_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Answer submitted successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to submit answer"]);
        }
        break;
        
    case "qa-helpful-vote":
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
        $question_id = intval($input["question_id"] ?? 0);
        
        if (!$question_id) {
            http_response_code(400);
            echo json_encode(["error" => "Question ID is required"]);
            break;
        }
        
        // Check if question exists
        $check_sql = "SELECT id, helpful_votes FROM product_qa WHERE id = ? AND is_approved = 1";
        $stmt = $conn->prepare($check_sql);
        $stmt->bind_param("i", $question_id);
        $stmt->execute();
        $question = $stmt->get_result()->fetch_assoc();
        
        if (!$question) {
            http_response_code(404);
            echo json_encode(["error" => "Question not found"]);
            break;
        }
        
        // Update helpful votes
        $update_sql = "UPDATE product_qa SET helpful_votes = helpful_votes + 1 WHERE id = ?";
        $stmt = $conn->prepare($update_sql);
        $stmt->bind_param("i", $question_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Vote recorded successfully",
                "new_helpful_votes" => $question["helpful_votes"] + 1
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to record vote"]);
        }
        break;
        
    case "user-reviews":
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
        
        $limit = intval($_GET["limit"] ?? 10);
        $offset = intval($_GET["offset"] ?? 0);
        
        // Get user's reviews
        $sql = "SELECT ur.*, p.name_en, p.name_ar, p.main_image_url 
                FROM user_reviews ur 
                JOIN products p ON ur.product_id = p.id 
                WHERE ur.user_id = ? 
                ORDER BY ur.created_at DESC 
                LIMIT ? OFFSET ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iii", $user["id"], $limit, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = [
                "id" => $row["id"],
                "product_id" => $row["product_id"],
                "rating" => intval($row["rating"]),
                "title" => $row["title"],
                "review_text" => $row["review_text"],
                "is_verified_purchase" => boolval($row["is_verified_purchase"]),
                "is_approved" => boolval($row["is_approved"]),
                "helpful_votes" => intval($row["helpful_votes"]),
                "created_at" => $row["created_at"],
                "product" => [
                    "name_en" => $row["name_en"],
                    "name_ar" => $row["name_ar"],
                    "main_image_url" => $row["main_image_url"]
                ]
            ];
        }
        
        echo json_encode([
            "success" => true,
            "reviews" => $reviews,
            "pagination" => [
                "limit" => $limit,
                "offset" => $offset,
                "has_more" => count($reviews) === $limit
            ]
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(["error" => "Action not found"]);
        break;
}

$conn->close();
?>

