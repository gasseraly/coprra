-- Enhanced CopRRA Database Schema
-- إصدار محسن ومطور لقاعدة بيانات CopRRA

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ===================================
-- الجداول الأساسية المحسنة
-- ===================================

-- جدول اللغات
CREATE TABLE `languages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `native_name` varchar(50) NOT NULL,
  `flag` varchar(10) NOT NULL,
  `is_rtl` boolean DEFAULT FALSE,
  `is_active` boolean DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول العملات
CREATE TABLE `currencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `symbol` varchar(10) NOT NULL,
  `flag` varchar(10) NOT NULL,
  `country` varchar(50) NOT NULL,
  `exchange_rate` decimal(10,4) DEFAULT 1.0000,
  `is_active` boolean DEFAULT TRUE,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التصنيفات المحسن
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name_en` varchar(255) NOT NULL,
  `name_ar` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description_en` text,
  `description_ar` text,
  `parent_id` int DEFAULT NULL,
  `icon` varchar(100),
  `image_url` varchar(255),
  `sort_order` int DEFAULT 0,
  `is_active` boolean DEFAULT TRUE,
  `seo_title_en` varchar(255),
  `seo_title_ar` varchar(255),
  `seo_description_en` text,
  `seo_description_ar` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `parent_id` (`parent_id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_sort` (`sort_order`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول العلامات التجارية المحسن
CREATE TABLE `brands` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description_en` text,
  `description_ar` text,
  `logo_url` varchar(255) DEFAULT NULL,
  `website_url` varchar(255),
  `is_featured` boolean DEFAULT FALSE,
  `is_active` boolean DEFAULT TRUE,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المستخدمين المحسن
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20),
  `date_of_birth` DATE,
  `gender` ENUM('male', 'female', 'other'),
  `verification_token` VARCHAR(255) NULL,
  `email_verified` BOOLEAN DEFAULT FALSE,
  `verified_at` TIMESTAMP NULL,
  `reset_token` VARCHAR(255) NULL,
  `reset_token_expires` TIMESTAMP NULL,
  `last_login` TIMESTAMP NULL,
  `login_attempts` INT DEFAULT 0,
  `locked_until` TIMESTAMP NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `role` ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  `avatar_url` VARCHAR(255) NULL,
  `preferred_language` VARCHAR(10) DEFAULT 'ar',
  `preferred_currency` VARCHAR(10) DEFAULT 'SAR',
  `privacy_settings` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`),
  INDEX `idx_active` (`is_active`),
  FOREIGN KEY (`preferred_language`) REFERENCES `languages`(`code`) ON UPDATE CASCADE,
  FOREIGN KEY (`preferred_currency`) REFERENCES `currencies`(`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول جلسات المستخدمين المحسن
CREATE TABLE `user_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `session_token` VARCHAR(255) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `expires_at` TIMESTAMP NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `last_activity` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_token` (`session_token`),
  INDEX `idx_expires` (`expires_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المنتجات المحسن
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name_en` VARCHAR(255) NOT NULL,
  `name_ar` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description_en` LONGTEXT,
  `description_ar` LONGTEXT,
  `short_description_en` TEXT,
  `short_description_ar` TEXT,
  `main_image_url` VARCHAR(255) NULL,
  `category_id` INT,
  `brand_id` INT,
  `model_number` VARCHAR(100),
  `barcode` VARCHAR(50),
  `sku` VARCHAR(100),
  `price` DECIMAL(10, 2) NULL,
  `min_price` DECIMAL(10, 2) NULL,
  `max_price` DECIMAL(10, 2) NULL,
  `currency_code` VARCHAR(10) DEFAULT 'SAR',
  `average_rating` DECIMAL(2, 1) DEFAULT 0.0,
  `total_reviews` INT DEFAULT 0,
  `total_questions` INT DEFAULT 0,
  `view_count` INT DEFAULT 0,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_active` BOOLEAN DEFAULT TRUE,
  `availability_status` ENUM('in_stock', 'out_of_stock', 'discontinued') DEFAULT 'in_stock',
  `seo_title_en` VARCHAR(255),
  `seo_title_ar` VARCHAR(255),
  `seo_description_en` TEXT,
  `seo_description_ar` TEXT,
  `seo_keywords_en` TEXT,
  `seo_keywords_ar` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_brand` (`brand_id`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_rating` (`average_rating`),
  INDEX `idx_price` (`price`),
  FULLTEXT `idx_search_en` (`name_en`, `description_en`),
  FULLTEXT `idx_search_ar` (`name_ar`, `description_ar`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- الجداول الجديدة المضافة
-- ===================================

-- جدول المتاجر
CREATE TABLE `stores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description_en` TEXT,
  `description_ar` TEXT,
  `logo_url` VARCHAR(255),
  `website_url` VARCHAR(255) NOT NULL,
  `affiliate_program` VARCHAR(100),
  `commission_rate` DECIMAL(5,2),
  `api_endpoint` VARCHAR(255),
  `api_key` VARCHAR(255),
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `trust_score` DECIMAL(3,2) DEFAULT 0.00,
  `response_time_avg` INT DEFAULT 0,
  `last_sync` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_active` (`is_active`),
  INDEX `idx_verified` (`is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أسعار المنتجات المحسن
CREATE TABLE `product_prices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `store_id` INT,
  `store_name` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `original_price` DECIMAL(10, 2),
  `discount_percentage` DECIMAL(5,2),
  `currency_code` VARCHAR(10) NOT NULL,
  `product_url` VARCHAR(2048) NOT NULL,
  `affiliate_url` VARCHAR(2048),
  `availability` ENUM('in_stock', 'out_of_stock', 'limited_stock', 'preorder') DEFAULT 'in_stock',
  `shipping_cost` DECIMAL(8,2),
  `shipping_time` VARCHAR(50),
  `is_sale` BOOLEAN DEFAULT FALSE,
  `sale_end_date` TIMESTAMP NULL,
  `last_updated` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_product` (`product_id`),
  INDEX `idx_store` (`store_id`),
  INDEX `idx_price` (`price`),
  INDEX `idx_updated` (`last_updated`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`currency_code`) REFERENCES `currencies`(`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تاريخ الأسعار
CREATE TABLE `price_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `store_id` INT,
  `price` DECIMAL(10, 2) NOT NULL,
  `currency_code` VARCHAR(10) NOT NULL,
  `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_product_date` (`product_id`, `recorded_at`),
  INDEX `idx_store_date` (`store_id`, `recorded_at`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المواصفات
CREATE TABLE `product_specifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `spec_group_en` VARCHAR(100),
  `spec_group_ar` VARCHAR(100),
  `spec_key_en` VARCHAR(255) NOT NULL,
  `spec_key_ar` VARCHAR(255) NOT NULL,
  `spec_value_en` TEXT,
  `spec_value_ar` TEXT,
  `sort_order` INT DEFAULT 0,
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول صور المنتجات
CREATE TABLE `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `alt_text_en` VARCHAR(255) NULL,
  `alt_text_ar` VARCHAR(255) NULL,
  `sort_order` INT DEFAULT 0,
  `is_primary` BOOLEAN DEFAULT FALSE,
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المراجعات المحسن
CREATE TABLE `user_reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `title` VARCHAR(255) NOT NULL,
  `review_text` TEXT NOT NULL,
  `pros` TEXT,
  `cons` TEXT,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `is_verified_purchase` BOOLEAN DEFAULT FALSE,
  `helpful_votes` INT DEFAULT 0,
  `unhelpful_votes` INT DEFAULT 0,
  `store_id` INT,
  `purchase_date` DATE,
  `usage_period` VARCHAR(50),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product` (`product_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_approved` (`is_approved`),
  INDEX `idx_rating` (`rating`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الأسئلة والأجوبة المحسن
CREATE TABLE `product_qa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NULL,
  `answered_by` INT NULL,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `helpful_votes` INT DEFAULT 0,
  `category` ENUM('general', 'technical', 'shipping', 'warranty', 'compatibility') DEFAULT 'general',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `answered_at` TIMESTAMP NULL,
  INDEX `idx_product` (`product_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_approved` (`is_approved`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`answered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المفضلة (Wishlist)
CREATE TABLE `user_wishlists` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `notes` TEXT,
  `price_alert_enabled` BOOLEAN DEFAULT FALSE,
  `target_price` DECIMAL(10,2),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `user_product` (`user_id`, `product_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_product` (`product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المقارنات
CREATE TABLE `product_comparisons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `session_id` VARCHAR(255),
  `comparison_data` JSON NOT NULL,
  `is_saved` BOOLEAN DEFAULT FALSE,
  `name` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_session` (`session_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الإشعارات
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` ENUM('price_alert', 'stock_alert', 'review_reply', 'system') NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `title_ar` VARCHAR(255) NOT NULL,
  `message_en` TEXT NOT NULL,
  `message_ar` TEXT NOT NULL,
  `related_product_id` INT,
  `related_url` VARCHAR(255),
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_read` (`is_read`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`related_product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول الصفحات الثابتة
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `title_en` varchar(255) NOT NULL,
  `title_ar` varchar(255) NOT NULL,
  `content_en` longtext,
  `content_ar` longtext,
  `excerpt_en` text,
  `excerpt_ar` text,
  `meta_title_ar` varchar(255) DEFAULT NULL,
  `meta_title_en` varchar(255) DEFAULT NULL,
  `meta_description_ar` text,
  `meta_description_en` text,
  `is_active` tinyint(1) DEFAULT 1,
  `template` VARCHAR(50) DEFAULT 'default',
  `sort_order` INT DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المقالات المحسن
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `title_en` varchar(255) NOT NULL,
  `title_ar` varchar(255) NOT NULL,
  `content_en` longtext,
  `content_ar` longtext,
  `excerpt_en` text,
  `excerpt_ar` text,
  `image_url` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `tags_en` text,
  `tags_ar` text,
  `author` varchar(100) DEFAULT NULL,
  `author_id` INT,
  `is_published` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `view_count` INT DEFAULT 0,
  `reading_time` INT DEFAULT 0,
  `publish_date` TIMESTAMP NULL,
  `meta_title_en` varchar(255),
  `meta_title_ar` varchar(255),
  `meta_description_en` text,
  `meta_description_ar` text,
  `seo_keywords_en` text,
  `seo_keywords_ar` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  INDEX `idx_published` (`is_published`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_category` (`category`),
  FULLTEXT `idx_search_en` (`title_en`, `content_en`),
  FULLTEXT `idx_search_ar` (`title_ar`, `content_ar`),
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول إعدادات الموقع
CREATE TABLE `site_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT,
  `setting_type` ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  `description_en` TEXT,
  `description_ar` TEXT,
  `is_public` BOOLEAN DEFAULT FALSE,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`setting_key`),
  INDEX `idx_public` (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجل العمليات (Audit Log)
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `action` VARCHAR(100) NOT NULL,
  `table_name` VARCHAR(50),
  `record_id` INT,
  `old_values` JSON,
  `new_values` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_table` (`table_name`),
  INDEX `idx_date` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول إحصائيات الأداء
CREATE TABLE `performance_stats` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `date` DATE NOT NULL,
  `metric_name` VARCHAR(100) NOT NULL,
  `metric_value` DECIMAL(12,2) NOT NULL,
  `metadata` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `date_metric` (`date`, `metric_name`),
  INDEX `idx_date` (`date`),
  INDEX `idx_metric` (`metric_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- إدراج البيانات الأساسية
-- ===================================

-- اللغات
INSERT INTO `languages` VALUES 
(1,'en','English','English','🇺🇸',FALSE,TRUE),
(2,'ar','Arabic','العربية','🇸🇦',TRUE,TRUE),
(3,'fr','French','Français','🇫🇷',FALSE,TRUE),
(4,'es','Spanish','Español','🇪🇸',FALSE,TRUE);

-- العملات
INSERT INTO `currencies` VALUES 
(1,'USD','US Dollar','$','🇺🇸','United States',3.75,TRUE,'2025-08-10 10:00:00'),
(2,'EUR','Euro','€','🇪🇺','European Union',4.10,TRUE,'2025-08-10 10:00:00'),
(3,'GBP','British Pound','£','🇬🇧','United Kingdom',4.75,TRUE,'2025-08-10 10:00:00'),
(4,'SAR','Saudi Riyal','ر.س','🇸🇦','Saudi Arabia',1.00,TRUE,'2025-08-10 10:00:00'),
(5,'AED','UAE Dirham','د.إ','🇦🇪','UAE',1.02,TRUE,'2025-08-10 10:00:00'),
(6,'EGP','Egyptian Pound','ج.م','🇪🇬','Egypt',0.12,TRUE,'2025-08-10 10:00:00');

-- التصنيفات
INSERT INTO `categories` VALUES 
(1,'Electronics','الإلكترونيات','electronics','تشمل جميع الأجهزة الإلكترونية','Includes all electronic devices',NULL,'📱',NULL,1,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(2,'Home Appliances','الأجهزة المنزلية','home-appliances','أجهزة المنزل والمطبخ','Home and kitchen appliances',NULL,'🏠',NULL,2,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(3,'Computers','الكمبيوتر','computers','أجهزة الكمبيوتر واللابتوب','Computers and laptops',NULL,'💻',NULL,3,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(4,'Mobile Phones','الهواتف المحمولة','mobile-phones','الهواتف الذكية والعادية','Smartphones and regular phones',1,'📱',NULL,1,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(5,'Tablets','الأجهزة اللوحية','tablets','الأجهزة اللوحية والآيباد','Tablets and iPads',1,'📱',NULL,2,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(6,'Televisions','أجهزة التلفزيون','televisions','شاشات التلفزيون الذكية','Smart TVs and displays',1,'📺',NULL,3,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(7,'Audio & Headphones','الصوتيات وسماعات الرأس','audio-headphones','سماعات ومعدات صوتية','Headphones and audio equipment',1,'🎧',NULL,4,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(8,'Refrigerators','الثلاجات','refrigerators','ثلاجات منزلية','Home refrigerators',2,'❄️',NULL,1,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(9,'Washing Machines','غسالات الملابس','washing-machines','غسالات ملابس','Clothes washing machines',2,'🧺',NULL,2,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(10,'Air Conditioners','مكيفات الهواء','air-conditioners','مكيفات هوائية','Air conditioning units',2,'❄️',NULL,3,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(11,'Laptops','الحاسوب المحمول','laptops','أجهزة لابتوب','Laptop computers',3,'💻',NULL,1,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(12,'Desktop Computers','أجهزة الكمبيوتر المكتبية','desktop-computers','كمبيوتر مكتبي','Desktop computers',3,'🖥️',NULL,2,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(13,'Gaming','الألعاب','gaming','أجهزة وإكسسوارات الألعاب','Gaming devices and accessories',3,'🎮',NULL,3,TRUE,NULL,NULL,NULL,NULL,'2025-08-10 10:00:00','2025-08-10 10:00:00');

-- العلامات التجارية
INSERT INTO `brands` VALUES 
(1,'Samsung','samsung','Samsung Electronics','سامسونج للإلكترونيات','https://example.com/logos/samsung.png','https://samsung.com',TRUE,TRUE,1,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(2,'Apple','apple','Apple Inc.','شركة أبل','https://example.com/logos/apple.png','https://apple.com',TRUE,TRUE,2,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(3,'LG','lg','LG Electronics','إل جي للإلكترونيات','https://example.com/logos/lg.png','https://lg.com',TRUE,TRUE,3,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(4,'Sony','sony','Sony Corporation','شركة سوني','https://example.com/logos/sony.png','https://sony.com',TRUE,TRUE,4,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(5,'Huawei','huawei','Huawei Technologies','هواوي للتقنيات','https://example.com/logos/huawei.png','https://huawei.com',FALSE,TRUE,5,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(6,'Xiaomi','xiaomi','Xiaomi Corporation','شركة شاومي','https://example.com/logos/xiaomi.png','https://xiaomi.com',TRUE,TRUE,6,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(7,'Dell','dell','Dell Technologies','ديل للتقنيات','https://example.com/logos/dell.png','https://dell.com',FALSE,TRUE,7,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(8,'HP','hp','HP Inc.','شركة إتش بي','https://example.com/logos/hp.png','https://hp.com',FALSE,TRUE,8,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(9,'Lenovo','lenovo','Lenovo Group','مجموعة لينوفو','https://example.com/logos/lenovo.png','https://lenovo.com',FALSE,TRUE,9,'2025-08-10 10:00:00','2025-08-10 10:00:00'),
(10,'Asus','asus','ASUSTeK Computer','أسوس للكمبيوتر','https://example.com/logos/asus.png','https://asus.com',FALSE,TRUE,10,'2025-08-10 10:00:00','2025-08-10 10:00:00');

-- المتاجر
INSERT INTO `stores` VALUES 
(1,'Amazon Saudi Arabia','amazon-sa','Amazon online store','متجر أمازون الإلكتروني','https://example.com/logos/amazon.png','https://amazon.sa','Amazon Associates',5.00,NULL,NULL,TRUE,TRUE,4.50,120,'2025-08-10 09:00:00','2025-08-10 10:00:00','2025-08-10 10:00:00'),
(2,'Jarir Bookstore','jarir','Jarir Bookstore chain','مكتبة جرير','https://example.com/logos/jarir.png','https://jarir.com',NULL,0.00,NULL,NULL,TRUE,TRUE,4.20,200,'2025-08-10 09:00:00','2025-08-10 10:00:00','2025-08-10 10:00:00'),
(3,'Extra','extra','Extra Electronics','إكسترا للإلكترونيات','https://example.com/logos/extra.png','https://extra.com',NULL,0.00,NULL,NULL,TRUE,TRUE,4.00,180,'2025-08-10 09:00:00','2025-08-10 10:00:00','2025-08-10 10:00:00'),
(4,'Noon','noon','Noon.com marketplace','موقع نون للتسوق','https://example.com/logos/noon.png','https://noon.com','Noon Partner',4.50,NULL,NULL,TRUE,TRUE,4.30,150,'2025-08-10 09:00:00','2025-08-10 10:00:00','2025-08-10 10:00:00'),
(5,'STC Store','stc-store','STC eStore','متجر إس تي سي','https://example.com/logos/stc.png','https://store.stc.com.sa',NULL,0.00,NULL,NULL,TRUE,TRUE,3.80,250,'2025-08-10 09:00:00','2025-08-10 10:00:00','2025-08-10 10:00:00');

-- الصفحات الثابتة
INSERT INTO `pages` VALUES
(11,'privacy-policy','Privacy Policy','سياسة الخصوصية','<h1>Privacy Policy</h1>
<p>This privacy policy explains how we collect, use, and protect your personal information when you use our website.</p>
<h2>Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
<h2>How We Use Your Information</h2>
<p>We use the collected information to provide and improve our services, and send notifications about offers and updates.</p>
<h2>Data Protection</h2>
<p>We implement advanced security measures to protect your personal information, including encryption and continuous monitoring.</p>','<h1>سياسة الخصوصية</h1>
<p>تشرح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام موقعنا الإلكتروني.</p>
<h2>المعلومات التي نجمعها</h2>
<p>نجمع المعلومات التي تقدمها لنا مباشرة، مثل عندما تنشئ حسابًا أو تقوم بعملية شراء أو تتصل بنا للحصول على الدعم.</p>
<h2>كيف نستخدم معلوماتك</h2>
<p>نستخدم المعلومات المجمعة لتقديم خدماتنا وتحسينها، وإرسال إشعارات حول العروض والتحديثات.</p>
<h2>حماية البيانات</h2>
<p>نتخذ تدابير أمنية متقدمة لحماية معلوماتك الشخصية، بما في ذلك التشفير والمراقبة المستمرة.</p>','Learn how we protect your privacy','تعرف على حماية خصوصيتك','سياسة الخصوصية - CopRRA','Privacy Policy - CopRRA','تعرف على كيفية حماية خصوصيتك وبياناتك الشخصية في موقع CopRRA','Learn how we protect your privacy and personal data at CopRRA',1,'legal',1,'2025-08-10 10:20:18','2025-08-10 10:20:18'),
(12,'terms-of-service','Terms of Service','شروط الاستخدام','<h1>Terms of Service</h1>
<p>Welcome to CopRRA, the leading price comparison platform. By using our website and services, you agree to comply with these terms of use.</p>
<h2>Acceptance of Terms</h2>
<p>By using the CopRRA website, you confirm that you are 18 years of age or older and have the legal capacity to enter into this agreement.</p>
<h2>Service Description</h2>
<p>CopRRA provides price comparison services for products from different stores, and displays product information and reviews.</p>
<h2>User Responsibilities</h2>
<p>As a user of our services, you agree to provide accurate information and maintain the confidentiality of your account data.</p>','<h1>شروط الاستخدام</h1>
<p>مرحباً بك في CopRRA، منصة مقارنة الأسعار الرائدة. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بشروط الاستخدام هذه.</p>
<h2>قبول الشروط</h2>
<p>باستخدام موقع CopRRA، فإنك تؤكد أنك تبلغ من العمر 18 عاماً أو أكثر وتمتلك الأهلية القانونية لإبرام هذه الاتفاقية.</p>
<h2>وصف الخدمات</h2>
<p>تقدم CopRRA خدمات مقارنة أسعار المنتجات من متاجر مختلفة، وعرض معلومات المنتجات والمراجعات.</p>
<h2>مسؤوليات المستخدم</h2>
<p>كمستخدم لخدماتنا، فإنك توافق على تقديم معلومات دقيقة والحفاظ على سرية بيانات حسابك.</p>','Terms and conditions','الشروط والأحكام','شروط الاستخدام - CopRRA','Terms of Service - CopRRA','اقرأ شروط استخدام موقع CopRRA لمقارنة الأسعار','Read the terms of use for CopRRA price comparison website',1,'legal',2,'2025-08-10 10:20:18','2025-08-10 10:20:18'),
(13,'about-us','About Us','من نحن','<h1>About Us</h1>
<p>CopRRA is the leading price comparison platform in the region, aimed at helping consumers find the best prices for the products they need.</p>
<h2>Our Vision</h2>
<p>To be the first price comparison platform in the region, and help consumers make informed purchasing decisions.</p>
<h2>Our Mission</h2>
<p>Provide comprehensive and accurate price comparison service, with useful product information to help customers make optimal choices.</p>
<h2>Our Values</h2>
<ul>
<li>Transparency in displaying prices and information</li>
<li>Accuracy in provided data</li>
<li>Ease of use</li>
<li>Excellent customer service</li>
</ul>','<h1>من نحن</h1>
<p>CopRRA هي منصة مقارنة الأسعار الرائدة في المنطقة، تهدف إلى مساعدة المستهلكين في العثور على أفضل الأسعار للمنتجات التي يحتاجونها.</p>
<h2>رؤيتنا</h2>
<p>أن نكون المنصة الأولى لمقارنة الأسعار في المنطقة، ونساعد المستهلكين في اتخاذ قرارات شراء مدروسة.</p>
<h2>مهمتنا</h2>
<p>تقديم خدمة مقارنة أسعار شاملة ودقيقة، مع توفير معلومات مفيدة حول المنتجات لمساعدة العملاء في الاختيار الأمثل.</p>
<h2>قيمنا</h2>
<ul>
<li>الشفافية في عرض الأسعار والمعلومات</li>
<li>الدقة في البيانات المقدمة</li>
<li>سهولة الاستخدام</li>
<li>خدمة العملاء المتميزة</li>
</ul>','About CopRRA','حول CopRRA','من نحن - CopRRA','About Us - CopRRA','تعرف على CopRRA ورؤيتنا في مقارنة الأسعار','Learn about CopRRA and our vision in price comparison',1,'default',3,'2025-08-10 10:20:18','2025-08-10 10:20:18'),
(14,'contact-us','Contact Us','اتصل بنا','<h1>Contact Us</h1>
<p>We are here to help you! Do not hesitate to contact us for any inquiries or suggestions.</p>
<h2>Contact Information</h2>
<p><strong>Email:</strong> info@coprra.com</p>
<p><strong>Phone:</strong> +966 11 123 4567</p>
<p><strong>Address:</strong> Riyadh, Saudi Arabia</p>
<h2>Working Hours</h2>
<p>Sunday - Thursday: 9:00 AM - 6:00 PM</p>
<p>Friday - Saturday: Closed</p>
<h2>Technical Support</h2>
<p>For technical support, please email us at: support@coprra.com</p>','<h1>اتصل بنا</h1>
<p>نحن هنا لمساعدتك! لا تتردد في التواصل معنا لأي استفسارات أو اقتراحات.</p>
<h2>معلومات الاتصال</h2>
<p><strong>البريد الإلكتروني:</strong> info@coprra.com</p>
<p><strong>الهاتف:</strong> +966 11 123 4567</p>
<p><strong>العنوان:</strong> الرياض، المملكة العربية السعودية</p>
<h2>ساعات العمل</h2>
<p>الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً</p>
<p>الجمعة - السبت: مغلق</p>
<h2>الدعم الفني</h2>
<p>للدعم الفني، يرجى مراسلتنا على: support@coprra.com</p>','Contact information','معلومات الاتصال','اتصل بنا - CopRRA','Contact Us - CopRRA','تواصل مع فريق CopRRA للاستفسارات والدعم','Contact CopRRA team for inquiries and support',1,'contact',4,'2025-08-10 10:20:18','2025-08-10 10:20:18'),
(15,'faq','FAQ','الأسئلة الشائعة','<h1>Frequently Asked Questions</h1>
<h2>What is CopRRA?</h2>
<p>CopRRA is a price comparison website that helps users find the best prices across multiple stores.</p>
<h2>How does CopRRA work?</h2>
<p>We gather product data from various sources and display them in an easy-to-compare format.</p>
<h2>Is CopRRA free to use?</h2>
<p>Yes, CopRRA is completely free for consumers to use.</p>
<h2>How often are prices updated?</h2>
<p>We update prices regularly to ensure you get the most current information available.</p>
<h2>Can I purchase directly through CopRRA?</h2>
<p>No, we redirect you to the retailer''s website where you can complete your purchase.</p>','<h1>الأسئلة الشائعة</h1>
<h2>ما هو CopRRA؟</h2>
<p>CopRRA هو موقع لمقارنة الأسعار يساعد المستخدمين في العثور على أفضل الأسعار عبر متاجر متعددة.</p>
<h2>كيف يعمل CopRRA؟</h2>
<p>نجمع بيانات المنتجات من مصادر متعددة ونعرضها بطريقة تسهل المقارنة بينها.</p>
<h2>هل استخدام CopRRA مجاني؟</h2>
<p>نعم، CopRRA مجاني تماماً للمستهلكين.</p>
<h2>كم مرة يتم تحديث الأسعار؟</h2>
<p>نقوم بتحديث الأسعار بانتظام لضمان حصولك على أحدث المعلومات المتاحة.</p>
<h2>هل يمكنني الشراء مباشرة من خلال CopRRA؟</h2>
<p>لا، نقوم بتوجيهك إلى موقع المتجر حيث يمكنك إكمال عملية الشراء.</p>','Frequently asked questions','الأسئلة الشائعة','الأسئلة الشائعة - CopRRA','FAQ - CopRRA','تعرف على الأسئلة الشائعة حول استخدام موقع CopRRA','Learn the most frequently asked questions about using CopRRA',1,'faq',5,'2025-08-10 10:20:18','2025-08-10 10:20:18');

-- المقالات
INSERT INTO `articles` VALUES 
(1,'best-smartphones-2024','Best Smartphones of 2024','أفضل الهواتف الذكية لعام 2024','<p>As we move through 2024, the smartphone market continues to evolve with exciting new features and improvements. Here are our top picks for the best smartphones this year.</p><h2>Premium Flagship Phones</h2><p>The Samsung Galaxy S24 Ultra and iPhone 15 Pro Max lead the pack with their advanced cameras, powerful processors, and premium build quality.</p>','<p>مع تقدمنا خلال عام 2024، يستمر سوق الهواتف الذكية في التطور مع ميزات وتحسينات جديدة ومثيرة. إليكم أفضل اختياراتنا للهواتف الذكية هذا العام.</p><h2>الهواتف الرائدة المتميزة</h2><p>يتصدر سامسونج جالاكسي S24 الترا وآيفون 15 برو ماكس المجموعة بكاميراتهما المتقدمة ومعالجاتهما القوية وجودة البناء المتميزة.</p>','Best smartphone picks for 2024','أفضل الهواتف لعام 2024','https://example.com/images/best-smartphones-2024.jpg','technology','smartphones, mobile, 2024, reviews','هواتف ذكية, موبايل, 2024, مراجعات','CopRRA Team',NULL,1,1,0,5,'2025-08-10 09:56:23','أفضل الهواتف الذكية لعام 2024','Best Smartphones of 2024','دليل شامل لأفضل الهواتف الذكية في عام 2024','Complete guide to the best smartphones in 2024','smartphones, mobile phones, 2024, reviews','هواتف ذكية, تليفونات محمولة, 2024, مراجعات','2025-08-10 09:56:23','2025-08-10 09:56:23'),
(2,'tv-buying-guide-2024','TV Buying Guide 2024','دليل شراء التلفزيون 2024','<p>Choosing the right TV can be overwhelming with so many options available. This comprehensive guide will help you make the best decision for your needs and budget.</p><h2>Display Technology</h2><p>OLED, QLED, and LED - understanding the differences between these technologies is crucial for making an informed purchase.</p>','<p>قد يكون اختيار التلفزيون المناسب أمرًا صعبًا مع وجود العديد من الخيارات المتاحة. سيساعدك هذا الدليل الشامل على اتخاذ أفضل قرار يناسب احتياجاتك وميزانيتك.</p><h2>تقنية العرض</h2><p>أوليد وكيو ليد وليد - فهم الاختلافات بين هذه التقنيات أمر بالغ الأهمية لاتخاذ قرار شراء مدروس.</p>','Complete TV buying guide','دليل شراء التلفزيون الكامل','https://example.com/images/tv-buying-guide-2024.jpg','guides','TV, television, buying guide, OLED, QLED','تلفزيون, دليل شراء, أوليد, كيو ليد','CopRRA Team',NULL,1,0,0,8,'2025-08-10 09:56:23','دليل شراء التلفزيون 2024','TV Buying Guide 2024','دليل شامل لشراء أفضل تلفزيون يناسب احتياجاتك','Complete guide to buying the best TV for your needs','TV, television, buying guide, smart TV','تلفزيون, دليل شراء, تلفزيون ذكي','2025-08-10 09:56:23','2025-08-10 09:56:23');

-- إعدادات الموقع الأساسية
INSERT INTO `site_settings` VALUES
(1,'site_name','CopRRA','string','Site name','اسم الموقع',TRUE,'2025-08-10 10:00:00'),
(2,'site_description','Compare prices and find the best deals','string','Site description','وصف الموقع',TRUE,'2025-08-10 10:00:00'),
(3,'default_language','ar','string','Default language','اللغة الافتراضية',TRUE,'2025-08-10 10:00:00'),
(4,'default_currency','SAR','string','Default currency','العملة الافتراضية',TRUE,'2025-08-10 10:00:00'),
(5,'products_per_page','20','number','Products per page','عدد المنتجات في الصفحة',FALSE,'2025-08-10 10:00:00'),
(6,'enable_user_reviews','1','boolean','Enable user reviews','تفعيل مراجعات المستخدمين',FALSE,'2025-08-10 10:00:00'),
(7,'enable_price_alerts','1','boolean','Enable price alerts','تفعيل تنبيهات الأسعار',FALSE,'2025-08-10 10:00:00'),
(8,'maintenance_mode','0','boolean','Maintenance mode','وضع الصيانة',FALSE,'2025-08-10 10:00:00'),
(9,'contact_email','info@coprra.com','string','Contact email','بريد التواصل',TRUE,'2025-08-10 10:00:00'),
(10,'social_media','{"facebook":"","twitter":"","instagram":"","youtube":""}','json','Social media links','روابط وسائل التواصل',TRUE,'2025-08-10 10:00:00');

-- ===================================
-- الفهارس المحسنة للأداء
-- ===================================

-- فهارس إضافية للبحث والأداء
CREATE INDEX idx_products_search ON products(name_ar(50), name_en(50));
CREATE INDEX idx_products_price_range ON products(price, currency_code);
CREATE INDEX idx_products_category_brand ON products(category_id, brand_id);
CREATE INDEX idx_product_prices_cheapest ON product_prices(product_id, price);
CREATE INDEX idx_reviews_rating_approved ON user_reviews(product_id, rating, is_approved);
CREATE INDEX idx_price_history_trend ON price_history(product_id, recorded_at DESC);

-- فهارس للتجميع والإحصائيات
CREATE INDEX idx_audit_logs_action_date ON audit_logs(action, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_wishlists_user_created ON user_wishlists(user_id, created_at);

SET FOREIGN_KEY_CHECKS = 1;

-- New table: orders
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- New table: order_items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dummy data for testing verified purchase feature
INSERT INTO orders (user_id, order_date, status, total_amount) VALUES
(1, NOW() - INTERVAL 10 DAY, 'completed', 199.99),
(1, NOW() - INTERVAL 5 DAY, 'completed', 89.50),
(2, NOW() - INTERVAL 7 DAY, 'completed', 120.00);

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 199.99),
(2, 2, 2, 44.75),
(3, 3, 1, 120.00);