-- =====================================================
-- CopRRA AI Enhanced Database Schema
-- Enhanced database structure for AI-powered features
-- Version: 1.0.0
-- Author: CopRRA Team
-- =====================================================

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `coprra_ai` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `coprra_ai`;

-- =====================================================
-- AI CONVERSATIONS TABLE
-- Stores user conversations with AI chatbot
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_conversations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `session_id` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `language` varchar(10) NOT NULL DEFAULT 'ar',
  `mode` enum('general','shopping','support') NOT NULL DEFAULT 'general',
  `intent` varchar(100) DEFAULT NULL,
  `confidence_score` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_language` (`language`),
  KEY `idx_mode` (`mode`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ai_conversations_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI RESPONSES TABLE
-- Stores AI responses to user messages
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_responses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint(20) unsigned NOT NULL,
  `response` text NOT NULL,
  `type` enum('ai','human','system') NOT NULL DEFAULT 'ai',
  `response_type` enum('text','suggestion','action','redirect') NOT NULL DEFAULT 'text',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ai_responses_conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI FEEDBACK TABLE
-- Stores user feedback on AI responses
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_feedback` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint(20) unsigned NOT NULL,
  `rating` tinyint(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `feedback` text DEFAULT NULL,
  `feedback_type` enum('helpful','not_helpful','incorrect','spam') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_feedback_type` (`feedback_type`),
  CONSTRAINT `fk_ai_feedback_conversation_id` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SEARCH QUERIES TABLE
-- Stores user search queries for analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS `search_queries` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `query` varchar(500) NOT NULL,
  `corrected_query` varchar(500) DEFAULT NULL,
  `language` varchar(10) NOT NULL DEFAULT 'ar',
  `filters` json DEFAULT NULL,
  `result_count` int(11) DEFAULT 0,
  `is_corrected` tinyint(1) DEFAULT 0,
  `search_time_ms` int(11) DEFAULT NULL,
  `clicked_results` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_query` (`query`(100)),
  KEY `idx_language` (`language`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_is_corrected` (`is_corrected`),
  CONSTRAINT `fk_search_queries_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- USER PREFERENCES TABLE
-- Stores user preferences and interests
-- =====================================================
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `keyword` varchar(255) NOT NULL,
  `interest_level` int(11) NOT NULL DEFAULT 1,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `preference_type` enum('search','browse','purchase','view') NOT NULL DEFAULT 'search',
  `last_interaction` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_keyword` (`user_id`, `keyword`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_interest_level` (`interest_level`),
  KEY `idx_preference_type` (`preference_type`),
  CONSTRAINT `fk_user_preferences_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_preferences_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI RECOMMENDATIONS TABLE
-- Stores AI-generated product recommendations
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_recommendations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `product_id` bigint(20) unsigned NOT NULL,
  `recommendation_type` enum('collaborative','content_based','contextual','trending') NOT NULL,
  `confidence_score` decimal(3,2) NOT NULL DEFAULT 0.00,
  `reason` varchar(500) DEFAULT NULL,
  `context` json DEFAULT NULL,
  `is_clicked` tinyint(1) DEFAULT 0,
  `is_purchased` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_recommendation_type` (`recommendation_type`),
  KEY `idx_confidence_score` (`confidence_score`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ai_recommendations_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_recommendations_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI CONTENT GENERATION TABLE
-- Stores AI-generated content
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_content_generation` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `content_type` enum('product_description','review_summary','blog_post','meta_description') NOT NULL,
  `original_content` text DEFAULT NULL,
  `generated_content` text NOT NULL,
  `language` varchar(10) NOT NULL DEFAULT 'ar',
  `target_language` varchar(10) DEFAULT NULL,
  `generation_prompt` text DEFAULT NULL,
  `quality_score` decimal(3,2) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `is_published` tinyint(1) DEFAULT 0,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_content_type` (`content_type`),
  KEY `idx_language` (`language`),
  KEY `idx_is_approved` (`is_approved`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ai_content_generation_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI IMAGE GENERATION TABLE
-- Stores AI-generated images
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_image_generation` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `product_id` bigint(20) unsigned DEFAULT NULL,
  `prompt` text NOT NULL,
  `generated_image_url` varchar(500) NOT NULL,
  `image_type` enum('product','banner','icon','thumbnail') NOT NULL DEFAULT 'product',
  `style` varchar(100) DEFAULT NULL,
  `dimensions` varchar(50) DEFAULT NULL,
  `quality_score` decimal(3,2) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `is_used` tinyint(1) DEFAULT 0,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_image_type` (`image_type`),
  KEY `idx_is_approved` (`is_approved`),
  CONSTRAINT `fk_ai_image_generation_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ai_image_generation_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI SHOPPING ASSISTANT TABLE
-- Stores shopping assistant interactions
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_shopping_assistant` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `session_id` varchar(255) NOT NULL,
  `query` text NOT NULL,
  `budget_range` varchar(100) DEFAULT NULL,
  `preferences` json DEFAULT NULL,
  `recommended_products` json DEFAULT NULL,
  `interaction_count` int(11) DEFAULT 1,
  `is_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_is_completed` (`is_completed`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_ai_shopping_assistant_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI SEO OPTIMIZATION TABLE
-- Stores AI-generated SEO content
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_seo_optimization` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `content_id` bigint(20) unsigned DEFAULT NULL,
  `content_type` enum('product','category','blog','page') NOT NULL,
  `original_title` varchar(255) DEFAULT NULL,
  `optimized_title` varchar(255) NOT NULL,
  `original_description` text DEFAULT NULL,
  `optimized_description` text NOT NULL,
  `keywords` json DEFAULT NULL,
  `seo_score` decimal(3,2) DEFAULT NULL,
  `suggestions` json DEFAULT NULL,
  `is_applied` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_content_id` (`content_id`),
  KEY `idx_content_type` (`content_type`),
  KEY `idx_seo_score` (`seo_score`),
  KEY `idx_is_applied` (`is_applied`),
  CONSTRAINT `fk_ai_seo_optimization_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI AFFILIATE INTEGRATION TABLE
-- Stores affiliate product data
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_affiliate_integration` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `affiliate_network` varchar(100) NOT NULL,
  `product_id` varchar(255) NOT NULL,
  `product_name` varchar(500) NOT NULL,
  `product_description` text DEFAULT NULL,
  `product_image_url` varchar(500) DEFAULT NULL,
  `product_url` varchar(500) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `review_count` int(11) DEFAULT 0,
  `availability` enum('in_stock','out_of_stock','limited') DEFAULT 'in_stock',
  `commission_rate` decimal(5,2) DEFAULT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_affiliate_product` (`affiliate_network`, `product_id`),
  KEY `idx_affiliate_network` (`affiliate_network`),
  KEY `idx_category` (`category`),
  KEY `idx_brand` (`brand`),
  KEY `idx_price` (`price`),
  KEY `idx_rating` (`rating`),
  KEY `idx_last_updated` (`last_updated`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- AI ANALYTICS TABLE
-- Stores AI performance analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS `ai_analytics` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `metric_name` varchar(100) NOT NULL,
  `metric_value` decimal(10,2) NOT NULL,
  `metric_unit` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `language` varchar(10) DEFAULT 'ar',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_date_metric_category` (`date`, `metric_name`, `category`),
  KEY `idx_date` (`date`),
  KEY `idx_metric_name` (`metric_name`),
  KEY `idx_category` (`category`),
  KEY `idx_language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample AI conversations
INSERT INTO `ai_conversations` (`session_id`, `message`, `language`, `mode`, `intent`, `confidence_score`) VALUES
('session_001', 'أريد شراء هاتف ذكي', 'ar', 'shopping', 'purchase', 0.95),
('session_002', 'كيف أقارن بين المنتجات؟', 'ar', 'general', 'help', 0.88),
('session_003', 'أحتاج مساعدة في التسجيل', 'ar', 'support', 'support', 0.92);

-- Insert sample AI responses
INSERT INTO `ai_responses` (`conversation_id`, `response`, `type`, `response_type`) VALUES
(1, 'أهلاً بك! سأساعدك في العثور على أفضل الهواتف الذكية. ما هو ميزانيتك؟', 'ai', 'text'),
(2, 'لمقارنة المنتجات، يمكنك إضافة المنتجات إلى قائمة المقارنة. سأوضح لك كيفية القيام بذلك.', 'ai', 'text'),
(3, 'أهلاً بك في وضع الدعم الفني! سأساعدك في حل مشكلة التسجيل. ما هي المشكلة تحديداً؟', 'ai', 'text');

-- Insert sample search queries
INSERT INTO `search_queries` (`query`, `language`, `result_count`, `is_corrected`) VALUES
('هاتف ذكي', 'ar', 15, 0),
('لابتوب', 'ar', 23, 0),
('سماعات', 'ar', 8, 0);

-- Insert sample user preferences
INSERT INTO `user_preferences` (`user_id`, `keyword`, `interest_level`, `preference_type`) VALUES
(1, 'هاتف ذكي', 5, 'search'),
(1, 'لابتوب', 3, 'browse'),
(2, 'سماعات', 4, 'purchase');

-- Insert sample AI recommendations
INSERT INTO `ai_recommendations` (`user_id`, `product_id`, `recommendation_type`, `confidence_score`, `reason`) VALUES
(1, 1, 'collaborative', 0.85, 'Based on similar user preferences'),
(1, 2, 'content_based', 0.78, 'Similar to previously viewed products'),
(2, 3, 'trending', 0.92, 'Currently popular among users');

-- Insert sample AI content generation
INSERT INTO `ai_content_generation` (`user_id`, `content_type`, `generated_content`, `language`, `quality_score`) VALUES
(1, 'product_description', 'هاتف ذكي متطور مع كاميرا عالية الدقة وشاشة عريضة', 'ar', 0.88),
(2, 'meta_description', 'أفضل الهواتف الذكية بأفضل الأسعار - مقارنة شاملة', 'ar', 0.92);

-- Insert sample AI image generation
INSERT INTO `ai_image_generation` (`user_id`, `product_id`, `prompt`, `generated_image_url`, `image_type`, `quality_score`) VALUES
(1, 1, 'Modern smartphone with high-quality camera', '/ai-generated/smartphone_001.jpg', 'product', 0.85),
(2, 2, 'Professional laptop for business use', '/ai-generated/laptop_001.jpg', 'product', 0.90);

-- Insert sample AI shopping assistant
INSERT INTO `ai_shopping_assistant` (`session_id`, `query`, `budget_range`, `preferences`) VALUES
('session_004', 'أريد هاتف ذكي بمواصفات عالية', '500-1000', '{"camera": "high", "battery": "long", "storage": "large"}'),
('session_005', 'أحتاج لابتوب للعمل', '1000-2000', '{"performance": "high", "portability": "medium", "battery": "long"}');

-- Insert sample AI SEO optimization
INSERT INTO `ai_seo_optimization` (`user_id`, `content_type`, `optimized_title`, `optimized_description`, `seo_score`) VALUES
(1, 'product', 'أفضل هاتف ذكي 2024 - مواصفات عالية وسعر ممتاز', 'اكتشف أفضل الهواتف الذكية لعام 2024 مع مواصفات متطورة وأسعار منافسة. مقارنة شاملة ومراجعات العملاء.', 0.89),
(2, 'category', 'هواتف ذكية - أحدث الموديلات وأفضل الأسعار', 'تصفح مجموعة واسعة من الهواتف الذكية بأحدث التقنيات وأفضل الأسعار. مقارنة شاملة ومراجعات العملاء.', 0.91);

-- Insert sample AI affiliate integration
INSERT INTO `ai_affiliate_integration` (`affiliate_network`, `product_id`, `product_name`, `product_description`, `product_url`, `price`, `category`, `brand`, `rating`, `commission_rate`) VALUES
('Amazon', 'B08N5WRWNW', 'iPhone 13 Pro', 'Latest iPhone with advanced camera system', 'https://amazon.com/iphone13pro', 999.99, 'Smartphones', 'Apple', 4.8, 4.0),
('eBay', 'EBAY-LAPTOP-001', 'Dell XPS 13', 'Premium ultrabook for professionals', 'https://ebay.com/dell-xps13', 1299.99, 'Laptops', 'Dell', 4.6, 3.5);

-- Insert sample AI analytics
INSERT INTO `ai_analytics` (`date`, `metric_name`, `metric_value`, `metric_unit`, `category`) VALUES
(CURDATE(), 'conversation_success_rate', 94.5, 'percentage', 'chatbot'),
(CURDATE(), 'search_correction_rate', 12.3, 'percentage', 'search'),
(CURDATE(), 'recommendation_click_rate', 23.7, 'percentage', 'recommendations'),
(CURDATE(), 'content_generation_quality', 87.2, 'score', 'content'),
(CURDATE(), 'user_satisfaction', 4.6, 'rating', 'overall');

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Performance indexes for AI conversations
CREATE INDEX `idx_ai_conversations_composite` ON `ai_conversations` (`user_id`, `language`, `created_at`);
CREATE INDEX `idx_ai_conversations_intent` ON `ai_conversations` (`intent`, `confidence_score`);

-- Performance indexes for search queries
CREATE INDEX `idx_search_queries_composite` ON `search_queries` (`user_id`, `language`, `created_at`);
CREATE INDEX `idx_search_queries_analytics` ON `search_queries` (`result_count`, `is_corrected`, `created_at`);

-- Performance indexes for user preferences
CREATE INDEX `idx_user_preferences_composite` ON `user_preferences` (`user_id`, `category_id`, `interest_level`);
CREATE INDEX `idx_user_preferences_type` ON `user_preferences` (`preference_type`, `last_interaction`);

-- Performance indexes for AI recommendations
CREATE INDEX `idx_ai_recommendations_composite` ON `ai_recommendations` (`user_id`, `recommendation_type`, `confidence_score`);
CREATE INDEX `idx_ai_recommendations_product` ON `ai_recommendations` (`product_id`, `is_clicked`, `created_at`);

-- Performance indexes for AI content generation
CREATE INDEX `idx_ai_content_generation_composite` ON `ai_content_generation` (`user_id`, `content_type`, `language`);
CREATE INDEX `idx_ai_content_generation_quality` ON `ai_content_generation` (`quality_score`, `is_approved`);

-- Performance indexes for AI image generation
CREATE INDEX `idx_ai_image_generation_composite` ON `ai_image_generation` (`user_id`, `product_id`, `image_type`);
CREATE INDEX `idx_ai_image_generation_quality` ON `ai_image_generation` (`quality_score`, `is_approved`);

-- Performance indexes for AI shopping assistant
CREATE INDEX `idx_ai_shopping_assistant_composite` ON `ai_shopping_assistant` (`user_id`, `session_id`, `is_completed`);
CREATE INDEX `idx_ai_shopping_assistant_query` ON `ai_shopping_assistant` (`query`(100), `created_at`);

-- Performance indexes for AI SEO optimization
CREATE INDEX `idx_ai_seo_optimization_composite` ON `ai_seo_optimization` (`user_id`, `content_type`, `seo_score`);
CREATE INDEX `idx_ai_seo_optimization_applied` ON `ai_seo_optimization` (`is_applied`, `created_at`);

-- Performance indexes for AI affiliate integration
CREATE INDEX `idx_ai_affiliate_integration_composite` ON `ai_affiliate_integration` (`affiliate_network`, `category`, `brand`);
CREATE INDEX `idx_ai_affiliate_integration_price` ON `ai_affiliate_integration` (`price`, `rating`, `last_updated`);

-- Performance indexes for AI analytics
CREATE INDEX `idx_ai_analytics_composite` ON `ai_analytics` (`date`, `metric_name`, `category`);
CREATE INDEX `idx_ai_analytics_metric` ON `ai_analytics` (`metric_name`, `metric_value`, `date`);

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for AI conversation analytics
CREATE OR REPLACE VIEW `v_ai_conversation_analytics` AS
SELECT 
    DATE(created_at) as conversation_date,
    language,
    mode,
    intent,
    COUNT(*) as conversation_count,
    AVG(confidence_score) as avg_confidence,
    COUNT(DISTINCT user_id) as unique_users
FROM ai_conversations
GROUP BY DATE(created_at), language, mode, intent;

-- View for search query analytics
CREATE OR REPLACE VIEW `v_search_query_analytics` AS
SELECT 
    DATE(created_at) as search_date,
    language,
    COUNT(*) as total_searches,
    COUNT(CASE WHEN is_corrected = 1 THEN 1 END) as corrected_searches,
    AVG(result_count) as avg_results,
    COUNT(DISTINCT user_id) as unique_users
FROM search_queries
GROUP BY DATE(created_at), language;

-- View for user preference insights
CREATE OR REPLACE VIEW `v_user_preference_insights` AS
SELECT 
    u.username,
    up.keyword,
    up.interest_level,
    up.preference_type,
    c.name as category_name,
    up.last_interaction
FROM user_preferences up
JOIN users u ON up.user_id = u.id
LEFT JOIN categories c ON up.category_id = c.id
ORDER BY up.interest_level DESC, up.last_interaction DESC;

-- View for AI recommendation performance
CREATE OR REPLACE VIEW `v_ai_recommendation_performance` AS
SELECT 
    ar.recommendation_type,
    COUNT(*) as total_recommendations,
    COUNT(CASE WHEN ar.is_clicked = 1 THEN 1 END) as clicked_recommendations,
    COUNT(CASE WHEN ar.is_purchased = 1 THEN 1 END) as purchased_recommendations,
    AVG(ar.confidence_score) as avg_confidence,
    (COUNT(CASE WHEN ar.is_clicked = 1 THEN 1 END) / COUNT(*)) * 100 as click_rate
FROM ai_recommendations ar
GROUP BY ar.recommendation_type;

-- View for AI content generation quality
CREATE OR REPLACE VIEW `v_ai_content_generation_quality` AS
SELECT 
    content_type,
    language,
    COUNT(*) as total_generated,
    COUNT(CASE WHEN is_approved = 1 THEN 1 END) as approved_content,
    COUNT(CASE WHEN is_published = 1 THEN 1 END) as published_content,
    AVG(quality_score) as avg_quality_score
FROM ai_content_generation
GROUP BY content_type, language;

-- =====================================================
-- CREATE STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to get AI conversation context
CREATE PROCEDURE `GetConversationContext`(
    IN p_user_id BIGINT,
    IN p_limit INT
)
BEGIN
    SELECT 
        c.message,
        c.mode,
        c.intent,
        c.confidence_score,
        c.created_at,
        r.response,
        r.type as response_type
    FROM ai_conversations c
    LEFT JOIN ai_responses r ON c.id = r.conversation_id
    WHERE c.user_id = p_user_id
    ORDER BY c.created_at DESC
    LIMIT p_limit;
END //

-- Procedure to update user preferences
CREATE PROCEDURE `UpdateUserPreferences`(
    IN p_user_id BIGINT,
    IN p_keyword VARCHAR(255),
    IN p_category_id BIGINT,
    IN p_preference_type ENUM('search','browse','purchase','view')
)
BEGIN
    INSERT INTO user_preferences (user_id, keyword, category_id, preference_type, interest_level, last_interaction)
    VALUES (p_user_id, p_keyword, p_category_id, p_preference_type, 1, NOW())
    ON DUPLICATE KEY UPDATE 
        interest_level = interest_level + 1,
        last_interaction = NOW();
END //

-- Procedure to generate AI recommendations
CREATE PROCEDURE `GenerateAIRecommendations`(
    IN p_user_id BIGINT,
    IN p_limit INT
)
BEGIN
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.rating,
        'collaborative' as recommendation_type,
        up.interest_level / 10.0 as confidence_score,
        CONCAT('Based on your interest in ', up.keyword) as reason
    FROM user_preferences up
    JOIN products p ON p.category_id = up.category_id
    WHERE up.user_id = p_user_id
    AND up.interest_level > 3
    ORDER BY up.interest_level DESC, p.rating DESC
    LIMIT p_limit;
END //

-- Procedure to log AI interaction
CREATE PROCEDURE `LogAIIteraction`(
    IN p_user_id BIGINT,
    IN p_session_id VARCHAR(255),
    IN p_message TEXT,
    IN p_language VARCHAR(10),
    IN p_mode ENUM('general','shopping','support'),
    IN p_intent VARCHAR(100),
    IN p_confidence_score DECIMAL(3,2)
)
BEGIN
    INSERT INTO ai_conversations (user_id, session_id, message, language, mode, intent, confidence_score)
    VALUES (p_user_id, p_session_id, p_message, p_language, p_mode, p_intent, p_confidence_score);
    
    SELECT LAST_INSERT_ID() as conversation_id;
END //

DELIMITER ;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger to update user preferences when AI conversation occurs
DELIMITER //
CREATE TRIGGER `tr_ai_conversation_preferences` 
AFTER INSERT ON `ai_conversations`
FOR EACH ROW
BEGIN
    IF NEW.user_id IS NOT NULL THEN
        CALL UpdateUserPreferences(NEW.user_id, NEW.message, NULL, 'search');
    END IF;
END //
DELIMITER ;

-- Trigger to update search analytics when search query is logged
DELIMITER //
CREATE TRIGGER `tr_search_query_analytics` 
AFTER INSERT ON `search_queries`
FOR EACH ROW
BEGIN
    INSERT INTO ai_analytics (date, metric_name, metric_value, metric_unit, category)
    VALUES (NEW.created_at, 'daily_searches', 1, 'count', 'search')
    ON DUPLICATE KEY UPDATE 
        metric_value = metric_value + 1;
END //
DELIMITER ;

-- =====================================================
-- FINAL COMMENTS
-- =====================================================

/*
This enhanced database schema provides comprehensive support for all AI features:

1. AI Chatbot: Full conversation tracking with intent analysis
2. Smart Search: Query logging, spell correction, and analytics
3. User Preferences: Learning from user interactions
4. AI Recommendations: Multiple recommendation algorithms
5. Content Generation: AI-powered content creation
6. Image Generation: AI-generated product images
7. Shopping Assistant: Intelligent shopping guidance
8. SEO Optimization: AI-powered SEO improvements
9. Affiliate Integration: Automated product import
10. Analytics: Comprehensive performance tracking

The schema includes:
- Proper indexing for performance
- Views for common queries
- Stored procedures for complex operations
- Triggers for automated updates
- Comprehensive foreign key constraints
- JSON fields for flexible metadata storage

To use this database:
1. Run this script to create the schema
2. Update your application configuration
3. Test all AI features
4. Monitor performance and adjust indexes as needed
*/