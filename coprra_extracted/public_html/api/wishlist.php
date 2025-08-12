<?php
require_once __DIR__ . "/../config.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

/**
 * التحقق من الجلسة
 */
function validateSession(PDO $pdo, $session_token) {
    if (empty($session_token)) return false;
    $stmt = $pdo->prepare("
        SELECT u.* 
        FROM user_sessions us 
        JOIN users u ON us.user_id = u.id 
        WHERE us.session_token = ? 
        AND us.expires_at > NOW() 
        AND us.is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$session_token]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getAuthenticatedUserToken($headers) {
    $session_token = $headers["Authorization"] ?? "";
    if (strpos($session_token, "Bearer ") === 0) {
        $session_token = substr($session_token, 7);
    }
    return $session_token;
}

function sanitize($s) {
    return htmlspecialchars(strip_tags(trim($s)));
}

$pdo = DB_PDO;
$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "";

switch ($action) {

    case "get-wishlist":
        if ($method !== "GET") { http_response_code(405); echo json_encode(["error" => "Method not allowed"]); break; }

        $headers = getallheaders();
        $token = getAuthenticatedUserToken($headers);
        $user = validateSession($pdo, $token);

        if (!$user) { http_response_code(401); echo json_encode(["error" => "Authentication required"]); break; }

        $limit = max(1, intval($_GET["limit"] ?? 20));
        $offset = max(0, intval($_GET["offset"] ?? 0));
        $sort = $_GET["sort"] ?? "newest";

        $sort_clause = match ($sort) {
            "oldest" => "uw.created_at ASC",
            "price_low" => "p.price ASC",
            "price_high" => "p.price DESC",
            "name" => "p.name_en ASC",
            default => "uw.created_at DESC"
        };

        $stmt = $pdo->prepare("
            SELECT 
                uw.id AS wishlist_id,
                uw.product_id,
                uw.notes,
                uw.price_alert_enabled,
                uw.target_price,
                uw.created_at AS added_at,
                p.id AS product_id,
                p.name_en,
                p.name_ar,
                p.slug AS product_slug,
                p.description_en,
                p.description_ar,
                p.main_image_url,
                p.price,
                p.min_price,
                p.max_price,
                p.currency_code,
                p.average_rating,
                p.total_reviews,
                p.is_featured,
                p.is_active,
                p.availability_status,
                b.id AS brand_id,
                b.name AS brand_name,
                c.id AS category_id,
                c.name_en AS category_name_en,
                c.name_ar AS category_name_ar
            FROM user_wishlists uw
            JOIN products p ON uw.product_id = p.id
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE uw.user_id = ?
            ORDER BY $sort_clause
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $user["id"], PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        $items = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = [
                "wishlist_id" => (int)$row["wishlist_id"],
                "product_id" => (int)$row["product_id"],
                "notes" => $row["notes"],
                "price_alert_enabled" => (bool)$row["price_alert_enabled"],
                "target_price" => $row["target_price"] !== null ? (float)$row["target_price"] : null,
                "added_at" => $row["added_at"],
                "product" => [
                    "id" => (int)$row["product_id"],
                    "slug" => $row["product_slug"],
                    "name_en" => $row["name_en"],
                    "name_ar" => $row["name_ar"],
                    "description_en" => $row["description_en"],
                    "description_ar" => $row["description_ar"],
                    "main_image_url" => $row["main_image_url"],
                    "price" => $row["price"] !== null ? (float)$row["price"] : null,
                    "min_price" => $row["min_price"] !== null ? (float)$row["min_price"] : null,
                    "max_price" => $row["max_price"] !== null ? (float)$row["max_price"] : null,
                    "currency_code" => $row["currency_code"],
                    "average_rating" => $row["average_rating"] !== null ? (float)$row["average_rating"] : 0.0,
                    "total_reviews" => (int)$row["total_reviews"],
                    "brand" => $row["brand_id"] ? ["id" => (int)$row["brand_id"], "name" => $row["brand_name"]] : null,
                    "category" => $row["category_id"] ? ["id" => (int)$row["category_id"], "name_en" => $row["category_name_en"], "name_ar" => $row["category_name_ar"]] : null,
                    "is_featured" => (bool)$row["is_featured"],
                    "is_active" => (bool)$row["is_active"],
                    "availability_status" => $row["availability_status"]
                ]
            ];
        }

        $stmt = $pdo->prepare("SELECT COUNT(*) AS total FROM user_wishlists WHERE user_id = ?");
        $stmt->execute([$user["id"]]);
        $total_count = (int)($stmt->fetch(PDO::FETCH_ASSOC)["total"] ?? 0);

        echo json_encode([
            "success" => true,
            "wishlist_items" => $items,
            "total_count" => $total_count,
            "pagination" => [
                "limit" => $limit,
                "offset" => $offset,
                "has_more" => count($items) === $limit
            ]
        ]);
        break;

    case "add-to-wishlist":
        if ($method !== "POST") { http_response_code(405); echo json_encode(["error" => "Method not allowed"]); break; }

        $headers = getallheaders();
        $token = getAuthenticatedUserToken($headers);
        $user = validateSession($pdo, $token);

        if (!$user) { http_response_code(401); echo json_encode(["error" => "Authentication required"]); break; }

        $input = json_decode(file_get_contents("php://input"), true);
        $product_id = (int)($input["product_id"] ?? 0);
        $notes = isset($input["notes"]) ? sanitize($input["notes"]) : null;
        $price_alert_enabled = !empty($input["price_alert_enabled"]) ? 1 : 0;
        $target_price = isset($input["target_price"]) ? (float)$input["target_price"] : null;

        if (!$product_id) { http_response_code(400); echo json_encode(["error" => "Product ID is required"]); break; }

        $stmt = $pdo->prepare("SELECT id, is_active FROM products WHERE id = ? LIMIT 1");
        $stmt->execute([$product_id]);
        $product_row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$product_row || !(bool)$product_row["is_active"]) {
            http_response_code(404); echo json_encode(["error" => "Product not found or not active"]); break;
        }

        $stmt = $pdo->prepare("SELECT id FROM user_wishlists WHERE user_id = ? AND product_id = ? LIMIT 1");
        $stmt->execute([$user["id"], $product_id]);
        if ($stmt->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(409); echo json_encode(["error" => "Product already in wishlist"]); break;
        }

        if ($target_price === null) {
            $stmt = $pdo->prepare("INSERT INTO user_wishlists (user_id, product_id, notes, price_alert_enabled, created_at) VALUES (?, ?, ?, ?, NOW())");
            $ok = $stmt->execute([$user["id"], $product_id, $notes, $price_alert_enabled]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO user_wishlists (user_id, product_id, notes, price_alert_enabled, target_price, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $ok = $stmt->execute([$user["id"], $product_id, $notes, $price_alert_enabled, $target_price]);
        }

        if ($ok) {
            echo json_encode(["success" => true, "message" => "Product added to wishlist successfully", "wishlist_id" => $pdo->lastInsertId()]);
        } else {
            http_response_code(500); echo json_encode(["error" => "Failed to add product to wishlist"]);
        }
        break;

    case "remove-from-wishlist":
        if ($method !== "DELETE") { http_response_code(405); echo json_encode(["error" => "Method not allowed"]); break; }

        $headers = getallheaders();
        $token = getAuthenticatedUserToken($headers);
        $user = validateSession($pdo, $token);

        if (!$user) { http_response_code(401); echo json_encode(["error" => "Authentication required"]); break; }

        $product_id = (int)($_GET["product_id"] ?? 0);
        if (!$product_id) { http_response_code(400); echo json_encode(["error" => "Product ID is required"]); break; }

        $stmt = $pdo->prepare("DELETE FROM user_wishlists WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user["id"], $product_id]);
        if ($stmt->rowCount() > 0) {
            echo json_encode(["success" => true, "message" => "Product removed from wishlist successfully"]);
        } else {
            http_response_code(404); echo json_encode(["error" => "Product not found in wishlist"]);
        }
        break;

    case "check-wishlist-status":
        if ($method !== "GET") { http_response_code(405); echo json_encode(["error" => "Method not allowed"]); break; }

        $headers = getallheaders();
        $token = getAuthenticatedUserToken($headers);
        $user = validateSession($pdo, $token);

        $product_id = (int)($_GET["product_id"] ?? 0);
        if (!$product_id) { http_response_code(400); echo json_encode(["error" => "Product ID is required"]); break; }

        if (!$user) {
            echo json_encode(["success" => true, "in_wishlist" => false, "message" => "User not authenticated"]); break;
        }

        $stmt = $pdo->prepare("SELECT id FROM user_wishlists WHERE user_id = ? AND product_id = ? LIMIT 1");
        $stmt->execute([$user["id"], $product_id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "in_wishlist" => (bool)$res,
            "wishlist_id" => $res ? (int)$res["id"] : null
        ]);
        break;

    case "clear-wishlist":
        if ($method !== "DELETE") { http_response_code(405); echo json_encode(["error" => "Method not allowed"]); break; }

        $headers = getallheaders();
        $token = getAuthenticatedUserToken($headers);
        $user = validateSession($pdo, $token);

        if (!$user) { http_response_code(401); echo json_encode(["error" => "Authentication required"]); break; }

        $stmt = $pdo->prepare("DELETE FROM user_wishlists WHERE user_id = ?");
        $stmt->execute([$user["id"]]);
        echo json_encode(["success" => true, "message" => "Wishlist cleared successfully", "removed_count" => $stmt->rowCount()]);
        break;

    case "move-to-cart":
        if ($method !== "POST") { http_response_code(405); echo json_encode(["error" => "Method not allowed"]); break; }

        $headers = getallheaders();
        $token = getAuthenticatedUserToken($headers);
        $user = validateSession($pdo, $token);

        if (!$user) { http_response_code(401); echo json_encode(["error" => "Authentication required"]); break; }

        $input = json_decode(file_get_contents("php://input"), true);
        $product_id = (int)($input["product_id"] ?? 0);

        if (!$product_id) { http_response_code(400); echo json_encode(["error" => "Product ID is required"]); break; }

        $stmt = $pdo->prepare("SELECT id FROM user_wishlists WHERE user_id = ? AND product_id = ? LIMIT 1");
        $stmt->execute([$user["id"], $product_id]);
        if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(404); echo json_encode(["error" => "Product not found in wishlist"]); break;
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("DELETE FROM user_wishlists WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$user["id"], $product_id]);
            $pdo->commit();
            echo json_encode(["success" => true, "message" => "Product moved to cart (simulated)"]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500); echo json_encode(["error" => "Failed to move product to cart"]);
        }
        break;

    case "get-wishlist-count":
        if ($method !== "GET") { http_response_code(405); echo json_encode(["error" => "Method not allowed"]); break; }

        $headers = getallheaders();
        $token = getAuthenticatedUserToken($headers);
        $user = validateSession($pdo, $token);

        if (!$user) { echo json_encode(["success" => true, "count" => 0]); break; }

        $stmt = $pdo->prepare("SELECT COUNT(*) AS cnt FROM user_wishlists WHERE user_id = ?");
        $stmt->execute([$user["id"]]);
        $count = (int)($stmt->fetch(PDO::FETCH_ASSOC)["cnt"] ?? 0);

        echo json_encode(["success" => true, "count" => $count]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Action not found"]);
        break;
}
