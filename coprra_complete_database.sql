-- ===================================
-- قاعدة بيانات CopRRA الشاملة والمحدثة
-- نسخة كاملة تتضمن جميع الميزات والأجزاء الديناميكية
-- تاريخ الإنشاء: 2025-01-27
-- ===================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS `coprra_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `coprra_db`;

-- ===================================
-- 1. الجداول الأساسية للنظام
-- ===================================

-- جدول اللغات المدعومة
CREATE TABLE `languages` (
    `id` int NOT NULL AUTO_INCREMENT,
    `code` varchar(10) NOT NULL,
    `name` varchar(50) NOT NULL,
    `native_name` varchar(50) NOT NULL,
    `flag` varchar(10) NOT NULL,
    `is_rtl` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `sort_order` int DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `code` (`code`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول العملات المدعومة
CREATE TABLE `currencies` (
    `id` int NOT NULL AUTO_INCREMENT,
    `code` varchar(10) NOT NULL,
    `name` varchar(50) NOT NULL,
    `symbol` varchar(10) NOT NULL,
    `flag` varchar(10) NOT NULL,
    `country` varchar(50) NOT NULL,
    `exchange_rate` decimal(10,4) DEFAULT 1.0000,
    `is_active` boolean DEFAULT TRUE,
    `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `code` (`code`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المناطق الجغرافية
CREATE TABLE `regions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(100) NOT NULL,
    `code` varchar(10) NOT NULL,
    `currency_id` int,
    `language_id` int,
    `timezone` varchar(50),
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `code` (`code`),
    KEY `fk_region_currency` (`currency_id`),
    KEY `fk_region_language` (`language_id`),
    CONSTRAINT `fk_region_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`),
    CONSTRAINT `fk_region_language` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 2. إدارة المستخدمين والأمان
-- ===================================

-- جدول المستخدمين المحسن
CREATE TABLE `users` (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(255) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `first_name` varchar(100) NOT NULL,
    `last_name` varchar(100) NOT NULL,
    `username` varchar(100) UNIQUE,
    `phone` varchar(20),
    `avatar_url` varchar(500),
    `date_of_birth` date,
    `gender` enum('male', 'female', 'other'),
    `preferred_language_id` int DEFAULT 1,
    `preferred_currency_id` int DEFAULT 1,
    `region_id` int,
    `role` enum('user', 'admin', 'moderator', 'editor') DEFAULT 'user',
    `email_verified` boolean DEFAULT FALSE,
    `phone_verified` boolean DEFAULT FALSE,
    `verification_token` varchar(255),
    `verification_expires_at` timestamp NULL,
    `reset_token` varchar(255),
    `reset_token_expires` timestamp NULL,
    `last_login` timestamp NULL,
    `login_count` int DEFAULT 0,
    `is_active` boolean DEFAULT TRUE,
    `is_banned` boolean DEFAULT FALSE,
    `ban_reason` text,
    `banned_until` timestamp NULL,
    `social_login_provider` enum('google', 'facebook', 'apple', 'twitter') NULL,
    `social_login_id` varchar(100),
    `notification_preferences` json,
    `privacy_settings` json,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_email` (`email`),
    KEY `idx_username` (`username`),
    KEY `idx_role` (`role`),
    KEY `idx_active` (`is_active`),
    KEY `fk_user_language` (`preferred_language_id`),
    KEY `fk_user_currency` (`preferred_currency_id`),
    KEY `fk_user_region` (`region_id`),
    CONSTRAINT `fk_user_language` FOREIGN KEY (`preferred_language_id`) REFERENCES `languages` (`id`),
    CONSTRAINT `fk_user_currency` FOREIGN KEY (`preferred_currency_id`) REFERENCES `currencies` (`id`),
    CONSTRAINT `fk_user_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول جلسات المستخدمين
CREATE TABLE `user_sessions` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `session_token` varchar(255) NOT NULL UNIQUE,
    `refresh_token` varchar(255) UNIQUE,
    `device_info` json,
    `ip_address` varchar(45),
    `user_agent` text,
    `location` varchar(100),
    `is_active` boolean DEFAULT TRUE,
    `expires_at` timestamp NOT NULL,
    `last_activity` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_token` (`session_token`),
    KEY `idx_expires_at` (`expires_at`),
    CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجل نشاطات المستخدمين
CREATE TABLE `user_activity_log` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `action` varchar(100) NOT NULL,
    `entity_type` varchar(50),
    `entity_id` int,
    `details` json,
    `ip_address` varchar(45),
    `user_agent` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_action` (`action`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 3. الفئات والعلامات التجارية
-- ===================================

-- جدول الفئات الرئيسية والفرعية
CREATE TABLE `categories` (
    `id` int NOT NULL AUTO_INCREMENT,
    `parent_id` int DEFAULT NULL,
    `name_en` varchar(255) NOT NULL,
    `name_ar` varchar(255) NOT NULL,
    `slug` varchar(255) NOT NULL UNIQUE,
    `description_en` text,
    `description_ar` text,
    `icon` varchar(100),
    `image_url` varchar(500),
    `banner_image` varchar(500),
    `sort_order` int DEFAULT 0,
    `is_featured` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `meta_title_en` varchar(255),
    `meta_title_ar` varchar(255),
    `meta_description_en` text,
    `meta_description_ar` text,
    `meta_keywords_en` text,
    `meta_keywords_ar` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `slug` (`slug`),
    KEY `parent_id` (`parent_id`),
    KEY `idx_active` (`is_active`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_sort` (`sort_order`),
    CONSTRAINT `categories_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول العلامات التجارية
CREATE TABLE `brands` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `slug` varchar(255) NOT NULL UNIQUE,
    `description_en` text,
    `description_ar` text,
    `logo_url` varchar(500),
    `banner_image` varchar(500),
    `website_url` varchar(500),
    `country_origin` varchar(100),
    `founded_year` year,
    `is_featured` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `sort_order` int DEFAULT 0,
    `popularity_score` int DEFAULT 0,
    `meta_title_en` varchar(255),
    `meta_title_ar` varchar(255),
    `meta_description_en` text,
    `meta_description_ar` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`),
    UNIQUE KEY `slug` (`slug`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_active` (`is_active`),
    KEY `idx_popularity` (`popularity_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 4. المتاجر ومصادر البيانات
-- ===================================

-- جدول المتاجر
CREATE TABLE `stores` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `slug` varchar(255) NOT NULL UNIQUE,
    `website_url` varchar(500) NOT NULL,
    `api_url` varchar(500),
    `logo_url` varchar(500),
    `country` varchar(100),
    `currency_id` int,
    `language_id` int,
    `commission_rate` decimal(5,2) DEFAULT 0.00,
    `rating` decimal(3,2) DEFAULT 0.00,
    `total_reviews` int DEFAULT 0,
    `shipping_info` json,
    `return_policy` text,
    `is_partner` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `last_sync` timestamp NULL,
    `sync_frequency` int DEFAULT 24, -- hours
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `slug` (`slug`),
    KEY `idx_active` (`is_active`),
    KEY `idx_partner` (`is_partner`),
    KEY `fk_store_currency` (`currency_id`),
    KEY `fk_store_language` (`language_id`),
    CONSTRAINT `fk_store_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`),
    CONSTRAINT `fk_store_language` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 5. المنتجات والمواصفات
-- ===================================

-- جدول المنتجات الرئيسي
CREATE TABLE `products` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name_en` varchar(500) NOT NULL,
    `name_ar` varchar(500) NOT NULL,
    `slug` varchar(500) NOT NULL UNIQUE,
    `model_number` varchar(200),
    `sku` varchar(200),
    `brand_id` int NOT NULL,
    `category_id` int NOT NULL,
    `description_en` text,
    `description_ar` text,
    `short_description_en` text,
    `short_description_ar` text,
    `features_en` json,
    `features_ar` json,
    `specifications` json,
    `pros_en` json,
    `pros_ar` json,
    `cons_en` json,
    `cons_ar` json,
    `main_image` varchar(500),
    `gallery_images` json,
    `video_url` varchar(500),
    `manual_url` varchar(500),
    `official_url` varchar(500),
    `min_price` decimal(12,2),
    `max_price` decimal(12,2),
    `avg_price` decimal(12,2),
    `price_last_updated` timestamp NULL,
    `rating` decimal(3,2) DEFAULT 0.00,
    `total_reviews` int DEFAULT 0,
    `total_ratings` int DEFAULT 0,
    `total_wishlists` int DEFAULT 0,
    `total_comparisons` int DEFAULT 0,
    `popularity_score` int DEFAULT 0,
    `availability_status` enum('available', 'out_of_stock', 'discontinued', 'coming_soon') DEFAULT 'available',
    `release_date` date,
    `is_featured` boolean DEFAULT FALSE,
    `is_trending` boolean DEFAULT FALSE,
    `is_deal` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `meta_title_en` varchar(255),
    `meta_title_ar` varchar(255),
    `meta_description_en` text,
    `meta_description_ar` text,
    `meta_keywords_en` text,
    `meta_keywords_ar` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `slug` (`slug`),
    KEY `idx_brand_id` (`brand_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_active` (`is_active`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_trending` (`is_trending`),
    KEY `idx_rating` (`rating`),
    KEY `idx_price_range` (`min_price`, `max_price`),
    KEY `idx_popularity` (`popularity_score`),
    FULLTEXT KEY `idx_search` (`name_en`, `name_ar`, `description_en`, `description_ar`),
    CONSTRAINT `fk_product_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المنتجات المشابهة/البديلة
CREATE TABLE `product_alternatives` (
    `id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NOT NULL,
    `alternative_product_id` int NOT NULL,
    `similarity_score` decimal(5,2) DEFAULT 0.00,
    `type` enum('similar', 'alternative', 'upgrade', 'downgrade') DEFAULT 'similar',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_alternative` (`product_id`, `alternative_product_id`),
    KEY `fk_product_main` (`product_id`),
    KEY `fk_product_alternative` (`alternative_product_id`),
    CONSTRAINT `fk_product_main` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_product_alternative` FOREIGN KEY (`alternative_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أسعار المنتجات في المتاجر
CREATE TABLE `product_prices` (
    `id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NOT NULL,
    `store_id` int NOT NULL,
    `price` decimal(12,2) NOT NULL,
    `sale_price` decimal(12,2),
    `currency_id` int NOT NULL,
    `stock_status` enum('in_stock', 'out_of_stock', 'limited', 'pre_order') DEFAULT 'in_stock',
    `stock_quantity` int,
    `product_url` varchar(1000) NOT NULL,
    `shipping_cost` decimal(10,2) DEFAULT 0.00,
    `shipping_time` varchar(100),
    `warranty_info` text,
    `deal_info` json,
    `is_affiliate_link` boolean DEFAULT FALSE,
    `last_updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_product_store` (`product_id`, `store_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_store_id` (`store_id`),
    KEY `idx_price` (`price`),
    KEY `idx_stock_status` (`stock_status`),
    KEY `fk_price_currency` (`currency_id`),
    CONSTRAINT `fk_price_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_price_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_price_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تاريخ تغيرات الأسعار
CREATE TABLE `price_history` (
    `id` int NOT NULL AUTO_INCREMENT,
    `product_price_id` int NOT NULL,
    `old_price` decimal(12,2) NOT NULL,
    `new_price` decimal(12,2) NOT NULL,
    `change_percentage` decimal(5,2),
    `change_reason` enum('update', 'sale', 'discount', 'increase', 'restock') DEFAULT 'update',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_product_price_id` (`product_price_id`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_history_price` FOREIGN KEY (`product_price_id`) REFERENCES `product_prices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 6. تفاعل المستخدمين
-- ===================================

-- جدول قائمة المفضلة
CREATE TABLE `user_wishlists` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `product_id` int NOT NULL,
    `notes` text,
    `priority` enum('low', 'medium', 'high') DEFAULT 'medium',
    `price_alert_enabled` boolean DEFAULT FALSE,
    `target_price` decimal(12,2),
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_product_id` (`product_id`),
    CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مقارنة المنتجات
CREATE TABLE `user_comparisons` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int,
    `session_id` varchar(255),
    `name` varchar(255),
    `products` json NOT NULL,
    `is_public` boolean DEFAULT FALSE,
    `share_token` varchar(100) UNIQUE,
    `expires_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_share_token` (`share_token`),
    CONSTRAINT `fk_comparison_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مراجعات المستخدمين
CREATE TABLE `user_reviews` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `product_id` int NOT NULL,
    `rating` tinyint NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
    `title` varchar(255),
    `review_text` text,
    `pros` json,
    `cons` json,
    `images` json,
    `is_verified_purchase` boolean DEFAULT FALSE,
    `purchase_store_id` int,
    `purchase_date` date,
    `usage_duration` varchar(100),
    `would_recommend` boolean,
    `helpful_votes` int DEFAULT 0,
    `not_helpful_votes` int DEFAULT 0,
    `is_approved` boolean DEFAULT FALSE,
    `moderation_notes` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_product_review` (`user_id`, `product_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_rating` (`rating`),
    KEY `idx_approved` (`is_approved`),
    KEY `idx_created_at` (`created_at`),
    KEY `fk_review_store` (`purchase_store_id`),
    CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_store` FOREIGN KEY (`purchase_store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تصويت على المراجعات
CREATE TABLE `review_votes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `review_id` int NOT NULL,
    `user_id` int NOT NULL,
    `vote_type` enum('helpful', 'not_helpful') NOT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_review_user_vote` (`review_id`, `user_id`),
    KEY `fk_vote_review` (`review_id`),
    KEY `fk_vote_user` (`user_id`),
    CONSTRAINT `fk_vote_review` FOREIGN KEY (`review_id`) REFERENCES `user_reviews` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vote_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أسئلة وأجوبة المنتجات
CREATE TABLE `product_qa` (
    `id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NOT NULL,
    `user_id` int NOT NULL,
    `question` text NOT NULL,
    `answer` text,
    `answered_by` int,
    `is_approved` boolean DEFAULT FALSE,
    `helpful_votes` int DEFAULT 0,
    `not_helpful_votes` int DEFAULT 0,
    `is_featured` boolean DEFAULT FALSE,
    `tags` json,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `answered_at` timestamp NULL,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_approved` (`is_approved`),
    KEY `fk_qa_answerer` (`answered_by`),
    CONSTRAINT `fk_qa_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_qa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_qa_answerer` FOREIGN KEY (`answered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 7. الإشعارات وتنبيهات الأسعار
-- ===================================

-- جدول الإشعارات
CREATE TABLE `notifications` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `type` enum('price_drop', 'stock_available', 'deal_alert', 'review_response', 'qa_answer', 'system', 'marketing') NOT NULL,
    `title` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `data` json,
    `action_url` varchar(500),
    `is_read` boolean DEFAULT FALSE,
    `is_sent` boolean DEFAULT FALSE,
    `send_via` json DEFAULT ('["web"]'), -- web, email, push
    `scheduled_at` timestamp NULL,
    `sent_at` timestamp NULL,
    `read_at` timestamp NULL,
    `expires_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_type` (`type`),
    KEY `idx_read` (`is_read`),
    KEY `idx_sent` (`is_sent`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تنبيهات الأسعار
CREATE TABLE `price_alerts` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `product_id` int NOT NULL,
    `target_price` decimal(12,2) NOT NULL,
    `currency_id` int NOT NULL,
    `comparison_type` enum('less_than', 'less_than_equal', 'percentage_drop') DEFAULT 'less_than',
    `percentage_threshold` decimal(5,2),
    `is_active` boolean DEFAULT TRUE,
    `triggered_count` int DEFAULT 0,
    `last_triggered_at` timestamp NULL,
    `last_check_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_active` (`is_active`),
    KEY `fk_alert_currency` (`currency_id`),
    CONSTRAINT `fk_alert_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_alert_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_alert_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 8. المحتوى والمقالات
-- ===================================

-- جدول المقالات والمدونة
CREATE TABLE `articles` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title_en` varchar(255) NOT NULL,
    `title_ar` varchar(255) NOT NULL,
    `slug` varchar(255) NOT NULL UNIQUE,
    `excerpt_en` text,
    `excerpt_ar` text,
    `content_en` longtext NOT NULL,
    `content_ar` longtext NOT NULL,
    `featured_image` varchar(500),
    `gallery_images` json,
    `author_id` int NOT NULL,
    `category` enum('news', 'review', 'guide', 'comparison', 'tech_tips', 'deals') NOT NULL,
    `tags` json,
    `related_products` json,
    `reading_time` int, -- minutes
    `view_count` int DEFAULT 0,
    `like_count` int DEFAULT 0,
    `comment_count` int DEFAULT 0,
    `is_featured` boolean DEFAULT FALSE,
    `is_published` boolean DEFAULT FALSE,
    `published_at` timestamp NULL,
    `meta_title_en` varchar(255),
    `meta_title_ar` varchar(255),
    `meta_description_en` text,
    `meta_description_ar` text,
    `meta_keywords_en` text,
    `meta_keywords_ar` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `slug` (`slug`),
    KEY `idx_author_id` (`author_id`),
    KEY `idx_category` (`category`),
    KEY `idx_published` (`is_published`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_published_at` (`published_at`),
    FULLTEXT KEY `idx_search_content` (`title_en`, `title_ar`, `content_en`, `content_ar`),
    CONSTRAINT `fk_article_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تعليقات المقالات
CREATE TABLE `article_comments` (
    `id` int NOT NULL AUTO_INCREMENT,
    `article_id` int NOT NULL,
    `user_id` int NOT NULL,
    `parent_id` int DEFAULT NULL,
    `comment` text NOT NULL,
    `is_approved` boolean DEFAULT FALSE,
    `like_count` int DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_article_id` (`article_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_approved` (`is_approved`),
    CONSTRAINT `fk_comment_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_comment_parent` FOREIGN KEY (`parent_id`) REFERENCES `article_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 9. إعدادات النظام والتخصيص
-- ===================================

-- جدول إعدادات النظام
CREATE TABLE `system_settings` (
    `id` int NOT NULL AUTO_INCREMENT,
    `setting_key` varchar(100) NOT NULL UNIQUE,
    `setting_value` longtext,
    `setting_type` enum('string', 'number', 'boolean', 'json', 'text') DEFAULT 'string',
    `category` varchar(50) DEFAULT 'general',
    `description_en` text,
    `description_ar` text,
    `is_public` boolean DEFAULT FALSE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `setting_key` (`setting_key`),
    KEY `idx_category` (`category`),
    KEY `idx_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الصفحات الثابتة
CREATE TABLE `static_pages` (
    `id` int NOT NULL AUTO_INCREMENT,
    `slug` varchar(100) NOT NULL UNIQUE,
    `title_en` varchar(255) NOT NULL,
    `title_ar` varchar(255) NOT NULL,
    `content_en` longtext NOT NULL,
    `content_ar` longtext NOT NULL,
    `meta_title_en` varchar(255),
    `meta_title_ar` varchar(255),
    `meta_description_en` text,
    `meta_description_ar` text,
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `slug` (`slug`),
    KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 10. جداول إضافية للميزات المتقدمة
-- ===================================

-- جدول العروض والتخفيضات
CREATE TABLE `deals` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title_en` varchar(255) NOT NULL,
    `title_ar` varchar(255) NOT NULL,
    `description_en` text,
    `description_ar` text,
    `deal_type` enum('percentage', 'fixed_amount', 'buy_one_get_one', 'bundle') NOT NULL,
    `discount_value` decimal(10,2),
    `min_purchase_amount` decimal(12,2),
    `product_ids` json,
    `store_ids` json,
    `promo_code` varchar(100),
    `banner_image` varchar(500),
    `start_date` timestamp NOT NULL,
    `end_date` timestamp NOT NULL,
    `is_featured` boolean DEFAULT FALSE,
    `is_active` boolean DEFAULT TRUE,
    `usage_count` int DEFAULT 0,
    `max_usage` int,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_active` (`is_active`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول كوبونات الخصم
CREATE TABLE `coupons` (
    `id` int NOT NULL AUTO_INCREMENT,
    `code` varchar(50) NOT NULL UNIQUE,
    `description_en` varchar(255),
    `description_ar` varchar(255),
    `discount_type` enum('percentage', 'fixed_amount') NOT NULL,
    `discount_value` decimal(10,2) NOT NULL,
    `min_purchase_amount` decimal(12,2),
    `max_discount_amount` decimal(12,2),
    `store_id` int,
    `category_ids` json,
    `product_ids` json,
    `usage_limit` int,
    `usage_count` int DEFAULT 0,
    `user_usage_limit` int DEFAULT 1,
    `start_date` timestamp NOT NULL,
    `end_date` timestamp NOT NULL,
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `code` (`code`),
    KEY `idx_active` (`is_active`),
    KEY `idx_dates` (`start_date`, `end_date`),
    KEY `fk_coupon_store` (`store_id`),
    CONSTRAINT `fk_coupon_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول استخدام الكوبونات
CREATE TABLE `coupon_usage` (
    `id` int NOT NULL AUTO_INCREMENT,
    `coupon_id` int NOT NULL,
    `user_id` int NOT NULL,
    `discount_amount` decimal(10,2) NOT NULL,
    `original_amount` decimal(12,2) NOT NULL,
    `final_amount` decimal(12,2) NOT NULL,
    `used_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_coupon_id` (`coupon_id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_usage_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول إحصائيات الموقع
CREATE TABLE `site_analytics` (
    `id` int NOT NULL AUTO_INCREMENT,
    `metric_type` varchar(50) NOT NULL,
    `metric_value` decimal(15,2) NOT NULL,
    `metric_data` json,
    `date` date NOT NULL,
    `hour` tinyint DEFAULT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_metric_date_hour` (`metric_type`, `date`, `hour`),
    KEY `idx_metric_type` (`metric_type`),
    KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تتبع البحث
CREATE TABLE `search_analytics` (
    `id` int NOT NULL AUTO_INCREMENT,
    `query` varchar(255) NOT NULL,
    `user_id` int DEFAULT NULL,
    `results_count` int NOT NULL,
    `filters_used` json,
    `clicked_products` json,
    `session_id` varchar(255),
    `ip_address` varchar(45),
    `user_agent` text,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_query` (`query`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_search_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول نسخ احتياطية للبيانات
CREATE TABLE `data_backups` (
    `id` int NOT NULL AUTO_INCREMENT,
    `backup_type` enum('full', 'incremental', 'schema') NOT NULL,
    `file_path` varchar(500) NOT NULL,
    `file_size` bigint NOT NULL,
    `status` enum('pending', 'completed', 'failed') DEFAULT 'pending',
    `error_message` text,
    `started_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `completed_at` timestamp NULL,
    PRIMARY KEY (`id`),
    KEY `idx_backup_type` (`backup_type`),
    KEY `idx_status` (`status`),
    KEY `idx_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 11. الفهارس المحسنة للأداء
-- ===================================

-- فهارس إضافية للبحث والفلترة
CREATE INDEX idx_products_featured_active ON products(is_featured, is_active, created_at);
CREATE INDEX idx_products_trending_rating ON products(is_trending, rating DESC, total_reviews DESC);
CREATE INDEX idx_products_category_brand ON products(category_id, brand_id, is_active);
CREATE INDEX idx_products_price_range_category ON products(category_id, min_price, max_price);

CREATE INDEX idx_prices_product_store_updated ON product_prices(product_id, store_id, last_updated);
CREATE INDEX idx_prices_store_stock ON product_prices(store_id, stock_status, price);

CREATE INDEX idx_reviews_product_approved_rating ON user_reviews(product_id, is_approved, rating, created_at);
CREATE INDEX idx_reviews_user_approved ON user_reviews(user_id, is_approved, created_at);

CREATE INDEX idx_notifications_user_unread_type ON notifications(user_id, is_read, type, created_at);
CREATE INDEX idx_wishlists_user_created ON user_wishlists(user_id, created_at);

CREATE INDEX idx_articles_published_featured ON articles(is_published, is_featured, published_at);
CREATE INDEX idx_articles_category_published ON articles(category, is_published, published_at);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;