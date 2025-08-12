-- ===================================
-- قاعدة بيانات CopRRA الشاملة والمحدثة
-- نسخة كاملة تتضمن جميع الميزات والأجزاء الديناميكية
-- تاريخ الإنشاء: 2025-01-27
-- محدثة بناءً على محادثة DeepSeek الكاملة
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

-- جدول اللغات المدعومة (أكبر 20 لغة عالمية)
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
    `loyalty_points` int DEFAULT 0,
    `membership_level` enum('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_email` (`email`),
    KEY `idx_username` (`username`),
    KEY `idx_role` (`role`),
    KEY `idx_active` (`is_active`),
    KEY `idx_membership` (`membership_level`),
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

-- جدول نظام النقاط والمكافآت
CREATE TABLE `loyalty_points_history` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `points` int NOT NULL,
    `transaction_type` enum('earned', 'redeemed', 'expired', 'bonus') NOT NULL,
    `reason` varchar(255),
    `reference_type` varchar(50), -- review, purchase, referral, etc.
    `reference_id` int,
    `expires_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_transaction_type` (`transaction_type`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_loyalty_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
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

-- جدول Store Locator - تحديد المتاجر القريبة
CREATE TABLE `store_locations` (
    `id` int NOT NULL AUTO_INCREMENT,
    `store_id` int NOT NULL,
    `branch_name` varchar(255),
    `address` text NOT NULL,
    `city` varchar(100) NOT NULL,
    `state` varchar(100),
    `country` varchar(100) NOT NULL,
    `postal_code` varchar(20),
    `latitude` decimal(10,8),
    `longitude` decimal(11,8),
    `phone` varchar(20),
    `email` varchar(255),
    `opening_hours` json,
    `services_available` json,
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_store_id` (`store_id`),
    KEY `idx_location` (`latitude`, `longitude`),
    KEY `idx_city` (`city`, `country`),
    KEY `idx_active` (`is_active`),
    CONSTRAINT `fk_location_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
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
    `view_count` int DEFAULT 0,
    `availability_status` enum('available', 'out_of_stock', 'discontinued', 'coming_soon') DEFAULT 'available',
    `release_date` date,
    `is_featured` boolean DEFAULT FALSE,
    `is_trending` boolean DEFAULT FALSE,
    `is_deal` boolean DEFAULT FALSE,
    `is_seasonal` boolean DEFAULT FALSE,
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
    KEY `idx_seasonal` (`is_seasonal`),
    KEY `idx_rating` (`rating`),
    KEY `idx_price_range` (`min_price`, `max_price`),
    KEY `idx_popularity` (`popularity_score`),
    KEY `idx_view_count` (`view_count`),
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

-- جدول المنتجات الموسمية والعروض
CREATE TABLE `seasonal_products` (
    `id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NOT NULL,
    `season_type` enum('black_friday', 'cyber_monday', 'christmas', 'new_year', 'ramadan', 'eid', 'summer_sale', 'winter_sale', 'back_to_school') NOT NULL,
    `start_date` date NOT NULL,
    `end_date` date NOT NULL,
    `discount_percentage` decimal(5,2),
    `special_price` decimal(12,2),
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_season_type` (`season_type`),
    KEY `idx_dates` (`start_date`, `end_date`),
    KEY `idx_active` (`is_active`),
    CONSTRAINT `fk_seasonal_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المنتجات المشاهدة مؤخراً
CREATE TABLE `recently_viewed_products` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int,
    `session_id` varchar(255),
    `product_id` int NOT NULL,
    `viewed_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_viewed_at` (`viewed_at`),
    CONSTRAINT `fk_viewed_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_viewed_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
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

-- جدول مقارنة المنتجات (يدعم حتى 4 منتجات)
CREATE TABLE `user_comparisons` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int,
    `session_id` varchar(255),
    `name` varchar(255),
    `products` json NOT NULL,
    `comparison_criteria` json,
    `analysis_result` json, -- نتائج التحليل الذكي (أفضل اقتصاد، أفضل قيمة، أقوى أداء)
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

-- جدول تصويت للأجهزة المفضلة
CREATE TABLE `product_votes` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `product_id` int NOT NULL,
    `vote_type` enum('favorite', 'recommended', 'best_value', 'most_innovative') NOT NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_user_product_vote` (`user_id`, `product_id`, `vote_type`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_vote_type` (`vote_type`),
    CONSTRAINT `fk_vote_user_product` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_vote_product_user` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 7. الإشعارات وتنبيهات الأسعار
-- ===================================

-- جدول الإشعارات
CREATE TABLE `notifications` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `type` enum('price_drop', 'stock_available', 'deal_alert', 'review_response', 'qa_answer', 'system', 'marketing', 'seasonal_offer', 'new_product') NOT NULL,
    `title` varchar(255) NOT NULL,
    `message` text NOT NULL,
    `data` json,
    `action_url` varchar(500),
    `is_read` boolean DEFAULT FALSE,
    `is_sent` boolean DEFAULT FALSE,
    `send_via` json DEFAULT ('["web"]'), -- web, email, push, sms
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

-- جدول Budget Planner - توصيات حسب الميزانية
CREATE TABLE `budget_plans` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `name` varchar(255) NOT NULL,
    `budget_amount` decimal(12,2) NOT NULL,
    `currency_id` int NOT NULL,
    `category_id` int,
    `requirements` json,
    `recommended_products` json,
    `is_active` boolean DEFAULT TRUE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `fk_budget_currency` (`currency_id`),
    CONSTRAINT `fk_budget_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_budget_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_budget_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 8. التسوق والعربة والطلبات (للمواقع التي تدعم الشراء)
-- ===================================

-- جدول عربة التسوق
CREATE TABLE `shopping_cart` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int,
    `session_id` varchar(255),
    `product_id` int NOT NULL,
    `store_id` int NOT NULL,
    `quantity` int DEFAULT 1,
    `price` decimal(12,2) NOT NULL,
    `currency_id` int NOT NULL,
    `added_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_session_id` (`session_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_store_id` (`store_id`),
    KEY `fk_cart_currency` (`currency_id`),
    CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_cart_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الطلبات
CREATE TABLE `orders` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_number` varchar(50) NOT NULL UNIQUE,
    `user_id` int,
    `guest_email` varchar(255),
    `status` enum('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    `total_amount` decimal(12,2) NOT NULL,
    `currency_id` int NOT NULL,
    `payment_method` enum('credit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'crypto') NOT NULL,
    `payment_status` enum('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    `shipping_address` json NOT NULL,
    `billing_address` json NOT NULL,
    `order_notes` text,
    `tracking_number` varchar(100),
    `shipped_at` timestamp NULL,
    `delivered_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `order_number` (`order_number`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_payment_status` (`payment_status`),
    KEY `idx_created_at` (`created_at`),
    KEY `fk_order_currency` (`currency_id`),
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_order_currency` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تفاصيل الطلبات
CREATE TABLE `order_items` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `product_id` int NOT NULL,
    `store_id` int NOT NULL,
    `quantity` int NOT NULL,
    `unit_price` decimal(12,2) NOT NULL,
    `total_price` decimal(12,2) NOT NULL,
    `product_snapshot` json, -- حفظ معلومات المنتج وقت الطلب
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_store_id` (`store_id`),
    CONSTRAINT `fk_item_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_item_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
    CONSTRAINT `fk_item_store` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 9. المحتوى والمقالات
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
    `category` enum('news', 'review', 'guide', 'comparison', 'tech_tips', 'deals', 'buying_guide') NOT NULL,
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

-- جدول شهادات العملاء
CREATE TABLE `customer_testimonials` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `name` varchar(255) NOT NULL,
    `position` varchar(255),
    `company` varchar(255),
    `testimonial_text` text NOT NULL,
    `rating` tinyint CHECK (`rating` >= 1 AND `rating` <= 5),
    `photo_url` varchar(500),
    `is_featured` boolean DEFAULT FALSE,
    `is_approved` boolean DEFAULT FALSE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_approved` (`is_approved`),
    CONSTRAINT `fk_testimonial_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 10. إعدادات النظام والتخصيص
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

-- جدول النشرة البريدية
CREATE TABLE `newsletter_subscribers` (
    `id` int NOT NULL AUTO_INCREMENT,
    `email` varchar(255) NOT NULL UNIQUE,
    `name` varchar(255),
    `user_id` int,
    `preferred_language_id` int DEFAULT 1,
    `subscription_types` json, -- deals, new_products, articles, etc.
    `is_active` boolean DEFAULT TRUE,
    `verification_token` varchar(255),
    `verified_at` timestamp NULL,
    `unsubscribed_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_active` (`is_active`),
    KEY `fk_newsletter_language` (`preferred_language_id`),
    CONSTRAINT `fk_newsletter_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_newsletter_language` FOREIGN KEY (`preferred_language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 11. جداول إضافية للميزات المتقدمة
-- ===================================

-- جدول العروض والتخفيضات
CREATE TABLE `deals` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title_en` varchar(255) NOT NULL,
    `title_ar` varchar(255) NOT NULL,
    `description_en` text,
    `description_ar` text,
    `deal_type` enum('percentage', 'fixed_amount', 'buy_one_get_one', 'bundle', 'flash_sale') NOT NULL,
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
    `view_count` int DEFAULT 0,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_active` (`is_active`),
    KEY `idx_featured` (`is_featured`),
    KEY `idx_dates` (`start_date`, `end_date`),
    KEY `idx_deal_type` (`deal_type`)
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
    `order_id` int,
    `discount_amount` decimal(10,2) NOT NULL,
    `original_amount` decimal(12,2) NOT NULL,
    `final_amount` decimal(12,2) NOT NULL,
    `used_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_coupon_id` (`coupon_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_order_id` (`order_id`),
    CONSTRAINT `fk_usage_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_usage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_usage_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول برنامج الشراكة (Affiliate Program)
CREATE TABLE `affiliate_partners` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `affiliate_code` varchar(50) NOT NULL UNIQUE,
    `commission_rate` decimal(5,2) DEFAULT 5.00,
    `total_earnings` decimal(12,2) DEFAULT 0.00,
    `total_clicks` int DEFAULT 0,
    `total_conversions` int DEFAULT 0,
    `payment_method` enum('paypal', 'bank_transfer', 'crypto') DEFAULT 'paypal',
    `payment_details` json,
    `is_active` boolean DEFAULT TRUE,
    `approved_at` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `affiliate_code` (`affiliate_code`),
    UNIQUE KEY `user_id` (`user_id`),
    KEY `idx_active` (`is_active`),
    CONSTRAINT `fk_affiliate_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تتبع الشراكة
CREATE TABLE `affiliate_tracking` (
    `id` int NOT NULL AUTO_INCREMENT,
    `affiliate_id` int NOT NULL,
    `visitor_ip` varchar(45),
    `visitor_user_agent` text,
    `referrer_url` varchar(1000),
    `landing_page` varchar(1000),
    `click_date` timestamp DEFAULT CURRENT_TIMESTAMP,
    `conversion_date` timestamp NULL,
    `order_id` int,
    `commission_amount` decimal(10,2) DEFAULT 0.00,
    `is_paid` boolean DEFAULT FALSE,
    PRIMARY KEY (`id`),
    KEY `idx_affiliate_id` (`affiliate_id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_click_date` (`click_date`),
    CONSTRAINT `fk_tracking_affiliate` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliate_partners` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tracking_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 12. التحليلات والإحصائيات
-- ===================================

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
    `search_type` enum('text', 'voice', 'image') DEFAULT 'text',
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_query` (`query`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_search_type` (`search_type`),
    KEY `idx_created_at` (`created_at`),
    CONSTRAINT `fk_search_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تخصيص الصفحة الرئيسية
CREATE TABLE `user_homepage_preferences` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `preferred_categories` json,
    `preferred_brands` json,
    `price_range_preferences` json,
    `layout_preferences` json,
    `content_preferences` json, -- news, deals, reviews, etc.
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_id` (`user_id`),
    CONSTRAINT `fk_homepage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 13. النسخ الاحتياطية والتكامل
-- ===================================

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

-- جدول تكامل السوشيال ميديا
CREATE TABLE `social_media_integration` (
    `id` int NOT NULL AUTO_INCREMENT,
    `platform` enum('facebook', 'twitter', 'instagram', 'youtube', 'tiktok', 'linkedin') NOT NULL,
    `account_id` varchar(255),
    `access_token` text,
    `refresh_token` text,
    `account_info` json,
    `is_active` boolean DEFAULT TRUE,
    `last_sync` timestamp NULL,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_platform` (`platform`),
    KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول منشورات السوشيال ميديا
CREATE TABLE `social_media_posts` (
    `id` int NOT NULL AUTO_INCREMENT,
    `integration_id` int NOT NULL,
    `product_id` int,
    `article_id` int,
    `post_type` enum('product_share', 'article_share', 'deal_promotion', 'custom') NOT NULL,
    `content` text NOT NULL,
    `media_urls` json,
    `hashtags` json,
    `post_id` varchar(255), -- ID from social platform
    `scheduled_at` timestamp NULL,
    `posted_at` timestamp NULL,
    `engagement_stats` json,
    `is_published` boolean DEFAULT FALSE,
    `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_integration_id` (`integration_id`),
    KEY `idx_product_id` (`product_id`),
    KEY `idx_article_id` (`article_id`),
    KEY `idx_scheduled_at` (`scheduled_at`),
    CONSTRAINT `fk_post_integration` FOREIGN KEY (`integration_id`) REFERENCES `social_media_integration` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_post_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_post_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 14. الفهارس المحسنة للأداء
-- ===================================

-- فهارس إضافية للبحث والفلترة
CREATE INDEX idx_products_featured_active ON products(is_featured, is_active, created_at);
CREATE INDEX idx_products_trending_rating ON products(is_trending, rating DESC, total_reviews DESC);
CREATE INDEX idx_products_category_brand ON products(category_id, brand_id, is_active);
CREATE INDEX idx_products_price_range_category ON products(category_id, min_price, max_price);
CREATE INDEX idx_products_seasonal_active ON products(is_seasonal, is_active, created_at);

CREATE INDEX idx_prices_product_store_updated ON product_prices(product_id, store_id, last_updated);
CREATE INDEX idx_prices_store_stock ON product_prices(store_id, stock_status, price);

CREATE INDEX idx_reviews_product_approved_rating ON user_reviews(product_id, is_approved, rating, created_at);
CREATE INDEX idx_reviews_user_approved ON user_reviews(user_id, is_approved, created_at);

CREATE INDEX idx_notifications_user_unread_type ON notifications(user_id, is_read, type, created_at);
CREATE INDEX idx_wishlists_user_created ON user_wishlists(user_id, created_at);

CREATE INDEX idx_articles_published_featured ON articles(is_published, is_featured, published_at);
CREATE INDEX idx_articles_category_published ON articles(category, is_published, published_at);

CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at);
CREATE INDEX idx_orders_status_date ON orders(status, created_at);

CREATE INDEX idx_loyalty_user_type ON loyalty_points_history(user_id, transaction_type, created_at);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;