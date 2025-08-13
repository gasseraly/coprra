<?php
/**
 * ai_chatbot.php - نظام المحادثة الذكية المتكامل
 * يدعم الرد الفوري، البحث، الإرشاد، والتوصيات
 * 
 * الميزات:
 * - محادثة ذكية 24/7
 * - فهم اللغة الطبيعية
 * - البحث والتوصيات
 * - دعم متعدد اللغات
 * - تحليل المشاعر
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/AIHelper.php';

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

class AIChatbot {
    private $pdo;
    private $aiHelper;
    private $sessionId;
    private $userId;
    private $language;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->aiHelper = new AIHelper();
        $this->sessionId = $_SESSION['session_id'] ?? uniqid('chat_', true);
        $this->userId = $_SESSION['user_id'] ?? null;
        $this->language = $_GET['lang'] ?? 'en';
    }
    
    /**
     * معالجة رسالة المستخدم والرد عليها
     */
    public function processMessage($message, $context = []) {
        try {
            $startTime = microtime(true);
            
            // تنظيف وتحليل الرسالة
            $cleanMessage = $this->sanitizeMessage($message);
            $intent = $this->detectIntent($cleanMessage);
            $entities = $this->extractEntities($cleanMessage);
            
            // حفظ رسالة المستخدم
            $conversationId = $this->getOrCreateConversation();
            $this->saveMessage($conversationId, 'user', $cleanMessage, [
                'intent' => $intent,
                'entities' => $entities,
                'context' => $context
            ]);
            
            // إنشاء الرد
            $response = $this->generateResponse($intent, $entities, $cleanMessage, $context);
            
            // حفظ رد الذكاء الاصطناعي
            $responseTime = (microtime(true) - $startTime) * 1000;
            $this->saveMessage($conversationId, 'ai', $response['message'], [
                'intent' => $intent,
                'confidence' => $response['confidence'],
                'actions' => $response['actions'] ?? [],
                'response_time_ms' => $responseTime
            ]);
            
            return [
                'success' => true,
                'message' => $response['message'],
                'intent' => $intent,
                'actions' => $response['actions'] ?? [],
                'suggestions' => $response['suggestions'] ?? [],
                'confidence' => $response['confidence'],
                'response_time' => round($responseTime, 2),
                'session_id' => $this->sessionId
            ];
            
        } catch (Exception $e) {
            error_log("Chatbot Error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $this->getErrorMessage(),
                'error' => 'processing_error'
            ];
        }
    }
    
    /**
     * كشف نية المستخدم من الرسالة
     */
    private function detectIntent($message) {
        $intents = [
            // البحث عن المنتجات
            'product_search' => [
                'keywords' => ['بحث', 'أبحث', 'أريد', 'أحتاج', 'منتج', 'سعر', 'search', 'find', 'looking', 'need', 'want', 'product', 'price'],
                'patterns' => ['/أبحث عن/i', '/أريد منتج/i', '/find .+/i', '/search for/i']
            ],
            // مقارنة المنتجات
            'product_comparison' => [
                'keywords' => ['مقارنة', 'قارن', 'أفضل', 'أيهما', 'الفرق', 'compare', 'comparison', 'better', 'difference', 'versus'],
                'patterns' => ['/مقارنة بين/i', '/أيهما أفضل/i', '/compare .+ and/i']
            ],
            // معلومات المنتج
            'product_info' => [
                'keywords' => ['معلومات', 'تفاصيل', 'مواصفات', 'خصائص', 'info', 'details', 'specifications', 'features'],
                'patterns' => ['/معلومات عن/i', '/تفاصيل .+/i', '/tell me about/i']
            ],
            // المساعدة العامة
            'general_help' => [
                'keywords' => ['مساعدة', 'كيف', 'طريقة', 'help', 'how', 'way', 'assistance'],
                'patterns' => ['/كيف .+/i', '/طريقة .+/i', '/how to/i', '/help me/i']
            ],
            // التحية
            'greeting' => [
                'keywords' => ['مرحبا', 'أهلا', 'سلام', 'صباح', 'مساء', 'hello', 'hi', 'good morning', 'good evening'],
                'patterns' => ['/^(مرحبا|أهلا|hello|hi)/i']
            ],
            // الشكر
            'thanks' => [
                'keywords' => ['شكرا', 'شكراً', 'تسلم', 'thank', 'thanks', 'appreciate'],
                'patterns' => ['/شكر/i', '/thank/i']
            ],
            // الأسعار والعروض
            'price_inquiry' => [
                'keywords' => ['سعر', 'أسعار', 'تكلفة', 'ثمن', 'عرض', 'خصم', 'price', 'cost', 'offer', 'deal', 'discount'],
                'patterns' => ['/كم سعر/i', '/what.*price/i', '/how much/i']
            ],
            // التوصيات
            'recommendation' => [
                'keywords' => ['اقترح', 'انصح', 'توصية', 'recommend', 'suggest', 'advice'],
                'patterns' => ['/اقترح لي/i', '/recommend .+/i', '/suggest .+/i']
            ]
        ];
        
        $message = strtolower($message);
        $scores = [];
        
        foreach ($intents as $intent => $data) {
            $score = 0;
            
            // فحص الكلمات المفتاحية
            foreach ($data['keywords'] as $keyword) {
                if (strpos($message, strtolower($keyword)) !== false) {
                    $score += 1;
                }
            }
            
            // فحص الأنماط
            foreach ($data['patterns'] as $pattern) {
                if (preg_match($pattern, $message)) {
                    $score += 2;
                }
            }
            
            if ($score > 0) {
                $scores[$intent] = $score;
            }
        }
        
        if (empty($scores)) {
            return 'general_help';
        }
        
        arsort($scores);
        return array_key_first($scores);
    }
    
    /**
     * استخراج الكيانات من الرسالة
     */
    private function extractEntities($message) {
        $entities = [];
        
        // استخراج أسماء المنتجات/العلامات التجارية
        $brands = $this->getBrandNames();
        foreach ($brands as $brand) {
            if (stripos($message, $brand) !== false) {
                $entities['brands'][] = $brand;
            }
        }
        
        // استخراج الفئات
        $categories = $this->getCategoryNames();
        foreach ($categories as $category) {
            if (stripos($message, $category) !== false) {
                $entities['categories'][] = $category;
            }
        }
        
        // استخراج الأرقام (أسعار محتملة)
        preg_match_all('/\d+(?:\.\d+)?/', $message, $numbers);
        if (!empty($numbers[0])) {
            $entities['numbers'] = $numbers[0];
        }
        
        return $entities;
    }
    
    /**
     * إنشاء رد مناسب حسب النية
     */
    private function generateResponse($intent, $entities, $message, $context) {
        switch ($intent) {
            case 'greeting':
                return $this->handleGreeting();
                
            case 'product_search':
                return $this->handleProductSearch($entities, $message);
                
            case 'product_comparison':
                return $this->handleProductComparison($entities, $message);
                
            case 'product_info':
                return $this->handleProductInfo($entities, $message);
                
            case 'price_inquiry':
                return $this->handlePriceInquiry($entities, $message);
                
            case 'recommendation':
                return $this->handleRecommendation($entities, $message);
                
            case 'thanks':
                return $this->handleThanks();
                
            case 'general_help':
            default:
                return $this->handleGeneralHelp($message);
        }
    }
    
    /**
     * معالجة التحية
     */
    private function handleGreeting() {
        $greetings = [
            'ar' => [
                'مرحباً بك في CopRRA! 👋 كيف يمكنني مساعدتك اليوم؟',
                'أهلاً وسهلاً! أنا مساعدك الذكي في مقارنة الأسعار. ما الذي تبحث عنه؟',
                'مرحباً! أنا هنا لأساعدك في العثور على أفضل المنتجات والأسعار. كيف يمكنني خدمتك؟'
            ],
            'en' => [
                'Welcome to CopRRA! 👋 How can I help you today?',
                'Hello! I\'m your smart price comparison assistant. What are you looking for?',
                'Hi there! I\'m here to help you find the best products and prices. How can I assist you?'
            ]
        ];
        
        $messages = $greetings[$this->language] ?? $greetings['en'];
        $message = $messages[array_rand($messages)];
        
        return [
            'message' => $message,
            'confidence' => 0.9,
            'suggestions' => $this->getQuickActions(),
            'actions' => [
                ['type' => 'show_popular_products'],
                ['type' => 'show_categories']
            ]
        ];
    }
    
    /**
     * معالجة البحث عن المنتجات
     */
    private function handleProductSearch($entities, $message) {
        $searchQuery = $this->extractSearchQuery($message);
        $products = $this->searchProducts($searchQuery, $entities);
        
        if (empty($products)) {
            $message = $this->language === 'ar' 
                ? "لم أجد منتجات مطابقة لبحثك. هل يمكنك توضيح أكثر أو تجربة كلمات مختلفة؟"
                : "I couldn't find any products matching your search. Could you be more specific or try different keywords?";
                
            return [
                'message' => $message,
                'confidence' => 0.7,
                'suggestions' => $this->getSearchSuggestions($searchQuery),
                'actions' => [
                    ['type' => 'show_popular_products'],
                    ['type' => 'refine_search']
                ]
            ];
        }
        
        $count = count($products);
        $message = $this->language === 'ar'
            ? "وجدت {$count} منتج مطابق لبحثك. إليك أفضل النتائج:"
            : "Found {$count} products matching your search. Here are the best results:";
            
        return [
            'message' => $message,
            'confidence' => 0.9,
            'actions' => [
                ['type' => 'show_products', 'data' => array_slice($products, 0, 5)],
                ['type' => 'show_filters']
            ],
            'suggestions' => [
                $this->language === 'ar' ? 'مقارنة المنتجات' : 'Compare products',
                $this->language === 'ar' ? 'فلترة حسب السعر' : 'Filter by price',
                $this->language === 'ar' ? 'عرض التفاصيل' : 'View details'
            ]
        ];
    }
    
    /**
     * معالجة مقارنة المنتجات
     */
    private function handleProductComparison($entities, $message) {
        $products = $this->findProductsForComparison($entities, $message);
        
        if (count($products) < 2) {
            $message = $this->language === 'ar'
                ? "أحتاج منتجين على الأقل للمقارنة. هل يمكنك تحديد المنتجات التي تريد مقارنتها؟"
                : "I need at least two products to compare. Could you specify which products you'd like to compare?";
                
            return [
                'message' => $message,
                'confidence' => 0.6,
                'actions' => [
                    ['type' => 'request_products_for_comparison']
                ]
            ];
        }
        
        $comparison = $this->generateComparison($products);
        $message = $this->language === 'ar'
            ? "إليك مقارنة شاملة بين المنتجات:"
            : "Here's a comprehensive comparison of the products:";
            
        return [
            'message' => $message,
            'confidence' => 0.95,
            'actions' => [
                ['type' => 'show_comparison', 'data' => $comparison]
            ],
            'suggestions' => [
                $this->language === 'ar' ? 'عرض الأسعار' : 'View prices',
                $this->language === 'ar' ? 'قراءة المراجعات' : 'Read reviews'
            ]
        ];
    }
    
    /**
     * معالجة الاستفسار عن الأسعار
     */
    private function handlePriceInquiry($entities, $message) {
        $product = $this->identifyProduct($entities, $message);
        
        if (!$product) {
            $message = $this->language === 'ar'
                ? "هل يمكنك تحديد المنتج الذي تريد معرفة سعره؟"
                : "Could you specify which product you'd like to know the price of?";
                
            return [
                'message' => $message,
                'confidence' => 0.6
            ];
        }
        
        $prices = $this->getProductPrices($product['id']);
        $minPrice = min(array_column($prices, 'price'));
        $maxPrice = max(array_column($prices, 'price'));
        
        $message = $this->language === 'ar'
            ? "سعر {$product['name']} يتراوح من {$minPrice} إلى {$maxPrice}. إليك أفضل العروض:"
            : "The price of {$product['name']} ranges from {$minPrice} to {$maxPrice}. Here are the best deals:";
            
        return [
            'message' => $message,
            'confidence' => 0.9,
            'actions' => [
                ['type' => 'show_prices', 'data' => $prices],
                ['type' => 'set_price_alert']
            ]
        ];
    }
    
    /**
     * معالجة طلب التوصيات
     */
    private function handleRecommendation($entities, $message) {
        $preferences = $this->extractPreferences($message);
        $recommendations = $this->getAIRecommendations($preferences, $entities);
        
        $message = $this->language === 'ar'
            ? "بناءً على تفضيلاتك، أنصحك بهذه المنتجات:"
            : "Based on your preferences, I recommend these products:";
            
        return [
            'message' => $message,
            'confidence' => 0.85,
            'actions' => [
                ['type' => 'show_recommendations', 'data' => $recommendations]
            ],
            'suggestions' => [
                $this->language === 'ar' ? 'عرض المزيد' : 'Show more',
                $this->language === 'ar' ? 'تخصيص التوصيات' : 'Customize recommendations'
            ]
        ];
    }
    
    /**
     * الحصول على أو إنشاء محادثة
     */
    private function getOrCreateConversation() {
        $stmt = $this->pdo->prepare("
            SELECT id FROM ai_conversations 
            WHERE session_id = ? AND is_active = 1
        ");
        $stmt->execute([$this->sessionId]);
        $conversation = $stmt->fetch();
        
        if ($conversation) {
            return $conversation['id'];
        }
        
        // إنشاء محادثة جديدة
        $stmt = $this->pdo->prepare("
            INSERT INTO ai_conversations (session_id, user_id, language_code, conversation_context)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $this->sessionId,
            $this->userId,
            $this->language,
            json_encode(['created_at' => date('Y-m-d H:i:s')])
        ]);
        
        return $this->pdo->lastInsertId();
    }
    
    /**
     * حفظ رسالة في قاعدة البيانات
     */
    private function saveMessage($conversationId, $type, $content, $metadata = []) {
        $stmt = $this->pdo->prepare("
            INSERT INTO ai_messages (conversation_id, message_type, content, metadata, intent_detected, confidence_score, response_time_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $conversationId,
            $type,
            $content,
            json_encode($metadata),
            $metadata['intent'] ?? null,
            $metadata['confidence'] ?? null,
            $metadata['response_time_ms'] ?? null
        ]);
        
        // تحديث عداد الرسائل
        $this->pdo->prepare("
            UPDATE ai_conversations 
            SET total_messages = total_messages + 1, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ")->execute([$conversationId]);
    }
    
    /**
     * البحث عن المنتجات
     */
    private function searchProducts($query, $entities = []) {
        $whereConditions = ['p.is_active = 1'];
        $params = [];
        
        // البحث النصي
        if (!empty($query)) {
            $whereConditions[] = 'MATCH(p.name_en, p.name_ar, p.description_en, p.description_ar) AGAINST (? IN NATURAL LANGUAGE MODE)';
            $params[] = $query;
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
            $whereConditions[] = "c.name_en IN ($categoryPlaceholders) OR c.name_ar IN ($categoryPlaceholders)";
            $params = array_merge($params, $entities['categories'], $entities['categories']);
        }
        
        $sql = "
            SELECT p.id, p.name_en, p.name_ar, p.slug, p.main_image, 
                   p.min_price, p.rating, b.name as brand_name,
                   c.name_en as category_name_en, c.name_ar as category_name_ar
            FROM products p
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE " . implode(' AND ', $whereConditions) . "
            ORDER BY p.popularity_score DESC, p.rating DESC
            LIMIT 20
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * الحصول على أسماء العلامات التجارية
     */
    private function getBrandNames() {
        $stmt = $this->pdo->query("SELECT name FROM brands WHERE is_active = 1");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    /**
     * الحصول على أسماء الفئات
     */
    private function getCategoryNames() {
        $stmt = $this->pdo->query("SELECT name_en, name_ar FROM categories WHERE is_active = 1");
        $categories = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $categories[] = $row['name_en'];
            $categories[] = $row['name_ar'];
        }
        return $categories;
    }
    
    /**
     * الحصول على إجراءات سريعة
     */
    private function getQuickActions() {
        return $this->language === 'ar' ? [
            'البحث عن منتج',
            'مقارنة المنتجات',
            'أفضل العروض',
            'المنتجات الشائعة',
            'مساعدة في الاختيار'
        ] : [
            'Search for product',
            'Compare products',
            'Best deals',
            'Popular products',
            'Help me choose'
        ];
    }
    
    /**
     * رسالة خطأ عامة
     */
    private function getErrorMessage() {
        return $this->language === 'ar'
            ? 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.'
            : 'Sorry, there was an error processing your message. Please try again.';
    }
    
    /**
     * تنظيف الرسالة
     */
    private function sanitizeMessage($message) {
        return trim(strip_tags($message));
    }
    
    // المزيد من الوظائف المساعدة...
    private function extractSearchQuery($message) {
        // استخراج الاستعلام من الرسالة
        $patterns = [
            '/أبحث عن (.+)$/i',
            '/أريد (.+)$/i',
            '/search for (.+)$/i',
            '/find (.+)$/i',
            '/looking for (.+)$/i'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $message, $matches)) {
                return trim($matches[1]);
            }
        }
        
        return $message;
    }
    
    private function getSearchSuggestions($query) {
        // اقتراح كلمات بحث بديلة
        return $this->language === 'ar' ? [
            'جرب كلمات أخرى',
            'تصفح الفئات',
            'المنتجات الشائعة'
        ] : [
            'Try different keywords',
            'Browse categories',
            'Popular products'
        ];
    }
    
    private function handleThanks() {
        $messages = $this->language === 'ar' ? [
            'العفو! أنا سعيد لمساعدتك. هل تحتاج شيئاً آخر؟',
            'لا شكر على واجب! كيف يمكنني خدمتك أكثر؟'
        ] : [
            'You\'re welcome! I\'m happy to help. Do you need anything else?',
            'My pleasure! How else can I assist you?'
        ];
        
        return [
            'message' => $messages[array_rand($messages)],
            'confidence' => 0.9
        ];
    }
    
    private function handleGeneralHelp($message) {
        $helpMessage = $this->language === 'ar'
            ? 'يمكنني مساعدتك في:\n• البحث عن المنتجات\n• مقارنة الأسعار\n• العثور على أفضل العروض\n• التوصيات المخصصة\n\nما الذي تحتاجه تحديداً؟'
            : 'I can help you with:\n• Product search\n• Price comparison\n• Finding best deals\n• Personalized recommendations\n\nWhat specifically do you need?';
            
        return [
            'message' => $helpMessage,
            'confidence' => 0.8,
            'suggestions' => $this->getQuickActions()
        ];
    }
}

// معالجة الطلبات
try {
    $method = $_SERVER['REQUEST_METHOD'];
    $chatbot = new AIChatbot(DB_PDO);
    
    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['message'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Message is required']);
                exit;
            }
            
            $response = $chatbot->processMessage(
                $input['message'], 
                $input['context'] ?? []
            );
            
            echo json_encode($response);
            break;
            
        case 'GET':
            // الحصول على سجل المحادثة
            $sessionId = $_GET['session_id'] ?? null;
            if ($sessionId) {
                $response = $chatbot->getConversationHistory($sessionId);
                echo json_encode($response);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Session ID is required']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Chatbot API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>