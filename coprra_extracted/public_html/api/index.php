<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

// CORS
$allowed_origin = 'https://coprra.com';
header("Access-Control-Allow-Origin: {$allowed_origin}");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function json_exit($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'test':
        json_exit(['message' => 'API is working!', 'timestamp' => time()]);
        break;

    case 'languages':
        $stmt = DB_PDO->query("SELECT code, name, native_name, flag FROM languages");
        json_exit($stmt->fetchAll());
        break;

    case 'currencies':
        $stmt = DB_PDO->query("SELECT code, name, symbol, flag, country FROM currencies");
        json_exit($stmt->fetchAll());
        break;

    case 'categories':
        $stmt = DB_PDO->query("
            SELECT c.id, c.name_en, c.name_ar, c.slug, c.parent_id, COUNT(p.id) AS product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            GROUP BY c.id
        ");
        json_exit($stmt->fetchAll());
        break;

    case 'brands':
        $stmt = DB_PDO->query("SELECT id, name, slug, logo_url FROM brands");
        json_exit($stmt->fetchAll());
        break;

    case 'products':
        $limit = max(1, intval($_GET['limit'] ?? 20));
        $offset = max(0, intval($_GET['offset'] ?? 0));
        $params = [];
        $where = [];

        if (!empty($_GET['category_id'])) {
            $where[] = 'p.category_id = ?';
            $params[] = intval($_GET['category_id']);
        }
        if (!empty($_GET['brand_id'])) {
            $where[] = 'p.brand_id = ?';
            $params[] = intval($_GET['brand_id']);
        }

        $sql = "
            SELECT p.id, p.name_en, p.name_ar, p.slug, p.description_en, p.description_ar,
                   p.main_image_url, c.name_en AS category_name_en, c.name_ar AS category_name_ar,
                   b.name AS brand_name,
                   (SELECT MIN(price) FROM product_prices WHERE product_id = p.id) AS min_price
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
        ";

        if ($where) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $sql .= " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = DB_PDO->prepare($sql);
        $stmt->execute($params);
        json_exit($stmt->fetchAll());
        break;

    case 'product':
        $product_id = intval($_GET['id'] ?? 0);
        if (!$product_id) json_exit(['error' => 'Product ID is required'], 400);

        $stmt = DB_PDO->prepare("
            SELECT p.*, c.name_en AS category_name_en, c.name_ar AS category_name_ar,
                   b.name AS brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.id = ?
        ");
        $stmt->execute([$product_id]);
        $product = $stmt->fetch();
        if (!$product) json_exit(['error' => 'Product not found'], 404);

        // Specifications
        $stmt = DB_PDO->prepare("
            SELECT spec_key_en, spec_key_ar, spec_value_en, spec_value_ar
            FROM product_specifications
            WHERE product_id = ?
        ");
        $stmt->execute([$product_id]);
        $product['specifications'] = $stmt->fetchAll();

        // Prices
        $stmt = DB_PDO->prepare("
            SELECT store_name, price, currency_code, product_url, last_updated
            FROM product_prices
            WHERE product_id = ?
            ORDER BY price ASC
        ");
        $stmt->execute([$product_id]);
        $product['prices'] = $stmt->fetchAll();

        // Images
        $stmt = DB_PDO->prepare("
            SELECT image_url, alt_text_en, alt_text_ar
            FROM product_images
            WHERE product_id = ?
        ");
        $stmt->execute([$product_id]);
        $product['images'] = $stmt->fetchAll();

        // Reviews
        $stmt = DB_PDO->prepare("
            SELECT ur.id, ur.user_id, u.first_name, u.last_name, ur.rating, ur.comment, ur.created_at
            FROM user_reviews ur
            JOIN users u ON ur.user_id = u.id
            WHERE ur.product_id = ?
            ORDER BY ur.created_at DESC
        ");
        $stmt->execute([$product_id]);
        $reviews = $stmt->fetchAll();
        $product['reviews'] = $reviews;
        $product['review_count'] = count($reviews);
        $product['average_rating'] = $reviews ? round(array_sum(array_column($reviews, 'rating')) / count($reviews), 2) : null;

        // Q&A
        $stmt = DB_PDO->prepare("
            SELECT qa.id, qa.user_id, u.first_name, u.last_name, qa.question, qa.answer, qa.created_at
            FROM product_qa qa
            JOIN users u ON qa.user_id = u.id
            WHERE qa.product_id = ?
            ORDER BY qa.created_at DESC
        ");
        $stmt->execute([$product_id]);
        $product['qa'] = $stmt->fetchAll();

        json_exit($product);
        break;

    case 'page':
        $slug = trim($_GET['slug'] ?? '');
        if (!$slug) json_exit(['error' => 'Page slug is required'], 400);

        $stmt = DB_PDO->prepare("
            SELECT slug, title_en, title_ar, content_en, content_ar, updated_at
            FROM pages
            WHERE slug = ?
        ");
        $stmt->execute([$slug]);
        $page = $stmt->fetch();
        if (!$page) json_exit(['error' => 'Page not found'], 404);

        json_exit($page);
        break;

    case 'articles':
        $limit = max(1, intval($_GET['limit'] ?? 10));
        $offset = max(0, intval($_GET['offset'] ?? 0));

        $stmt = DB_PDO->prepare("
            SELECT id, slug, title_en, title_ar, image_url, created_at
            FROM articles
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        json_exit($stmt->fetchAll());
        break;

    case 'article':
        $slug = trim($_GET['slug'] ?? '');
        if (!$slug) json_exit(['error' => 'Article slug is required'], 400);

        $stmt = DB_PDO->prepare("
            SELECT slug, title_en, title_ar, content_en, content_ar, image_url, created_at, updated_at
            FROM articles
            WHERE slug = ?
        ");
        $stmt->execute([$slug]);
        $article = $stmt->fetch();
        if (!$article) json_exit(['error' => 'Article not found'], 404);

        json_exit($article);
        break;

    default:
        json_exit(['error' => 'Endpoint not found'], 404);
        break;
}
