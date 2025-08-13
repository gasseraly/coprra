<?php
/**
 * AI Smart Search API for CopRRA
 * Provides intelligent search capabilities with spell correction and smart suggestions
 * 
 * @author CopRRA Team
 * @version 1.0.0
 * @license MIT
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load configuration
require_once '../config_secure.php';

// Initialize database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Rate limiting
require_once 'rate_limiter.php';
$rateLimiter = new RateLimiter();
if (!$rateLimiter->checkLimit('ai_search', 200, 3600)) { // 200 requests per hour
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded. Please try again later.']);
    exit();
}

// Main request handler
$action = $_GET['action'] ?? 'search';

switch ($action) {
    case 'search':
        handleSearch();
        break;
    case 'suggestions':
        handleSuggestions();
        break;
    case 'trending':
        handleTrending();
        break;
    case 'categories':
        handleCategories();
        break;
    case 'spellcheck':
        handleSpellCheck();
        break;
    case 'autocomplete':
        handleAutocomplete();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

/**
 * Handle main search functionality
 */
function handleSearch() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['query'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Query is required']);
        return;
    }
    
    $query = trim($input['query']);
    $language = $input['language'] ?? 'ar';
    $filters = $input['filters'] ?? [];
    $context = $input['context'] ?? [];
    $userId = $input['user_id'] ?? null;
    $page = $input['page'] ?? 1;
    $limit = $input['limit'] ?? 20;
    
    if (empty($query)) {
        echo json_encode(['results' => [], 'total' => 0, 'suggestions' => []]);
        return;
    }
    
    try {
        // Log search query
        $searchId = logSearchQuery($userId, $query, $language, $filters);
        
        // Spell check and correction
        $correctedQuery = spellCheck($query, $language);
        $isCorrected = $correctedQuery !== $query;
        
        // Generate search suggestions
        $suggestions = generateSearchSuggestions($query, $language, $correctedQuery);
        
        // Perform intelligent search
        $searchResults = performIntelligentSearch($correctedQuery, $filters, $language, $page, $limit);
        
        // Generate AI insights
        $aiInsights = generateAIInsights($query, $searchResults, $context, $language);
        
        // Update search analytics
        updateSearchAnalytics($searchId, $searchResults['total'], $isCorrected);
        
        // Return results
        echo json_encode([
            'success' => true,
            'results' => $searchResults['results'],
            'total' => $searchResults['total'],
            'page' => $page,
            'limit' => $limit,
            'corrected_query' => $correctedQuery,
            'is_corrected' => $isCorrected,
            'suggestions' => $suggestions,
            'ai_insights' => $aiInsights,
            'filters_applied' => $filters,
            'search_id' => $searchId,
            'timestamp' => date('c')
        ]);
        
    } catch (Exception $e) {
        error_log("AI Search error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Internal server error']);
    }
}

/**
 * Handle suggestions generation
 */
function handleSuggestions() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $query = $input['query'] ?? '';
    $language = $input['language'] ?? 'ar';
    $limit = $input['limit'] ?? 8;
    
    if (empty($query)) {
        echo json_encode(['suggestions' => []]);
        return;
    }
    
    try {
        $suggestions = generateSearchSuggestions($query, $language, $query, $limit);
        echo json_encode(['suggestions' => $suggestions]);
    } catch (Exception $e) {
        error_log("Suggestions error: " . $e->getMessage());
        echo json_encode(['suggestions' => []]);
    }
}

/**
 * Handle trending searches
 */
function handleTrending() {
    global $pdo;
    
    $language = $_GET['language'] ?? 'ar';
    $limit = $_GET['limit'] ?? 10;
    
    try {
        $trending = getTrendingSearches($language, $limit);
        echo json_encode(['trending' => $trending]);
    } catch (Exception $e) {
        error_log("Trending error: " . $e->getMessage());
        echo json_encode(['trending' => getDefaultTrending($language)]);
    }
}

/**
 * Handle categories
 */
function handleCategories() {
    global $pdo;
    
    $language = $_GET['language'] ?? 'ar';
    
    try {
        $categories = getPopularCategories($language);
        echo json_encode(['categories' => $categories]);
    } catch (Exception $e) {
        error_log("Categories error: " . $e->getMessage());
        echo json_encode(['categories' => []]);
    }
}

/**
 * Handle spell checking
 */
function handleSpellCheck() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $query = $input['query'] ?? '';
    $language = $input['language'] ?? 'ar';
    
    if (empty($query)) {
        echo json_encode(['corrected' => '', 'suggestions' => []]);
        return;
    }
    
    try {
        $corrected = spellCheck($query, $language);
        $suggestions = getSpellSuggestions($query, $language);
        
        echo json_encode([
            'original' => $query,
            'corrected' => $corrected,
            'suggestions' => $suggestions,
            'is_corrected' => $corrected !== $query
        ]);
    } catch (Exception $e) {
        error_log("Spell check error: " . $e->getMessage());
        echo json_encode(['corrected' => $query, 'suggestions' => []]);
    }
}

/**
 * Handle autocomplete
 */
function handleAutocomplete() {
    global $pdo;
    
    $query = $_GET['q'] ?? '';
    $language = $_GET['language'] ?? 'ar';
    $limit = $_GET['limit'] ?? 10;
    
    if (empty($query) || strlen($query) < 2) {
        echo json_encode(['suggestions' => []]);
        return;
    }
    
    try {
        $suggestions = getAutocompleteSuggestions($query, $language, $limit);
        echo json_encode(['suggestions' => $suggestions]);
    } catch (Exception $e) {
        error_log("Autocomplete error: " . $e->getMessage());
        echo json_encode(['suggestions' => []]);
    }
}

/**
 * Perform intelligent search with AI enhancements
 */
function performIntelligentSearch($query, $filters, $language, $page, $limit) {
    global $pdo;
    
    $offset = ($page - 1) * $limit;
    
    // Build search query with filters
    $whereConditions = [];
    $params = [];
    
    // Basic search in multiple fields
    $searchFields = ['name', 'description', 'keywords', 'brand', 'category'];
    $searchConditions = [];
    
    foreach ($searchFields as $field) {
        $searchConditions[] = "$field LIKE ?";
        $params[] = "%$query%";
    }
    
    $whereConditions[] = "(" . implode(" OR ", $searchConditions) . ")";
    
    // Apply filters
    if (!empty($filters['category'])) {
        $whereConditions[] = "category_id = ?";
        $params[] = $filters['category'];
    }
    
    if (!empty($filters['brand'])) {
        $whereConditions[] = "brand LIKE ?";
        $params[] = "%{$filters['brand']}%";
    }
    
    if (!empty($filters['priceRange'])) {
        $priceRange = parsePriceRange($filters['priceRange']);
        if ($priceRange) {
            $whereConditions[] = "price BETWEEN ? AND ?";
            $params[] = $priceRange['min'];
            $params[] = $priceRange['max'];
        }
    }
    
    if (!empty($filters['rating'])) {
        $whereConditions[] = "rating >= ?";
        $params[] = $filters['rating'];
    }
    
    $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
    
    // Count total results
    $countSql = "SELECT COUNT(*) as total FROM products $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Get results with pagination
    $sql = "
        SELECT 
            p.*,
            c.name as category_name,
            AVG(r.rating) as avg_rating,
            COUNT(r.id) as review_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN reviews r ON p.id = r.product_id
        $whereClause
        GROUP BY p.id
        ORDER BY 
            CASE 
                WHEN p.name LIKE ? THEN 1
                WHEN p.description LIKE ? THEN 2
                ELSE 3
            END,
            p.rating DESC,
            p.created_at DESC
        LIMIT ? OFFSET ?
    ";
    
    // Add exact match priority parameters
    $params[] = $query;
    $params[] = $query;
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll();
    
    // Enhance results with AI insights
    $enhancedResults = enhanceResultsWithAI($results, $query, $language);
    
    return [
        'results' => $enhancedResults,
        'total' => $total
    ];
}

/**
 * Generate search suggestions
 */
function generateSearchSuggestions($query, $language, $correctedQuery = null, $limit = 8) {
    $suggestions = [];
    
    // Base suggestions based on query
    $baseSuggestions = [
        'ar' => [
            'أرخص',
            'أفضل جودة',
            'أحدث موديل',
            'تقييم عالي',
            'عروض خاصة',
            'مقارنة أسعار',
            'مراجعات العملاء',
            'توصيات'
        ],
        'en' => [
            'cheapest',
            'best quality',
            'latest model',
            'high rating',
            'special offers',
            'price comparison',
            'customer reviews',
            'recommendations'
        ]
    ];
    
    $langSuggestions = $baseSuggestions[$language] ?? $baseSuggestions['ar'];
    
    // Add query-based suggestions
    foreach ($langSuggestions as $suggestion) {
        $suggestions[] = $query . ' ' . $suggestion;
        if (count($suggestions) >= $limit) break;
    }
    
    // Add corrected query suggestions if different
    if ($correctedQuery && $correctedQuery !== $query) {
        $suggestions[] = $correctedQuery;
        $suggestions[] = $correctedQuery . ' ' . ($language === 'ar' ? 'أرخص' : 'cheapest');
    }
    
    // Add category suggestions
    $categorySuggestions = getCategorySuggestions($query, $language);
    foreach ($categorySuggestions as $category) {
        if (count($suggestions) >= $limit) break;
        $suggestions[] = $category;
    }
    
    return array_slice($suggestions, 0, $limit);
}

/**
 * Spell check functionality
 */
function spellCheck($query, $language) {
    // Simple spell check implementation
    // In production, you would integrate with a proper spell checking service
    
    $commonMistakes = [
        'ar' => [
            'هاتف' => ['هاتف', 'هاتفف', 'هاتففف'],
            'لابتوب' => ['لابتوب', 'لاب توب', 'لابتوبب'],
            'سماعات' => ['سماعات', 'سماعه', 'سماعهات'],
            'كاميرا' => ['كاميرا', 'كامير', 'كاميررا']
        ],
        'en' => [
            'smartphone' => ['smartphone', 'smart phone', 'smartfone'],
            'laptop' => ['laptop', 'labtop', 'laptob'],
            'headphones' => ['headphones', 'headphone', 'headfones'],
            'camera' => ['camera', 'camra', 'camerra']
        ]
    ];
    
    $langMistakes = $commonMistakes[$language] ?? $commonMistakes['ar'];
    
    foreach ($langMistakes as $correct => $mistakes) {
        if (in_array(strtolower($query), array_map('strtolower', $mistakes))) {
            return $correct;
        }
    }
    
    return $query;
}

/**
 * Get spell check suggestions
 */
function getSpellSuggestions($query, $language) {
    $suggestions = [];
    
    // Simple suggestion generation
    $baseSuggestions = [
        'ar' => ['هاتف ذكي', 'لابتوب', 'سماعات', 'كاميرا', 'ساعة ذكية'],
        'en' => ['smartphone', 'laptop', 'headphones', 'camera', 'smartwatch']
    ];
    
    $langSuggestions = $baseSuggestions[$language] ?? $baseSuggestions['ar'];
    
    foreach ($langSuggestions as $suggestion) {
        if (levenshtein(strtolower($query), strtolower($suggestion)) <= 3) {
            $suggestions[] = $suggestion;
        }
    }
    
    return array_slice($suggestions, 0, 5);
}

/**
 * Get trending searches
 */
function getTrendingSearches($language, $limit) {
    global $pdo;
    
    try {
        $sql = "
            SELECT query, COUNT(*) as search_count
            FROM search_queries
            WHERE language = ? 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY query
            ORDER BY search_count DESC
            LIMIT ?
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$language, $limit]);
        $trending = $stmt->fetchAll();
        
        return array_column($trending, 'query');
    } catch (Exception $e) {
        error_log("Error getting trending searches: " . $e->getMessage());
        return getDefaultTrending($language);
    }
}

/**
 * Get default trending searches
 */
function getDefaultTrending($language) {
    $defaults = [
        'ar' => [
            'هاتف ذكي',
            'لابتوب',
            'سماعات',
            'ساعة ذكية',
            'كاميرا',
            'ألعاب',
            'كتب',
            'ملابس'
        ],
        'en' => [
            'smartphone',
            'laptop',
            'headphones',
            'smartwatch',
            'camera',
            'games',
            'books',
            'clothing'
        ]
    ];
    
    return $defaults[$language] ?? $defaults['ar'];
}

/**
 * Get popular categories
 */
function getPopularCategories($language) {
    global $pdo;
    
    try {
        $sql = "
            SELECT c.id, c.name, c.name_en, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            GROUP BY c.id
            ORDER BY product_count DESC
            LIMIT 10
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $categories = $stmt->fetchAll();
        
        // Format for language
        $formatted = [];
        foreach ($categories as $category) {
            $formatted[] = [
                'id' => $category['id'],
                'name' => $language === 'ar' ? $category['name'] : $category['name_en'],
                'product_count' => $category['product_count']
            ];
        }
        
        return $formatted;
    } catch (Exception $e) {
        error_log("Error getting categories: " . $e->getMessage());
        return [];
    }
}

/**
 * Get autocomplete suggestions
 */
function getAutocompleteSuggestions($query, $language, $limit) {
    global $pdo;
    
    try {
        $sql = "
            SELECT DISTINCT name, name_en
            FROM products
            WHERE (name LIKE ? OR name_en LIKE ?)
            AND (name != '' OR name_en != '')
            ORDER BY 
                CASE 
                    WHEN name LIKE ? THEN 1
                    WHEN name_en LIKE ? THEN 2
                    ELSE 3
                END,
                name
            LIMIT ?
        ";
        
        $searchTerm = "%$query%";
        $exactTerm = "$query%";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm, $exactTerm, $exactTerm, $limit]);
        $results = $stmt->fetchAll();
        
        $suggestions = [];
        foreach ($results as $result) {
            $name = $language === 'ar' ? $result['name'] : $result['name_en'];
            if (!empty($name) && !in_array($name, $suggestions)) {
                $suggestions[] = $name;
            }
        }
        
        return array_slice($suggestions, 0, $limit);
    } catch (Exception $e) {
        error_log("Error getting autocomplete: " . $e->getMessage());
        return [];
    }
}

/**
 * Get category suggestions
 */
function getCategorySuggestions($query, $language) {
    global $pdo;
    
    try {
        $sql = "
            SELECT DISTINCT c.name, c.name_en
            FROM categories c
            WHERE (c.name LIKE ? OR c.name_en LIKE ?)
            LIMIT 5
        ";
        
        $searchTerm = "%$query%";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$searchTerm, $searchTerm]);
        $results = $stmt->fetchAll();
        
        $suggestions = [];
        foreach ($results as $result) {
            $name = $language === 'ar' ? $result['name'] : $result['name_en'];
            if (!empty($name)) {
                $suggestions[] = $name;
            }
        }
        
        return $suggestions;
    } catch (Exception $e) {
        error_log("Error getting category suggestions: " . $e->getMessage());
        return [];
    }
}

/**
 * Parse price range filter
 */
function parsePriceRange($priceRange) {
    if (empty($priceRange)) return null;
    
    $ranges = [
        'low' => ['min' => 0, 'max' => 100],
        'medium' => ['min' => 100, 'max' => 500],
        'high' => ['min' => 500, 'max' => 1000],
        'premium' => ['min' => 1000, 'max' => 999999]
    ];
    
    return $ranges[$priceRange] ?? null;
}

/**
 * Enhance results with AI insights
 */
function enhanceResultsWithAI($results, $query, $language) {
    foreach ($results as &$result) {
        // Add relevance score
        $result['relevance_score'] = calculateRelevanceScore($result, $query);
        
        // Add AI-powered insights
        $result['ai_insights'] = generateProductInsights($result, $language);
        
        // Add smart recommendations
        $result['smart_recommendations'] = generateSmartRecommendations($result, $language);
    }
    
    // Sort by relevance score
    usort($results, function($a, $b) {
        return $b['relevance_score'] <=> $a['relevance_score'];
    });
    
    return $results;
}

/**
 * Calculate relevance score for a product
 */
function calculateRelevanceScore($product, $query) {
    $score = 0;
    
    // Exact match in name
    if (stripos($product['name'], $query) !== false) {
        $score += 100;
    }
    
    // Partial match in name
    if (stripos($product['name'], $query) !== false) {
        $score += 50;
    }
    
    // Match in description
    if (stripos($product['description'], $query) !== false) {
        $score += 30;
    }
    
    // Match in keywords
    if (stripos($product['keywords'], $query) !== false) {
        $score += 40;
    }
    
    // Rating bonus
    $score += ($product['avg_rating'] ?? 0) * 2;
    
    // Review count bonus
    $score += min(($product['review_count'] ?? 0) / 10, 20);
    
    return $score;
}

/**
 * Generate AI insights for a product
 */
function generateProductInsights($product, $language) {
    $insights = [];
    
    // Price insights
    if (isset($product['price'])) {
        if ($product['price'] < 100) {
            $insights[] = $language === 'ar' ? 'سعر ممتاز' : 'Excellent price';
        } elseif ($product['price'] < 500) {
            $insights[] = $language === 'ar' ? 'سعر جيد' : 'Good price';
        }
    }
    
    // Rating insights
    if (isset($product['avg_rating']) && $product['avg_rating'] >= 4.5) {
        $insights[] = $language === 'ar' ? 'تقييم ممتاز' : 'Excellent rating';
    }
    
    // Popularity insights
    if (isset($product['review_count']) && $product['review_count'] > 100) {
        $insights[] = $language === 'ar' ? 'منتج شائع' : 'Popular product';
    }
    
    return $insights;
}

/**
 * Generate smart recommendations
 */
function generateSmartRecommendations($product, $language) {
    $recommendations = [];
    
    // Category-based recommendations
    if (isset($product['category_name'])) {
        $recommendations[] = $language === 'ar' ? 
            "شاهد المزيد من {$product['category_name']}" : 
            "See more {$product['category_name']}";
    }
    
    // Price-based recommendations
    if (isset($product['price'])) {
        if ($product['price'] > 500) {
            $recommendations[] = $language === 'ar' ? 'ابحث عن بدائل أرخص' : 'Look for cheaper alternatives';
        }
    }
    
    return $recommendations;
}

/**
 * Generate AI insights for search results
 */
function generateAIInsights($query, $searchResults, $context, $language) {
    $insights = [];
    
    if ($searchResults['total'] === 0) {
        $insights['message'] = $language === 'ar' ? 
            'لم نجد نتائج لبحثك. جرب كلمات بحث مختلفة أو استخدم مرشحات أقل صرامة.' :
            'We didn\'t find results for your search. Try different search terms or use less strict filters.';
        
        $insights['suggestions'] = [
            $language === 'ar' ? 'جرب كلمات بحث أبسط' : 'Try simpler search terms',
            $language === 'ar' ? 'تحقق من التهجئة' : 'Check spelling',
            $language === 'ar' ? 'استخدم مرشحات أقل' : 'Use fewer filters'
        ];
    } elseif ($searchResults['total'] < 5) {
        $insights['message'] = $language === 'ar' ? 
            'وجدنا عدد قليل من النتائج. جرب توسيع نطاق البحث للحصول على المزيد من الخيارات.' :
            'We found few results. Try expanding your search scope for more options.';
        
        $insights['suggestions'] = [
            $language === 'ar' ? 'أزل بعض المرشحات' : 'Remove some filters',
            $language === 'ar' ? 'جرب كلمات بحث عامة' : 'Try general search terms',
            $language === 'ar' ? 'ابحث في فئات أخرى' : 'Search in other categories'
        ];
    } else {
        $insights['message'] = $language === 'ar' ? 
            'وجدنا العديد من النتائج! استخدم المرشحات لتصفية النتائج حسب احتياجاتك.' :
            'We found many results! Use filters to narrow down results based on your needs.';
        
        $insights['suggestions'] = [
            $language === 'ar' => 'استخدم مرشحات السعر' : 'Use price filters',
            $language === 'ar' => 'رتب حسب التقييم' : 'Sort by rating',
            $language === 'ar' => 'رتب حسب السعر' : 'Sort by price'
        ];
    }
    
    return $insights;
}

/**
 * Log search query for analytics
 */
function logSearchQuery($userId, $query, $language, $filters) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        INSERT INTO search_queries (user_id, query, language, filters, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    $filtersJson = json_encode($filters);
    $stmt->execute([$userId, $query, $language, $filtersJson]);
    return $pdo->lastInsertId();
}

/**
 * Update search analytics
 */
function updateSearchAnalytics($searchId, $resultCount, $isCorrected) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        UPDATE search_queries 
        SET result_count = ?, is_corrected = ?, updated_at = NOW()
        WHERE id = ?
    ");
    
    $stmt->execute([$resultCount, $isCorrected ? 1 : 0, $searchId]);
}

// Close database connection
$pdo = null;
?>