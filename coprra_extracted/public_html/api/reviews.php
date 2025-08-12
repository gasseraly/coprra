<?php
/**
 * reviews.php - إدارة مراجعات المنتجات
 * يعتمد على PDO و CORS الموحد
 */
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

// CORS
$allowed_origin = 'https://coprra.com';
header("Access-Control-Allow-Origin: {$allowed_origin}");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------- Functions -----------------
function validateSession(PDO $pdo, string $session_token) {
    if (!$session_token) return false;
    $stmt = $pdo->prepare("
        SELECT us.*, u.* 
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.session_token = ? 
          AND us.expires_at > NOW() 
          AND us.is_active = 1
    ");
    $stmt->execute([$session_token]);
    return $stmt->fetch();
}

function getAuthToken(): string {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }
    return $token;
}

function sanitize(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function validateRating($rating): bool {
    return is_numeric($rating) && $rating >= 1 && $rating <= 5;
}

function hasPurchased(PDO $pdo, int $user_id, int $product_id): bool {
    $stmt = $pdo->prepare("
        SELECT 1
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ? 
          AND oi.product_id = ? 
          AND o.status = 'completed'
        LIMIT 1
    ");
    $stmt->execute([$user_id, $product_id]);
    return (bool)$stmt->fetch();
}

// ----------------- Main -----------------
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'product-reviews':
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
        }

        $product_id = intval($_GET['product_id'] ?? 0);
        $limit = intval($_GET['limit'] ?? 10);
        $offset = intval($_GET['offset'] ?? 0);
        $sort = $_GET['sort'] ?? 'newest';

        if (!$product_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Product ID is required']);
            break;
        }

        $sort_clause = match ($sort) {
            'oldest'  => 'ur.created_at ASC',
            'highest' => 'ur.rating DESC, ur.created_at DESC',
            'lowest'  => 'ur.rating ASC, ur.created_at DESC',
            'helpful' => 'ur.helpful_votes DESC, ur.created_at DESC',
            default   => 'ur.created_at DESC'
        };

        $stmt = DB_PDO->prepare("
            SELECT ur.*, u.first_name, u.last_name, u.avatar_url
            FROM user_reviews ur
            JOIN users u ON ur.user_id = u.id
            WHERE ur.product_id = ? AND ur.is_approved = 1
            ORDER BY $sort_clause
            LIMIT ? OFFSET ?
        ");
        $stmt->bindValue(1, $product_id, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();
        $reviews = $stmt->fetchAll();

        $stmt = DB_PDO->prepare("
            SELECT 
                COUNT(*) as total_reviews,
                AVG(rating) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
            FROM user_reviews
            WHERE product_id = ? AND is_approved = 1
        ");
        $stmt->execute([$product_id]);
        $stats = $stmt->fetch();

        echo json_encode([
            'success' => true,
            'reviews' => array_map(fn($r) => [
                'id' => (int)$r['id'],
                'rating' => (int)$r['rating'],
                'title' => $r['title'],
                'review_text' => $r['review_text'],
                'is_verified_purchase' => (bool)$r['is_verified_purchase'],
                'helpful_votes' => (int)$r['helpful_votes'],
                'created_at' => $r['created_at'],
                'user' => [
                    'name' => $r['first_name'] . ' ' . $r['last_name'],
                    'avatar_url' => $r['avatar_url']
                ]
            ], $reviews),
            'statistics' => [
                'total_reviews' => (int)$stats['total_reviews'],
                'average_rating' => $stats['average_rating'] ? round((float)$stats['average_rating'], 1) : 0,
                'rating_breakdown' => [
                    '5' => (int)$stats['five_star'],
                    '4' => (int)$stats['four_star'],
                    '3' => (int)$stats['three_star'],
                    '2' => (int)$stats['two_star'],
                    '1' => (int)$stats['one_star']
                ]
            ],
            'pagination' => [
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => count($reviews) === $limit
            ]
        ]);
        break;

    case 'add-review':
        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
        }

        $session_token = getAuthToken();
        $user = validateSession(DB_PDO, $session_token);

        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Authentication required']);
            break;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $product_id = intval($input['product_id'] ?? 0);
        $rating = intval($input['rating'] ?? 0);
        $title = sanitize($input['title'] ?? '');
        $review_text = sanitize($input['review_text'] ?? '');

        if (!$product_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Product ID is required']);
            break;
        }
        if (!validateRating($rating)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Rating must be between 1 and 5']);
            break;
        }
        if (!$title || !$review_text) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Title and review text are required']);
            break;
        }

        $stmt = DB_PDO->prepare("SELECT id FROM user_reviews WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user['id'], $product_id]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'You have already reviewed this product']);
            break;
        }

        $stmt = DB_PDO->prepare("SELECT id FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Product not found']);
            break;
        }

        $is_verified = hasPurchased(DB_PDO, $user['id'], $product_id) ? 1 : 0;

        $stmt = DB_PDO->prepare("
            INSERT INTO user_reviews (user_id, product_id, rating, title, review_text, is_verified_purchase, is_approved, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
        ");
        if ($stmt->execute([$user['id'], $product_id, $rating, $title, $review_text, $is_verified])) {
            echo json_encode([
                'success' => true,
                'message' => 'Review added successfully',
                'review_id' => DB_PDO->lastInsertId(),
                'is_verified_purchase' => (bool)$is_verified
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to add review']);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Action not found']);
        break;
}
