<?php
/**
 * AI Chatbot API for CopRRA
 * Provides intelligent conversation capabilities with context awareness
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
if (!$rateLimiter->checkLimit('ai_chatbot', 100, 3600)) { // 100 requests per hour
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded. Please try again later.']);
    exit();
}

// Main request handler
$action = $_GET['action'] ?? 'chat';

switch ($action) {
    case 'chat':
        handleChat();
        break;
    case 'suggestions':
        handleSuggestions();
        break;
    case 'context':
        handleContext();
        break;
    case 'feedback':
        handleFeedback();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}

/**
 * Handle main chat functionality
 */
function handleChat() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Message is required']);
        return;
    }
    
    $message = trim($input['message']);
    $language = $input['language'] ?? 'ar';
    $mode = $input['mode'] ?? 'general';
    $context = $input['context'] ?? [];
    $userId = $input['user_id'] ?? null;
    
    if (empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'Message cannot be empty']);
        return;
    }
    
    try {
        // Log the conversation
        $conversationId = logConversation($userId, $message, $language, $mode);
        
        // Generate AI response
        $response = generateAIResponse($message, $language, $mode, $context);
        
        // Log the response
        logResponse($conversationId, $response['content'], $response['type'] ?? 'ai');
        
        // Update user preferences if available
        if ($userId) {
            updateUserPreferences($userId, $message, $response);
        }
        
        // Return response
        echo json_encode([
            'success' => true,
            'response' => $response,
            'conversation_id' => $conversationId,
            'timestamp' => date('c')
        ]);
        
    } catch (Exception $e) {
        error_log("AI Chatbot error: " . $e->getMessage());
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
    $limit = $input['limit'] ?? 5;
    
    if (empty($query)) {
        echo json_encode(['suggestions' => []]);
        return;
    }
    
    try {
        $suggestions = generateSuggestions($query, $language, $limit);
        echo json_encode(['suggestions' => $suggestions]);
    } catch (Exception $e) {
        error_log("Suggestions error: " . $e->getMessage());
        echo json_encode(['suggestions' => []]);
    }
}

/**
 * Handle context retrieval
 */
function handleContext() {
    global $pdo;
    
    $userId = $_GET['user_id'] ?? null;
    $limit = $_GET['limit'] ?? 10;
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        return;
    }
    
    try {
        $context = getConversationContext($userId, $limit);
        echo json_encode(['context' => $context]);
    } catch (Exception $e) {
        error_log("Context error: " . $e->getMessage());
        echo json_encode(['context' => []]);
    }
}

/**
 * Handle user feedback
 */
function handleFeedback() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $conversationId = $input['conversation_id'] ?? null;
    $rating = $input['rating'] ?? null;
    $feedback = $input['feedback'] ?? '';
    
    if (!$conversationId || !$rating) {
        http_response_code(400);
        echo json_encode(['error' => 'Conversation ID and rating are required']);
        return;
    }
    
    try {
        saveFeedback($conversationId, $rating, $feedback);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log("Feedback error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save feedback']);
    }
}

/**
 * Generate AI response based on message and context
 */
function generateAIResponse($message, $language, $mode, $context) {
    // Analyze message intent
    $intent = analyzeIntent($message, $language);
    
    // Get relevant context
    $relevantContext = getRelevantContext($intent, $context);
    
    // Generate response based on intent and mode
    switch ($mode) {
        case 'shopping':
            return generateShoppingResponse($message, $intent, $relevantContext, $language);
        case 'support':
            return generateSupportResponse($message, $intent, $relevantContext, $language);
        default:
            return generateGeneralResponse($message, $intent, $relevantContext, $language);
    }
}

/**
 * Analyze message intent using NLP techniques
 */
function analyzeIntent($message, $language) {
    $message = strtolower($message);
    
    // Shopping intent patterns
    $shoppingPatterns = [
        'ar' => ['اشتري', 'شراء', 'سعر', 'منتج', 'عرض', 'تخفيض', 'مقارنة', 'أفضل'],
        'en' => ['buy', 'purchase', 'price', 'product', 'deal', 'discount', 'compare', 'best']
    ];
    
    // Support intent patterns
    $supportPatterns = [
        'ar' => ['مشكلة', 'خطأ', 'مساعدة', 'دعم', 'عطل', 'لا يعمل', 'كيف'],
        'en' => ['problem', 'error', 'help', 'support', 'broken', 'not working', 'how']
    ];
    
    // Search intent patterns
    $searchPatterns = [
        'ar' => ['ابحث', 'أريد', 'أحتاج', 'أين', 'كيف', 'ما هو'],
        'en' => ['search', 'want', 'need', 'where', 'how', 'what is']
    ];
    
    $patterns = $shoppingPatterns[$language] ?? $shoppingPatterns['ar'];
    
    foreach ($patterns as $pattern) {
        if (strpos($message, $pattern) !== false) {
            return 'shopping';
        }
    }
    
    $patterns = $supportPatterns[$language] ?? $supportPatterns['ar'];
    foreach ($patterns as $pattern) {
        if (strpos($message, $pattern) !== false) {
            return 'support';
        }
    }
    
    $patterns = $searchPatterns[$language] ?? $searchPatterns['ar'];
    foreach ($patterns as $pattern) {
        if (strpos($message, $pattern) !== false) {
            return 'search';
        }
    }
    
    return 'general';
}

/**
 * Generate shopping-focused response
 */
function generateShoppingResponse($message, $intent, $context, $language) {
    $responses = [
        'ar' => [
            'search' => [
                'content' => 'أرى أنك تبحث عن منتج! يمكنني مساعدتك في العثور على أفضل العروض. ما الذي تبحث عنه تحديداً؟',
                'suggestions' => ['أبحث عن هاتف ذكي', 'أريد لابتوب', 'أحتاج سماعات', 'أرني التخفيضات']
            ],
            'compare' => [
                'content' => 'ممتاز! لمقارنة المنتجات، يمكنك إضافة المنتجات إلى قائمة المقارنة. سأوضح لك كيفية القيام بذلك.',
                'suggestions' => ['كيف أضيف منتج للمقارنة؟', 'أريد مقارنة 3 منتجات', 'كيف أرى الفروق؟']
            ],
            'price' => [
                'content' => 'أرى أنك مهتم بالأسعار! موقعنا يتتبع الأسعار من مختلف المتاجر ويوفر لك أفضل العروض.',
                'suggestions' => ['أرني التخفيضات', 'أفضل الأسعار', 'تتبع السعر', 'تنبيهات السعر']
            ],
            'general' => [
                'content' => 'أهلاً بك في وضع التسوق! سأساعدك في العثور على أفضل المنتجات والعروض. ما الذي تحتاجه؟',
                'suggestions' => ['أريد مساعدة في التسوق', 'أرني أحدث المنتجات', 'أفضل العروض', 'توصيات شخصية']
            ]
        ],
        'en' => [
            'search' => [
                'content' => 'I see you\'re looking for a product! I can help you find the best deals. What specifically are you looking for?',
                'suggestions' => ['I\'m looking for a smartphone', 'I want a laptop', 'I need headphones', 'Show me discounts']
            ],
            'compare' => [
                'content' => 'Great! To compare products, you can add products to your comparison list. Let me show you how.',
                'suggestions' => ['How do I add a product to compare?', 'I want to compare 3 products', 'How do I see differences?']
            ],
            'price' => [
                'content' => 'I see you\'re interested in prices! Our site tracks prices from different stores and provides you with the best deals.',
                'suggestions' => ['Show me discounts', 'Best prices', 'Price tracking', 'Price alerts']
            ],
            'general' => [
                'content' => 'Welcome to shopping mode! I\'ll help you find the best products and deals. What do you need?',
                'suggestions' => ['I need help with shopping', 'Show me latest products', 'Best deals', 'Personal recommendations']
            ]
        ]
    ];
    
    $langResponses = $responses[$language] ?? $responses['ar'];
    $response = $langResponses[$intent] ?? $langResponses['general'];
    
    return [
        'content' => $response['content'],
        'suggestions' => $response['suggestions'],
        'type' => 'shopping',
        'intent' => $intent
    ];
}

/**
 * Generate support-focused response
 */
function generateSupportResponse($message, $intent, $context, $language) {
    $responses = [
        'ar' => [
            'content' => 'أهلاً بك في وضع الدعم الفني! كيف يمكنني مساعدتك في حل مشكلتك؟',
            'suggestions' => ['مشكلة في التسجيل', 'لا يمكنني الدخول', 'مشكلة في الدفع', 'أحتاج مساعدة تقنية']
        ],
        'en' => [
            'content' => 'Welcome to support mode! How can I help you solve your problem?',
            'suggestions' => ['Registration problem', 'I can\'t log in', 'Payment issue', 'I need technical help']
        ]
    ];
    
    $response = $responses[$language] ?? $responses['ar'];
    
    return [
        'content' => $response['content'],
        'suggestions' => $response['suggestions'],
        'type' => 'support',
        'intent' => $intent
    ];
}

/**
 * Generate general response
 */
function generateGeneralResponse($message, $intent, $context, $language) {
    $responses = [
        'ar' => [
            'content' => 'أهلاً بك! أنا المساعد الذكي لموقع CopRRA. كيف يمكنني مساعدتك اليوم؟',
            'suggestions' => ['كيف أستخدم الموقع؟', 'أرني الميزات الجديدة', 'أحتاج مساعدة عامة', 'أريد معرفة المزيد']
        ],
        'en' => [
            'content' => 'Hello! I\'m the AI assistant for CopRRA. How can I help you today?',
            'suggestions' => ['How do I use the site?', 'Show me new features', 'I need general help', 'I want to learn more']
        ]
    ];
    
    $response = $responses[$language] ?? $responses['ar'];
    
    return [
        'content' => $response['content'],
        'suggestions' => $response['suggestions'],
        'type' => 'general',
        'intent' => $intent
    ];
}

/**
 * Generate smart suggestions
 */
function generateSuggestions($query, $language, $limit) {
    $suggestions = [];
    
    // Base suggestions
    $baseSuggestions = [
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
    
    $langSuggestions = $baseSuggestions[$language] ?? $baseSuggestions['ar'];
    
    // Filter suggestions based on query
    foreach ($langSuggestions as $suggestion) {
        if (strpos(strtolower($suggestion), strtolower($query)) !== false) {
            $suggestions[] = $suggestion;
            if (count($suggestions) >= $limit) break;
        }
    }
    
    // Add query-based suggestions
    if (count($suggestions) < $limit) {
        $querySuggestions = [
            $query . ' رخيص',
            $query . ' عالي الجودة',
            $query . ' أحدث موديل',
            $query . ' أفضل سعر'
        ];
        
        foreach ($querySuggestions as $suggestion) {
            if (count($suggestions) >= $limit) break;
            $suggestions[] = $suggestion;
        }
    }
    
    return array_slice($suggestions, 0, $limit);
}

/**
 * Get relevant context for response generation
 */
function getRelevantContext($intent, $context) {
    $relevant = [];
    
    foreach ($context as $item) {
        if (isset($item['message']) && isset($item['type'])) {
            if ($item['type'] === 'user' && $intent === 'shopping') {
                $relevant[] = $item;
            }
        }
    }
    
    return array_slice($relevant, -3); // Last 3 relevant messages
}

/**
 * Log conversation for analysis
 */
function logConversation($userId, $message, $language, $mode) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_conversations (user_id, message, language, mode, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([$userId, $message, $language, $mode]);
    return $pdo->lastInsertId();
}

/**
 * Log AI response
 */
function logResponse($conversationId, $response, $type) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_responses (conversation_id, response, type, created_at)
        VALUES (?, ?, ?, NOW())
    ");
    
    $stmt->execute([$conversationId, $response, $type]);
}

/**
 * Get conversation context for user
 */
function getConversationContext($userId, $limit) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT c.message, c.mode, c.created_at, r.response, r.type
        FROM ai_conversations c
        LEFT JOIN ai_responses r ON c.id = r.conversation_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
        LIMIT ?
    ");
    
    $stmt->execute([$userId, $limit]);
    return $stmt->fetchAll();
}

/**
 * Update user preferences based on conversation
 */
function updateUserPreferences($userId, $message, $response) {
    global $pdo;
    
    // Extract keywords and update preferences
    $keywords = extractKeywords($message);
    
    if (!empty($keywords)) {
        $stmt = $pdo->prepare("
            INSERT INTO user_preferences (user_id, keyword, interest_level, updated_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE 
            interest_level = interest_level + 1,
            updated_at = NOW()
        ");
        
        foreach ($keywords as $keyword) {
            $stmt->execute([$userId, $keyword]);
        }
    }
}

/**
 * Extract keywords from message
 */
function extractKeywords($message) {
    $keywords = [];
    
    // Simple keyword extraction (can be enhanced with NLP)
    $words = explode(' ', strtolower($message));
    $stopWords = ['أنا', 'أريد', 'أحتاج', 'كيف', 'ما', 'أين', 'متى', 'لماذا'];
    
    foreach ($words as $word) {
        $word = trim($word);
        if (strlen($word) > 2 && !in_array($word, $stopWords)) {
            $keywords[] = $word;
        }
    }
    
    return array_slice($keywords, 0, 5); // Max 5 keywords
}

/**
 * Save user feedback
 */
function saveFeedback($conversationId, $rating, $feedback) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        INSERT INTO ai_feedback (conversation_id, rating, feedback, created_at)
        VALUES (?, ?, ?, NOW())
    ");
    
    $stmt->execute([$conversationId, $rating, $feedback]);
}

// Close database connection
$pdo = null;
?>