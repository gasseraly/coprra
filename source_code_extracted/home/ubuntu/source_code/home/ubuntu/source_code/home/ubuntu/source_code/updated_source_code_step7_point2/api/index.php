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

$action = $_GET["action"] ?? "";

switch ($action) {
    case "test":
        echo json_encode(["message" => "API is working!", "timestamp" => time()]);
        break;

    case "languages":
        $sql = "SELECT code, name, native_name, flag FROM languages";
        $result = $conn->query($sql);
        $languages = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $languages[] = $row;
            }
        }
        echo json_encode($languages);
        break;

    case "currencies":
        $sql = "SELECT code, name, symbol, flag, country FROM currencies";
        $result = $conn->query($sql);
        $currencies = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $currencies[] = $row;
            }
        }
        echo json_encode($currencies);
        break;

    case "categories":
        $sql = "SELECT id, name_en, name_ar, slug, parent_id FROM categories";
        $result = $conn->query($sql);
        $categories = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $categories[] = $row;
            }
        }
        echo json_encode($categories);
        break;

    case "brands":
        $sql = "SELECT id, name, slug, logo_url FROM brands";
        $result = $conn->query($sql);
        $brands = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $brands[] = $row;
            }
        }
        echo json_encode($brands);
        break;

    case "products":
        $limit = isset($_GET["limit"]) ? intval($_GET["limit"]) : 20;
        $offset = isset($_GET["offset"]) ? intval($_GET["offset"]) : 0;
        $category_id = isset($_GET["category_id"]) ? intval($_GET["category_id"]) : null;
        $brand_id = isset($_GET["brand_id"]) ? intval($_GET["brand_id"]) : null;
        
        $sql = "SELECT p.id, p.name_en, p.name_ar, p.slug, p.description_en, p.description_ar, 
                       p.main_image_url, c.name_en as category_name_en, c.name_ar as category_name_ar,
                       b.name as brand_name
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN brands b ON p.brand_id = b.id";
        
        $where_conditions = [];
        if ($category_id) {
            $where_conditions[] = "p.category_id = " . $category_id;
        }
        if ($brand_id) {
            $where_conditions[] = "p.brand_id = " . $brand_id;
        }
        
        if (!empty($where_conditions)) {
            $sql .= " WHERE " . implode(" AND ", $where_conditions);
        }
        
        $sql .= " ORDER BY p.created_at DESC LIMIT $limit OFFSET $offset";
        
        $result = $conn->query($sql);
        $products = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
        }
        echo json_encode($products);
        break;

    case "product":
        $product_id = isset($_GET["id"]) ? intval($_GET["id"]) : null;
        if (!$product_id) {
            http_response_code(400);
            echo json_encode(["error" => "Product ID is required"]);
            break;
        }
        
        // Get product details
        $sql = "SELECT p.*, c.name_en as category_name_en, c.name_ar as category_name_ar,
                       b.name as brand_name
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN brands b ON p.brand_id = b.id
                WHERE p.id = $product_id";
        
        $result = $conn->query($sql);
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            break;
        }
        
        $product = $result->fetch_assoc();
        
        // Get product specifications
        $spec_sql = "SELECT spec_key_en, spec_key_ar, spec_value_en, spec_value_ar 
                     FROM product_specifications WHERE product_id = $product_id";
        $spec_result = $conn->query($spec_sql);
        $specifications = [];
        if ($spec_result->num_rows > 0) {
            while($spec_row = $spec_result->fetch_assoc()) {
                $specifications[] = $spec_row;
            }
        }
        $product['specifications'] = $specifications;
        
        // Get product prices
        $price_sql = "SELECT store_name, price, currency_code, product_url, last_updated 
                      FROM product_prices WHERE product_id = $product_id";
        $price_result = $conn->query($price_sql);
        $prices = [];
        if ($price_result->num_rows > 0) {
            while($price_row = $price_result->fetch_assoc()) {
                $prices[] = $price_row;
            }
        }
        $product['prices'] = $prices;
        
        // Get product images
        $image_sql = "SELECT image_url, alt_text_en, alt_text_ar 
                      FROM product_images WHERE product_id = $product_id";
        $image_result = $conn->query($image_sql);
        $images = [];
        if ($image_result->num_rows > 0) {
            while($image_row = $image_result->fetch_assoc()) {
                $images[] = $image_row;
            }
        }
        $product['images'] = $images;
        
        echo json_encode($product);
        break;

    case "page":
        $page_slug = $_GET["slug"] ?? "";
        if (!$page_slug) {
            http_response_code(400);
            echo json_encode(["error" => "Page slug is required"]);
            break;
        }
        
        $sql = "SELECT slug, title_en, title_ar, content_en, content_ar, updated_at 
                FROM pages WHERE slug = '" . $conn->real_escape_string($page_slug) . "'";
        $result = $conn->query($sql);
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Page not found"]);
            break;
        }
        
        $page = $result->fetch_assoc();
        echo json_encode($page);
        break;

    case "articles":
        $limit = isset($_GET["limit"]) ? intval($_GET["limit"]) : 10;
        $offset = isset($_GET["offset"]) ? intval($_GET["offset"]) : 0;
        
        $sql = "SELECT id, slug, title_en, title_ar, image_url, created_at 
                FROM articles ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
        
        $result = $conn->query($sql);
        $articles = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                $articles[] = $row;
            }
        }
        echo json_encode($articles);
        break;

    case "article":
        $article_slug = $_GET["slug"] ?? "";
        if (!$article_slug) {
            http_response_code(400);
            echo json_encode(["error" => "Article slug is required"]);
            break;
        }
        
        $sql = "SELECT slug, title_en, title_ar, content_en, content_ar, image_url, created_at, updated_at 
                FROM articles WHERE slug = '" . $conn->real_escape_string($article_slug) . "'";
        $result = $conn->query($sql);
        
        if ($result->num_rows === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Article not found"]);
            break;
        }
        
        $article = $result->fetch_assoc();
        echo json_encode($article);
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found."]);
        break;
}

$conn->close();
?>

