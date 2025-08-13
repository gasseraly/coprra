-- ===================================
-- قاعدة بيانات CopRRA المحسنة بالذكاء الاصطناعي
-- تشمل جميع الميزات المطلوبة للتطوير الجديد
-- تاريخ الإنشاء: 2025-01-27
-- ===================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS `coprra_ai_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `coprra_ai_db`;

-- ===================================
-- جداول الذكاء الاصطناعي الجديدة
-- ===================================

-- جدول محادثات الذكاء الاصطناعي (Chatbot)
CREATE TABLE `ai_conversations` (
    `id` int NOT NULL AUTO_INCREMENT,
    `session_id` varchar(255) NOT NULL,
    `user_id` int DEFAULT NULL,
    `conversation_context` json,
    `language_code` varchar(10) DEFAULT 'en',
    `is_active` boolean DEFAULT TRUE,
    `total_messages` int DEFAULT 0,
    `satisfaction_rating` tinyint DEFAULT NULL,
    `resolved` boolean DEFAULT FALSE,
    `escalated_to_human` boolean DEFAULT FALSE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `session_id` (`session_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_language` (`language_code`),
    KEY `idx_active` (`is_active`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_ai_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول رسائل المحادثة
CREATE TABLE `ai_messages` (
    `id` int NOT NULL AUTO_INCREMENT,
    `conversation_id` int NOT NULL,
    `message_type` enum('user', 'ai', 'system') NOT NULL,
    `content` text NOT NULL,
    `metadata` json,
    `intent_detected` varchar(100),
    `confidence_score` decimal(5,4) DEFAULT NULL,
    `response_time_ms` int DEFAULT NULL,
    `feedback_score` tinyint DEFAULT NULL, -- 1-5 rating
    `was_helpful` boolean DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_conversation_id` (`conversation_id`),
    KEY `idx_message_type` (`message_type`),
    KEY `idx_intent` (`intent_detected`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_ai_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول نوايا الذكاء الاصطناعي (AI Intents)
CREATE TABLE `ai_intents` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL UNIQUE,
    `description_en` text,
    `description_ar` text,
    `training_phrases` json, -- مجموعة من العبارات التدريبية
    `response_templates` json, -- قوالب الردود
    `action_type` enum('search', 'product_info', 'comparison', 'support', 'navigation', 'affiliate') DEFAULT 'support',
    `parameters` json, -- معاملات مطلوبة
    `is_active` boolean DEFAULT TRUE,
    `priority` int DEFAULT 1,
    `success_count` int DEFAULT 0,
    `total_attempts` int DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`),
    KEY `idx_action_type` (`action_type`),
    KEY `idx_active` (`is_active`),
    KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول البحث الذكي والاستعلامات
CREATE TABLE `ai_search_queries` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int DEFAULT NULL,
    `session_id` varchar(255),
    `original_query` varchar(500) NOT NULL,
    `corrected_query` varchar(500),
    `normalized_query` varchar(500),
    `search_intent` varchar(100),
    `language_detected` varchar(10),
    `results_count` int DEFAULT 0,
    `click_through_rate` decimal(5,4) DEFAULT NULL,
    `user_satisfaction` tinyint DEFAULT NULL,
    `processing_time_ms` int DEFAULT NULL,
    `suggestions_shown` json,
    `filters_applied` json,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_original_query` (`original_query`),
    KEY `idx_search_intent` (`search_intent`),
    KEY `idx_created_at` (`created_at`),
    FULLTEXT KEY `idx_search_text` (`original_query`, `corrected_query`, `normalized_query`),
    CONSTRAINT `fk_ai_search_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التوصيات الذكية
CREATE TABLE `ai_recommendations` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int DEFAULT NULL,
    `session_id` varchar(255),
    `recommendation_type` enum('similar_products', 'user_based', 'content_based', 'trending', 'seasonal', 'affiliate') NOT NULL,
    `source_product_id` int DEFAULT NULL,
    `recommended_product_id` int NOT NULL,
    `confidence_score` decimal(5,4) NOT NULL,
    `relevance_score` decimal(5,4) NOT NULL,
    `position_shown` int DEFAULT NULL,
    `was_clicked` boolean DEFAULT FALSE,
    `was_purchased` boolean DEFAULT FALSE,
    `algorithm_version` varchar(50) DEFAULT 'v1.0',
    `metadata` json,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_recommendation_type` (`recommendation_type`),
    KEY `idx_source_product` (`source_product_id`),
    KEY `idx_recommended_product` (`recommended_product_id`),
    KEY `idx_confidence_score` (`confidence_score`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_ai_rec_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_ai_rec_source` FOREIGN KEY (`source_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ai_rec_recommended` FOREIGN KEY (`recommended_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المحتوى المُولد بالذكاء الاصطناعي
CREATE TABLE `ai_generated_content` (
    `id` int NOT NULL AUTO_INCREMENT,
    `content_type` enum('product_description', 'article', 'meta_description', 'meta_title', 'review_summary', 'translation') NOT NULL,
    `entity_id` int NOT NULL, -- معرف المنتج أو المقال
    `entity_type` enum('product', 'article', 'category', 'brand', 'page') NOT NULL,
    `language_code` varchar(10) NOT NULL,
    `original_content` longtext,
    `generated_content` longtext NOT NULL,
    `prompt_used` text,
    `model_version` varchar(50) DEFAULT 'gpt-4',
    `quality_score` decimal(5,4) DEFAULT NULL,
    `human_approved` boolean DEFAULT FALSE,
    `human_edited` boolean DEFAULT FALSE,
    `usage_count` int DEFAULT 0,
    `feedback_score` decimal(3,2) DEFAULT NULL,
    `seo_keywords` json,
    `readability_score` int DEFAULT NULL,
    `character_count` int DEFAULT NULL,
    `word_count` int DEFAULT NULL,
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_content_type` (`content_type`),
    KEY `idx_entity` (`entity_id`, `entity_type`),
    KEY `idx_language` (`language_code`),
    KEY `idx_approved` (`human_approved`),
    KEY `idx_active` (`is_active`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مساعد التسوق الذكي
CREATE TABLE `ai_shopping_sessions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int DEFAULT NULL,
    `session_id` varchar(255) NOT NULL,
    `shopping_intent` varchar(100),
    `budget_range` json, -- {min: 100, max: 500, currency: 'USD'}
    `preferences` json, -- تفضيلات المستخدم
    `requirements` json, -- متطلبات محددة
    `current_step` varchar(100) DEFAULT 'initial',
    `recommended_products` json,
    `conversation_history` json,
    `final_selection` int DEFAULT NULL,
    `session_completed` boolean DEFAULT FALSE,
    `satisfaction_rating` tinyint DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `session_id` (`session_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_shopping_intent` (`shopping_intent`),
    KEY `idx_completed` (`session_completed`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_ai_shop_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_ai_shop_product` FOREIGN KEY (`final_selection`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تحسين SEO التلقائي
CREATE TABLE `ai_seo_optimizations` (
    `id` int NOT NULL AUTO_INCREMENT,
    `entity_id` int NOT NULL,
    `entity_type` enum('product', 'article', 'category', 'brand', 'page') NOT NULL,
    `language_code` varchar(10) NOT NULL,
    `optimization_type` enum('title', 'meta_description', 'keywords', 'alt_text', 'schema_markup', 'url_slug') NOT NULL,
    `original_value` text,
    `optimized_value` text NOT NULL,
    `target_keywords` json,
    `seo_score_before` int DEFAULT NULL,
    `seo_score_after` int DEFAULT NULL,
    `improvement_percentage` decimal(5,2) DEFAULT NULL,
    `applied` boolean DEFAULT FALSE,
    `performance_data` json, -- rankings, clicks, impressions
    `algorithm_version` varchar(50) DEFAULT 'v1.0',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `applied_at` timestamp NULL,
    PRIMARY KEY (`id`),
    KEY `idx_entity` (`entity_id`, `entity_type`),
    KEY `idx_language` (`language_code`),
    KEY `idx_optimization_type` (`optimization_type`),
    KEY `idx_applied` (`applied`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التخصيص الذكي لتجربة المستخدم
CREATE TABLE `ai_user_personalization` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `behavioral_data` json, -- browsing patterns, preferences
    `interest_categories` json, -- اهتمامات المستخدم
    `preferred_brands` json,
    `price_sensitivity` enum('low', 'medium', 'high') DEFAULT 'medium',
    `shopping_frequency` enum('rare', 'occasional', 'frequent', 'daily') DEFAULT 'occasional',
    `device_preferences` json,
    `location_data` json,
    `content_preferences` json, -- نوع المحتوى المفضل
    `language_preferences` json,
    `ui_customizations` json, -- تخصيصات واجهة المستخدم
    `recommendation_weights` json, -- أوزان خوارزمية التوصيات
    `last_analyzed` timestamp DEFAULT CURRENT_TIMESTAMP,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id` (`user_id`),
    KEY `idx_price_sensitivity` (`price_sensitivity`),
    KEY `idx_shopping_frequency` (`shopping_frequency`),
    KEY `idx_last_analyzed` (`last_analyzed`),
    CONSTRAINT `fk_ai_personal_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تحليلات الذكاء الاصطناعي
CREATE TABLE `ai_analytics` (
    `id` int NOT NULL AUTO_INCREMENT,
    `metric_type` enum('user_engagement', 'conversion_rate', 'product_performance', 'content_effectiveness', 'search_performance', 'recommendation_accuracy') NOT NULL,
    `entity_id` int DEFAULT NULL,
    `entity_type` varchar(50) DEFAULT NULL,
    `metric_value` decimal(10,4) NOT NULL,
    `metric_data` json,
    `time_period` enum('hourly', 'daily', 'weekly', 'monthly') NOT NULL,
    `date_recorded` date NOT NULL,
    `hour_recorded` tinyint DEFAULT NULL,
    `insights` json, -- رؤى مستخرجة
    `recommendations` json, -- توصيات للتحسين
    `confidence_level` decimal(5,4) DEFAULT NULL,
    `trend_direction` enum('up', 'down', 'stable') DEFAULT 'stable',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_metric_type` (`metric_type`),
    KEY `idx_entity` (`entity_id`, `entity_type`),
    KEY `idx_date_recorded` (`date_recorded`),
    KEY `idx_time_period` (`time_period`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الصور المُولدة والمحسنة بالذكاء الاصطناعي
CREATE TABLE `ai_generated_images` (
    `id` int NOT NULL AUTO_INCREMENT,
    `entity_id` int NOT NULL,
    `entity_type` enum('product', 'article', 'category', 'brand', 'banner') NOT NULL,
    `image_type` enum('product_photo', 'banner', 'thumbnail', 'icon', 'background', 'comparison_chart') NOT NULL,
    `generation_method` enum('text_to_image', 'image_enhancement', 'style_transfer', 'background_removal', 'upscaling') NOT NULL,
    `prompt_used` text,
    `original_image_url` varchar(500),
    `generated_image_url` varchar(500) NOT NULL,
    `generation_model` varchar(100) DEFAULT 'dall-e-3',
    `quality_score` decimal(5,4) DEFAULT NULL,
    `resolution` varchar(20), -- e.g., '1024x1024'
    `file_size_kb` int DEFAULT NULL,
    `alt_text_en` varchar(255),
    `alt_text_ar` varchar(255),
    `seo_optimized` boolean DEFAULT FALSE,
    `human_approved` boolean DEFAULT FALSE,
    `usage_count` int DEFAULT 0,
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_entity` (`entity_id`, `entity_type`),
    KEY `idx_image_type` (`image_type`),
    KEY `idx_generation_method` (`generation_method`),
    KEY `idx_approved` (`human_approved`),
    KEY `idx_active` (`is_active`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول منتجات الأفلييت
CREATE TABLE `affiliate_products` (
    `id` int NOT NULL AUTO_INCREMENT,
    `affiliate_network` varchar(100) NOT NULL, -- Amazon, ClickBank, etc.
    `external_id` varchar(255) NOT NULL, -- معرف المنتج في الشبكة
    `product_id` int DEFAULT NULL, -- ربط بالمنتج المحلي
    `title` varchar(500) NOT NULL,
    `description` text,
    `price` decimal(12,2) NOT NULL,
    `original_price` decimal(12,2) DEFAULT NULL,
    `currency` varchar(10) DEFAULT 'USD',
    `commission_rate` decimal(5,2) DEFAULT NULL,
    `commission_amount` decimal(10,2) DEFAULT NULL,
    `affiliate_url` varchar(1000) NOT NULL,
    `image_url` varchar(500),
    `category_mapping` varchar(255),
    `brand_mapping` varchar(255),
    `rating` decimal(3,2) DEFAULT NULL,
    `reviews_count` int DEFAULT 0,
    `availability` enum('in_stock', 'out_of_stock', 'limited', 'discontinued') DEFAULT 'in_stock',
    `last_synced` timestamp DEFAULT CURRENT_TIMESTAMP,
    `sync_frequency_hours` int DEFAULT 24,
    `is_featured` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `performance_data` json, -- clicks, conversions, revenue
    `ai_enhanced` boolean DEFAULT FALSE,
    `ai_score` decimal(5,4) DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_affiliate_product` (`affiliate_network`, `external_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_affiliate_network` (`affiliate_network`),
    KEY `idx_price` (`price`),
    KEY `idx_category_mapping` (`category_mapping`),
    KEY `idx_brand_mapping` (`brand_mapping`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_active` (`is_active`),
    KEY `idx_last_synced` (`last_synced`),
    KEY `idx_ai_score` (`ai_score`),
    CONSTRAINT `fk_affiliate_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مقارنات الأفلييت الذكية
CREATE TABLE `affiliate_comparisons` (
    `id` int NOT NULL AUTO_INCREMENT,
    `comparison_name` varchar(255) NOT NULL,
    `category` varchar(100),
    `products` json NOT NULL, -- قائمة معرفات المنتجات
    `comparison_criteria` json, -- معايير المقارنة
    `ai_analysis` json, -- تحليل ذكي للمقارنة
    `winner_product_id` int DEFAULT NULL, -- المنتج الفائز
    `confidence_score` decimal(5,4) DEFAULT NULL,
    `comparison_matrix` json, -- مصفوفة المقارنة التفصيلية
    `user_generated` boolean DEFAULT FALSE,
    `auto_generated` boolean DEFAULT TRUE,
    `view_count` int DEFAULT 0,
    `share_count` int DEFAULT 0,
    `click_through_rate` decimal(5,4) DEFAULT NULL,
    `conversion_rate` decimal(5,4) DEFAULT NULL,
    `is_featured` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category`),
    KEY `idx_winner_product` (`winner_product_id`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_active` (`is_active`),
    KEY `idx_view_count` (`view_count`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_affiliate_comp_winner` FOREIGN KEY (`winner_product_id`) REFERENCES `affiliate_products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- تحديث جدول الإعدادات لدعم الذكاء الاصطناعي
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description_en`, `description_ar`, `is_public`) VALUES
-- إعدادات الذكاء الاصطناعي العامة
('ai_enabled', 'true', 'boolean', 'ai', 'Enable AI features', 'تفعيل ميزات الذكاء الاصطناعي', FALSE),
('ai_chatbot_enabled', 'true', 'boolean', 'ai', 'Enable AI chatbot', 'تفعيل المحادثة الذكية', TRUE),
('ai_search_enabled', 'true', 'boolean', 'ai', 'Enable AI-powered search', 'تفعيل البحث الذكي', TRUE),
('ai_recommendations_enabled', 'true', 'boolean', 'ai', 'Enable AI recommendations', 'تفعيل التوصيات الذكية', TRUE),
('ai_content_generation_enabled', 'true', 'boolean', 'ai', 'Enable AI content generation', 'تفعيل إنشاء المحتوى الذكي', FALSE),
('ai_seo_optimization_enabled', 'true', 'boolean', 'ai', 'Enable AI SEO optimization', 'تفعيل تحسين SEO الذكي', FALSE),
('ai_personalization_enabled', 'true', 'boolean', 'ai', 'Enable AI personalization', 'تفعيل التخصيص الذكي', TRUE),
('ai_image_generation_enabled', 'false', 'boolean', 'ai', 'Enable AI image generation', 'تفعيل إنشاء الصور الذكي', FALSE),

-- إعدادات الأفلييت
('affiliate_enabled', 'true', 'boolean', 'affiliate', 'Enable affiliate integration', 'تفعيل تكامل الأفلييت', TRUE),
('affiliate_auto_sync', 'true', 'boolean', 'affiliate', 'Enable automatic affiliate sync', 'تفعيل المزامنة التلقائية للأفلييت', FALSE),
('affiliate_sync_frequency', '24', 'number', 'affiliate', 'Affiliate sync frequency in hours', 'تكرار مزامنة الأفلييت بالساعات', FALSE),
('affiliate_commission_display', 'true', 'boolean', 'affiliate', 'Display commission rates', 'عرض معدلات العمولة', TRUE),

-- إعدادات التحليلات الذكية
('ai_analytics_enabled', 'true', 'boolean', 'ai', 'Enable AI analytics', 'تفعيل التحليلات الذكية', FALSE),
('ai_analytics_frequency', 'daily', 'string', 'ai', 'AI analytics processing frequency', 'تكرار معالجة التحليلات الذكية', FALSE),
('ai_insights_threshold', '0.8', 'number', 'ai', 'Minimum confidence for AI insights', 'الحد الأدنى للثقة في الرؤى الذكية', FALSE),

-- إعدادات الأداء
('ai_response_cache_enabled', 'true', 'boolean', 'performance', 'Enable AI response caching', 'تفعيل تخزين ردود الذكاء الاصطناعي مؤقتاً', FALSE),
('ai_cache_duration_minutes', '60', 'number', 'performance', 'AI cache duration in minutes', 'مدة تخزين الذكاء الاصطناعي بالدقائق', FALSE),
('ai_max_concurrent_requests', '10', 'number', 'performance', 'Maximum concurrent AI requests', 'الحد الأقصى لطلبات الذكاء الاصطناعي المتزامنة', FALSE),

-- معلومات الاتصال المحدثة
('contact_email', 'contact@coprra.com', 'string', 'contact', 'Contact email address', 'عنوان البريد الإلكتروني للتواصل', TRUE);

-- إنشاء الفهارس المحسنة للأداء
CREATE INDEX idx_ai_conv_user_active ON ai_conversations(user_id, is_active, created_at);
CREATE INDEX idx_ai_msg_conv_type ON ai_messages(conversation_id, message_type, created_at);
CREATE INDEX idx_ai_search_user_time ON ai_search_queries(user_id, created_at);
CREATE INDEX idx_ai_rec_user_type_score ON ai_recommendations(user_id, recommendation_type, confidence_score);
CREATE INDEX idx_ai_content_entity_lang ON ai_generated_content(entity_id, entity_type, language_code);
CREATE INDEX idx_affiliate_network_active ON affiliate_products(affiliate_network, is_active, ai_score);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;