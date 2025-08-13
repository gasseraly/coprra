<?php
/**
 * ai_search.php - نظام البحث الذكي المتطور
 * يدعم تصحيح الأخطاء الإملائية، البحث الصوتي، الاقتراحات الذكية
 * 
 * الميزات:
 * - فهم اللغة الطبيعية
 * - تصحيح الأخطاء الإملائية
 * - البحث الدلالي
 * - اقتراحات ذكية
 * - فلترة متقدمة
 * - ترتيب النتائج بالذكاء الاصطناعي
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/AIHelper.php';
require_once __DIR__ . '/../utils/SpellChecker.php';

header('Content-Type: application/json; charset=utf-8');

// CORS Headers
$allowed_origin = 'https://coprra.com';
header("Access-Control-Allow-Origin: {$allowed_origin}");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class AISmartSearch {
    private $pdo;
    private $aiHelper;
    private $spellChecker;
    private $language;
    private $userId;
    private $sessionId;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->aiHelper = new AIHelper();
        $this->spellChecker = new SpellChecker();
        $this->language = $_GET['lang'] ?? 'en';
        $this->userId = $_SESSION['user_id'] ?? null;
        $this->sessionId = $_SESSION['session_id'] ?? uniqid('search_', true);
    }
    
    /**
     * البحث الذكي الرئيسي
     */
    public function smartSearch($query, $filters = [], $options = []) {
        $startTime = microtime(true);
        
        try {
            // 1. تنظيف وتحليل الاستعلام
            $cleanQuery = $this->sanitizeQuery($query);
            $originalQuery = $cleanQuery;
            
            // 2. كشف اللغة
            $detectedLanguage = $this->detectLanguage($cleanQuery);
            
            // 3. تصحيح الأخطاء الإملائية
            $correctedQuery = $this->correctSpelling($cleanQuery, $detectedLanguage);
            $wasCorreted = ($correctedQuery !== $cleanQuery);
            
            // 4. تحليل القصد والكيانات
            $intent = $this->analyzeSearchIntent($correctedQuery);
            $entities = $this->extractEntities($correctedQuery);
            
            // 5. توسيع الاستعلام (مرادفات، مصطلحات ذات صلة)
            $expandedQuery = $this->expandQuery($correctedQuery, $entities, $detectedLanguage);
            
            // 6. البحث في قاعدة البيانات
            $searchResults = $this->performSearch($expandedQuery, $filters, $entities, $intent);
            
            // 7. ترتيب النتائج بالذكاء الاصطناعي
            $rankedResults = $this->rankResults($searchResults, $correctedQuery, $intent, $entities);
            
            // 8. إنشاء اقتراحات ذكية
            $suggestions = $this->generateSuggestions($correctedQuery, $entities, $searchResults);
            
            // 9. حفظ بيانات البحث للتحليل
            $processingTime = (microtime(true) - $startTime) * 1000;
            $this->logSearchQuery($originalQuery, $correctedQuery, $intent, $detectedLanguage, count($searchResults), $processingTime);
            
            return [
                'success' => true,
                'results' => $rankedResults,
                'query_info' => [
                    'original' => $originalQuery,
                    'corrected' => $correctedQuery,
                    'was_corrected' => $wasCorreted,
                    'detected_language' => $detectedLanguage,
                    'intent' => $intent,
                    'entities' => $entities
                ],
                'suggestions' => $suggestions,
                'total_results' => count($searchResults),
                'processing_time' => round($processingTime, 2),
                'filters_applied' => $filters
            ];
            
        } catch (Exception $e) {
            error_log("Smart Search Error: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'search_error',
                'message' => $this->language === 'ar' 
                    ? 'حدث خطأ في البحث. يرجى المحاولة مرة أخرى.'
                    : 'Search error occurred. Please try again.'
            ];
        }
    }
    
    /**
     * تصحيح الأخطاء الإملائية
     */
    private function correctSpelling($query, $language) {
        // قائمة بالأخطاء الشائعة والتصحيحات
        $corrections = [
            'ar' => [
                'ايفون' => 'آيفون',
                'سامسونك' => 'سامسونج',
                'سامسنك' => 'سامسونج',
                'كمبيوتر' => 'كمبيوتر',
                'لابتوب' => 'لاب توب',
                'موبايل' => 'موبايل',
                'تلفون' => 'تليفون',
                'تليفزيون' => 'تلفزيون',
                'اجهزه' => 'أجهزة',
                'منتاجات' => 'منتجات'
            ],
            'en' => [
                'iphone' => 'iPhone',
                'ipad' => 'iPad',
                'samsung' => 'Samsung',
                'laptop' => 'laptop',
                'computer' => 'computer',
                'smartphone' => 'smartphone',
                'headphones' => 'headphones',
                'televison' => 'television',
                'camara' => 'camera',
                'spekaer' => 'speaker'
            ]
        ];
        
        $langCorrections = $corrections[$language] ?? $corrections['en'];
        
        // تطبيق التصحيحات المباشرة
        foreach ($langCorrections as $wrong => $correct) {
            $query = str_ireplace($wrong, $correct, $query);
        }
        
        // تصحيح متقدم باستخدام خوارزمية Levenshtein للكلمات القريبة
        $words = explode(' ', $query);
        $correctedWords = [];
        
        foreach ($words as $word) {
            $correctedWord = $this->findClosestMatch($word, $this->getCommonTerms($language));
            $correctedWords[] = $correctedWord ?: $word;
        }
        
        return implode(' ', $correctedWords);
    }
    
    /**
     * العثور على أقرب تطابق للكلمة
     */
    private function findClosestMatch($word, $dictionary, $maxDistance = 2) {
        $word = strtolower($word);
        $bestMatch = null;
        $bestDistance = $maxDistance + 1;
        
        foreach ($dictionary as $term) {
            $distance = levenshtein($word, strtolower($term));
            if ($distance < $bestDistance) {
                $bestDistance = $distance;
                $bestMatch = $term;
            }
        }
        
        return $bestDistance <= $maxDistance ? $bestMatch : null;
    }
    
    /**
     * الحصول على المصطلحات الشائعة
     */
    private function getCommonTerms($language) {
        static $terms = [];
        
        if (!isset($terms[$language])) {
            // جلب المصطلحات من قاعدة البيانات
            $stmt = $this->pdo->query("
                SELECT DISTINCT name_en as term FROM products WHERE is_active = 1
                UNION
                SELECT DISTINCT name_ar as term FROM products WHERE is_active = 1
                UNION 
                SELECT DISTINCT name FROM brands WHERE is_active = 1
                UNION
                SELECT DISTINCT name_en as term FROM categories WHERE is_active = 1
                UNION
                SELECT DISTINCT name_ar as term FROM categories WHERE is_active = 1
            ");
            
            $terms[$language] = $stmt->fetchAll(PDO::FETCH_COLUMN);
        }
        
        return $terms[$language];
    }
    
    /**
     * كشف لغة الاستعلام
     */
    private function detectLanguage($query) {
        // فحص وجود أحرف عربية
        if (preg_match('/[\x{0600}-\x{06FF}]/u', $query)) {
            return 'ar';
        }
        
        // فحص وجود أحرف صينية
        if (preg_match('/[\x{4e00}-\x{9fff}]/u', $query)) {
            return 'zh';
        }
        
        // افتراضي: إنجليزية
        return 'en';
    }
    
    /**
     * تحليل قصد البحث
     */
    private function analyzeSearchIntent($query) {
        $query = strtolower($query);
        
        $intents = [
            'price_comparison' => ['price', 'cost', 'cheap', 'expensive', 'compare', 'سعر', 'ثمن', 'رخيص', 'غالي', 'مقارنة'],
            'product_specs' => ['specifications', 'specs', 'features', 'details', 'مواصفات', 'خصائص', 'تفاصيل'],
            'brand_search' => ['brand', 'make', 'manufacturer', 'علامة', 'ماركة', 'شركة'],
            'category_browse' => ['category', 'type', 'kind', 'فئة', 'نوع', 'قسم'],
            'deals_search' => ['deal', 'offer', 'discount', 'sale', 'عرض', 'خصم', 'تخفيض'],
            'reviews_search' => ['review', 'rating', 'opinion', 'مراجعة', 'تقييم', 'رأي']
        ];
        
        foreach ($intents as $intent => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($query, $keyword) !== false) {
                    return $intent;
                }
            }
        }
        
        return 'general_search';
    }
    
    /**
     * استخراج الكيانات من الاستعلام
     */
    private function extractEntities($query) {
        $entities = [
            'brands' => [],
            'categories' => [],
            'price_range' => null,
            'features' => [],
            'colors' => []
        ];
        
        // استخراج العلامات التجارية
        $brands = $this->getBrandsFromQuery($query);
        if (!empty($brands)) {
            $entities['brands'] = $brands;
        }
        
        // استخراج الفئات
        $categories = $this->getCategoriesFromQuery($query);
        if (!empty($categories)) {
            $entities['categories'] = $categories;
        }
        
        // استخراج النطاق السعري
        $priceRange = $this->extractPriceRange($query);
        if ($priceRange) {
            $entities['price_range'] = $priceRange;
        }
        
        // استخراج الألوان
        $colors = $this->extractColors($query);
        if (!empty($colors)) {
            $entities['colors'] = $colors;
        }
        
        return $entities;
    }
    
    /**
     * توسيع الاستعلام بالمرادفات
     */
    private function expandQuery($query, $entities, $language) {
        $synonyms = [
            'ar' => [
                'هاتف' => ['جوال', 'موبايل', 'تليفون'],
                'كمبيوتر' => ['لابتوب', 'حاسوب', 'جهاز كمبيوتر'],
                'تلفزيون' => ['تليفزيون', 'شاشة', 'تلفاز'],
                'سماعات' => ['سماعة', 'هيدفون', 'أذن']
            ],
            'en' => [
                'phone' => ['smartphone', 'mobile', 'cell'],
                'computer' => ['laptop', 'pc', 'desktop'],
                'tv' => ['television', 'display', 'monitor'],
                'headphones' => ['earphones', 'headset', 'earbuds']
            ]
        ];
        
        $langSynonyms = $synonyms[$language] ?? $synonyms['en'];
        $expandedTerms = [$query];
        
        foreach ($langSynonyms as $term => $syns) {
            if (stripos($query, $term) !== false) {
                foreach ($syns as $syn) {
                    $expandedTerms[] = str_ireplace($term, $syn, $query);
                }
            }
        }
        
        return $expandedTerms;
    }
    
    /**
     * تنفيذ البحث في قاعدة البيانات
     */
    private function performSearch($queries, $filters, $entities, $intent) {
        $allResults = [];
        
        foreach ($queries as $query) {
            $results = $this->searchInDatabase($query, $filters, $entities);
            $allResults = array_merge($allResults, $results);
        }
        
        // إزالة التكرار
        $uniqueResults = [];
        $seenIds = [];
        
        foreach ($allResults as $result) {
            if (!in_array($result['id'], $seenIds)) {
                $uniqueResults[] = $result;
                $seenIds[] = $result['id'];
            }
        }
        
        return $uniqueResults;
    }
    
    /**
     * البحث في قاعدة البيانات
     */
    private function searchInDatabase($query, $filters, $entities) {
        $whereConditions = ['p.is_active = 1'];
        $params = [];
        $joins = [
            'LEFT JOIN brands b ON p.brand_id = b.id',
            'LEFT JOIN categories c ON p.category_id = c.id'
        ];
        
        // البحث النصي
        if (!empty($query)) {
            $whereConditions[] = '(
                MATCH(p.name_en, p.name_ar, p.description_en, p.description_ar) AGAINST (? IN NATURAL LANGUAGE MODE)
                OR p.name_en LIKE ?
                OR p.name_ar LIKE ?
                OR b.name LIKE ?
                OR c.name_en LIKE ?
                OR c.name_ar LIKE ?
            )';
            $likeQuery = '%' . $query . '%';
            $params = array_merge($params, [$query, $likeQuery, $likeQuery, $likeQuery, $likeQuery, $likeQuery]);
        }
        
        // فلترة حسب العلامة التجارية
        if (!empty($entities['brands'])) {
            $brandPlaceholders = str_repeat('?,', count($entities['brands']) - 1) . '?';
            $whereConditions[] = "b.name IN ($brandPlaceholders)";
            $params = array_merge($params, $entities['brands']);
        }
        
        // فلترة حسب الفئة
        if (!empty($entities['categories'])) {
            $categoryPlaceholders = str_repeat('?,', count($entities['categories']) - 1) . '?';
            $whereConditions[] = "(c.name_en IN ($categoryPlaceholders) OR c.name_ar IN ($categoryPlaceholders))";
            $params = array_merge($params, $entities['categories'], $entities['categories']);
        }
        
        // فلترة حسب النطاق السعري
        if (!empty($entities['price_range'])) {
            if (isset($entities['price_range']['min'])) {
                $whereConditions[] = 'p.min_price >= ?';
                $params[] = $entities['price_range']['min'];
            }
            if (isset($entities['price_range']['max'])) {
                $whereConditions[] = 'p.max_price <= ?';
                $params[] = $entities['price_range']['max'];
            }
        }
        
        // فلاتر إضافية
        foreach ($filters as $key => $value) {
            switch ($key) {
                case 'min_price':
                    $whereConditions[] = 'p.min_price >= ?';
                    $params[] = $value;
                    break;
                case 'max_price':
                    $whereConditions[] = 'p.max_price <= ?';
                    $params[] = $value;
                    break;
                case 'min_rating':
                    $whereConditions[] = 'p.rating >= ?';
                    $params[] = $value;
                    break;
                case 'category_id':
                    $whereConditions[] = 'p.category_id = ?';
                    $params[] = $value;
                    break;
                case 'brand_id':
                    $whereConditions[] = 'p.brand_id = ?';
                    $params[] = $value;
                    break;
            }
        }
        
        $sql = "
            SELECT p.id, p.name_en, p.name_ar, p.slug, p.main_image, 
                   p.min_price, p.max_price, p.avg_price, p.rating, p.total_reviews,
                   p.view_count, p.popularity_score, p.is_featured, p.is_trending,
                   b.name as brand_name, b.logo_url as brand_logo,
                   c.name_en as category_name_en, c.name_ar as category_name_ar,
                   c.slug as category_slug,
                   " . (!empty($query) ? "MATCH(p.name_en, p.name_ar, p.description_en, p.description_ar) AGAINST (? IN NATURAL LANGUAGE MODE) as relevance_score" : "0 as relevance_score") . "
            FROM products p
            " . implode(' ', $joins) . "
            WHERE " . implode(' AND ', $whereConditions) . "
            ORDER BY 
                " . (!empty($query) ? "relevance_score DESC," : "") . "
                p.is_featured DESC,
                p.popularity_score DESC,
                p.rating DESC
            LIMIT 50
        ";
        
        if (!empty($query)) {
            array_unshift($params, $query);
        }
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * ترتيب النتائج بالذكاء الاصطناعي
     */
    private function rankResults($results, $query, $intent, $entities) {
        foreach ($results as &$result) {
            $score = 0;
            
            // نقاط التطابق النصي
            $score += $result['relevance_score'] ?? 0;
            
            // نقاط الشعبية
            $score += ($result['popularity_score'] / 100) * 10;
            
            // نقاط التقييم
            $score += $result['rating'] * 5;
            
            // نقاط إضافية للمنتجات المميزة
            if ($result['is_featured']) $score += 15;
            if ($result['is_trending']) $score += 10;
            
            // نقاط حسب القصد
            switch ($intent) {
                case 'price_comparison':
                    // تفضيل المنتجات ذات الأسعار المتنوعة
                    if ($result['max_price'] > $result['min_price']) {
                        $score += 5;
                    }
                    break;
                case 'deals_search':
                    // تفضيل المنتجات ذات الخصومات
                    if ($result['min_price'] < $result['avg_price']) {
                        $score += 10;
                    }
                    break;
                case 'reviews_search':
                    // تفضيل المنتجات ذات المراجعات الكثيرة
                    $score += ($result['total_reviews'] / 10);
                    break;
            }
            
            $result['ai_score'] = $score;
        }
        
        // ترتيب حسب النقاط
        usort($results, function($a, $b) {
            return $b['ai_score'] <=> $a['ai_score'];
        });
        
        return $results;
    }
    
    /**
     * إنشاء اقتراحات ذكية
     */
    private function generateSuggestions($query, $entities, $results) {
        $suggestions = [];
        
        // اقتراحات حسب النتائج
        if (count($results) > 0) {
            // اقتراح العلامات التجارية الشائعة
            $brands = array_unique(array_column($results, 'brand_name'));
            foreach (array_slice($brands, 0, 3) as $brand) {
                if (!empty($brand)) {
                    $suggestions[] = $query . ' ' . $brand;
                }
            }
            
            // اقتراح فئات ذات صلة
            $categories = array_unique(array_column($results, 'category_name_en'));
            foreach (array_slice($categories, 0, 2) as $category) {
                if (!empty($category)) {
                    $suggestions[] = $category;
                }
            }
        }
        
        // اقتراحات من الاستعلامات الشائعة
        $popularQueries = $this->getPopularQueries();
        foreach ($popularQueries as $popularQuery) {
            if (stripos($popularQuery, $query) !== false || stripos($query, $popularQuery) !== false) {
                $suggestions[] = $popularQuery;
            }
        }
        
        // إزالة التكرار وتحديد العدد
        $suggestions = array_unique($suggestions);
        return array_slice($suggestions, 0, 8);
    }
    
    /**
     * جلب الاستعلامات الشائعة
     */
    private function getPopularQueries() {
        $stmt = $this->pdo->query("
            SELECT original_query, COUNT(*) as frequency
            FROM ai_search_queries 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY original_query
            ORDER BY frequency DESC
            LIMIT 20
        ");
        
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    /**
     * حفظ بيانات البحث
     */
    private function logSearchQuery($original, $corrected, $intent, $language, $resultsCount, $processingTime) {
        $stmt = $this->pdo->prepare("
            INSERT INTO ai_search_queries (
                user_id, session_id, original_query, corrected_query, search_intent,
                language_detected, results_count, processing_time_ms, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $this->userId,
            $this->sessionId,
            $original,
            $corrected,
            $intent,
            $language,
            $resultsCount,
            $processingTime
        ]);
    }
    
    /**
     * تنظيف الاستعلام
     */
    private function sanitizeQuery($query) {
        return trim(strip_tags($query));
    }
    
    // وظائف مساعدة إضافية...
    private function getBrandsFromQuery($query) {
        $stmt = $this->pdo->query("SELECT name FROM brands WHERE is_active = 1");
        $brands = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $found = [];
        
        foreach ($brands as $brand) {
            if (stripos($query, $brand) !== false) {
                $found[] = $brand;
            }
        }
        
        return $found;
    }
    
    private function getCategoriesFromQuery($query) {
        $stmt = $this->pdo->query("SELECT name_en, name_ar FROM categories WHERE is_active = 1");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $found = [];
        
        foreach ($categories as $category) {
            if (stripos($query, $category['name_en']) !== false) {
                $found[] = $category['name_en'];
            }
            if (stripos($query, $category['name_ar']) !== false) {
                $found[] = $category['name_ar'];
            }
        }
        
        return array_unique($found);
    }
    
    private function extractPriceRange($query) {
        // البحث عن أنماط الأسعار
        $patterns = [
            '/(\d+)\s*-\s*(\d+)/',  // 100-500
            '/من\s*(\d+)\s*إلى\s*(\d+)/',  // من 100 إلى 500
            '/between\s*(\d+)\s*and\s*(\d+)/i',  // between 100 and 500
            '/under\s*(\d+)/i',  // under 500
            '/أقل\s*من\s*(\d+)/',  // أقل من 500
            '/over\s*(\d+)/i',  // over 100
            '/أكثر\s*من\s*(\d+)/'  // أكثر من 100
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $query, $matches)) {
                if (count($matches) >= 3) {
                    return ['min' => (int)$matches[1], 'max' => (int)$matches[2]];
                } elseif (strpos($pattern, 'under\|أقل') !== false) {
                    return ['max' => (int)$matches[1]];
                } elseif (strpos($pattern, 'over\|أكثر') !== false) {
                    return ['min' => (int)$matches[1]];
                }
            }
        }
        
        return null;
    }
    
    private function extractColors($query) {
        $colors = [
            'ar' => ['أسود', 'أبيض', 'أحمر', 'أزرق', 'أخضر', 'أصفر', 'بنفسجي', 'وردي', 'رمادي', 'بني'],
            'en' => ['black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gray', 'brown', 'silver', 'gold']
        ];
        
        $found = [];
        foreach ($colors as $lang => $colorList) {
            foreach ($colorList as $color) {
                if (stripos($query, $color) !== false) {
                    $found[] = $color;
                }
            }
        }
        
        return array_unique($found);
    }
}

// معالجة الطلبات
try {
    $search = new AISmartSearch(DB_PDO);
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = $_GET['q'] ?? $_GET['query'] ?? '';
        $filters = $_GET['filters'] ?? [];
        $options = $_GET['options'] ?? [];
        
        if (empty($query)) {
            http_response_code(400);
            echo json_encode(['error' => 'Query parameter is required']);
            exit;
        }
        
        $result = $search->smartSearch($query, $filters, $options);
        echo json_encode($result);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("AI Search Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>