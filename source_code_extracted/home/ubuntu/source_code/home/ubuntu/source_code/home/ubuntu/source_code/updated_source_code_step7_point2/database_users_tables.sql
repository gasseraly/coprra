-- إنشاء جداول نظام المستخدمين لموقع CopRRA

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `role` enum('user', 'admin', 'moderator') DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(64) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `reset_token` varchar(64) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_verification_token` (`verification_token`),
  KEY `idx_reset_token` (`reset_token`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول جلسات المستخدمين
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(64) NOT NULL UNIQUE,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_token` (`session_token`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_is_active` (`is_active`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول قائمة المفضلة للمستخدمين
CREATE TABLE IF NOT EXISTS `user_wishlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`, `product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مراجعات المستخدمين
CREATE TABLE IF NOT EXISTS `user_reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `rating` tinyint(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `title` varchar(200) DEFAULT NULL,
  `review_text` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `helpful_votes` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_review` (`user_id`, `product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_is_approved` (`is_approved`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول أسئلة وأجوبة المنتجات
CREATE TABLE IF NOT EXISTS `product_qa` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text DEFAULT NULL,
  `answered_by` int(11) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `helpful_votes` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `answered_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_answered_by` (`answered_by`),
  KEY `idx_is_approved` (`is_approved`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`answered_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تفضيلات المستخدمين
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `preference_key` varchar(100) NOT NULL,
  `preference_value` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_preference` (`user_id`, `preference_key`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_preference_key` (`preference_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول إشعارات المستخدمين
CREATE TABLE IF NOT EXISTS `user_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('price_drop', 'product_available', 'review_reply', 'system', 'promotion') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول تتبع أسعار المنتجات للمستخدمين
CREATE TABLE IF NOT EXISTS `user_price_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `target_price` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_target_price` (`target_price`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجل أنشطة المستخدمين
CREATE TABLE IF NOT EXISTS `user_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `data` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إدراج بيانات تجريبية للمستخدمين
INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`, `role`, `email_verified`, `is_active`) VALUES
('admin@coprra.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWBSC8ahk1celaHGw3WvHzgm2', 'Admin', 'User', 'admin', 1, 1),
('user@coprra.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWBSC8ahk1celaHGw3WvHzgm2', 'Test', 'User', 'user', 1, 1),
('moderator@coprra.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxvWBSC8ahk1celaHGw3WvHzgm2', 'Moderator', 'User', 'moderator', 1, 1);

-- إدراج تفضيلات افتراضية للمستخدمين
INSERT INTO `user_preferences` (`user_id`, `preference_key`, `preference_value`) VALUES
(1, 'language', 'ar'),
(1, 'currency', 'USD'),
(1, 'theme', 'light'),
(1, 'notifications_email', 'true'),
(1, 'notifications_price_alerts', 'true'),
(2, 'language', 'en'),
(2, 'currency', 'USD'),
(2, 'theme', 'dark'),
(2, 'notifications_email', 'true'),
(2, 'notifications_price_alerts', 'true'),
(3, 'language', 'ar'),
(3, 'currency', 'SAR'),
(3, 'theme', 'light'),
(3, 'notifications_email', 'true'),
(3, 'notifications_price_alerts', 'false');

-- إدراج مراجعات تجريبية
INSERT INTO `user_reviews` (`user_id`, `product_id`, `rating`, `title`, `review_text`, `is_verified_purchase`, `is_approved`, `helpful_votes`) VALUES
(2, 1, 5, 'منتج ممتاز', 'هذا المنتج رائع جداً وأنصح به بشدة. الجودة عالية والسعر مناسب.', 1, 1, 15),
(2, 2, 4, 'جيد جداً', 'منتج جيد بشكل عام، لكن يمكن تحسين بعض الأشياء.', 1, 1, 8),
(3, 1, 5, 'الأفضل في فئته', 'استخدمت هذا المنتج لمدة شهر وهو الأفضل في فئته بلا منازع.', 1, 1, 22),
(3, 3, 3, 'متوسط', 'المنتج متوسط، ليس سيئاً لكن ليس الأفضل أيضاً.', 0, 1, 3);

-- إدراج أسئلة وأجوبة تجريبية
INSERT INTO `product_qa` (`product_id`, `user_id`, `question`, `answer`, `answered_by`, `is_approved`, `helpful_votes`, `answered_at`) VALUES
(1, 2, 'هل هذا المنتج متوافق مع الأجهزة الأخرى؟', 'نعم، هذا المنتج متوافق مع معظم الأجهزة الحديثة.', 1, 1, 12, NOW()),
(1, 3, 'ما هي مدة الضمان؟', 'مدة الضمان سنتان من تاريخ الشراء.', 1, 1, 8, NOW()),
(2, 2, 'هل يأتي مع ملحقات إضافية؟', 'نعم، يأتي مع جميع الملحقات الأساسية.', 1, 1, 5, NOW());

-- إدراج إشعارات تجريبية
INSERT INTO `user_notifications` (`user_id`, `type`, `title`, `message`, `is_read`) VALUES
(2, 'price_drop', 'انخفاض في السعر', 'انخفض سعر المنتج الذي تتابعه بنسبة 15%!', 0),
(2, 'system', 'مرحباً بك في CopRRA', 'مرحباً بك في موقع CopRRA لمقارنة الأسعار.', 1),
(3, 'product_available', 'المنتج متوفر الآن', 'المنتج الذي كنت تنتظره أصبح متوفراً الآن.', 0);

-- إدراج تنبيهات أسعار تجريبية
INSERT INTO `user_price_alerts` (`user_id`, `product_id`, `target_price`, `currency`, `is_active`) VALUES
(2, 1, 899.99, 'USD', 1),
(2, 2, 1299.99, 'USD', 1),
(3, 1, 3500.00, 'SAR', 1);

-- إنشاء فهارس إضافية لتحسين الأداء
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_user_sessions_user_expires ON user_sessions(user_id, expires_at);
CREATE INDEX idx_user_reviews_product_rating ON user_reviews(product_id, rating);
CREATE INDEX idx_user_reviews_approved_created ON user_reviews(is_approved, created_at);
CREATE INDEX idx_product_qa_product_approved ON product_qa(product_id, is_approved);
CREATE INDEX idx_user_notifications_user_read ON user_notifications(user_id, is_read);
CREATE INDEX idx_user_price_alerts_active_price ON user_price_alerts(is_active, target_price);

-- إنشاء views مفيدة
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.created_at,
    u.last_login,
    COUNT(DISTINCT ur.id) as total_reviews,
    COUNT(DISTINCT uw.id) as wishlist_items,
    COUNT(DISTINCT upa.id) as price_alerts,
    AVG(ur.rating) as avg_rating_given
FROM users u
LEFT JOIN user_reviews ur ON u.id = ur.user_id
LEFT JOIN user_wishlist uw ON u.id = uw.user_id
LEFT JOIN user_price_alerts upa ON u.id = upa.user_id AND upa.is_active = 1
GROUP BY u.id;

CREATE VIEW product_review_stats AS
SELECT 
    p.id as product_id,
    p.name_en,
    p.name_ar,
    COUNT(ur.id) as total_reviews,
    AVG(ur.rating) as avg_rating,
    COUNT(CASE WHEN ur.rating = 5 THEN 1 END) as five_star_reviews,
    COUNT(CASE WHEN ur.rating = 4 THEN 1 END) as four_star_reviews,
    COUNT(CASE WHEN ur.rating = 3 THEN 1 END) as three_star_reviews,
    COUNT(CASE WHEN ur.rating = 2 THEN 1 END) as two_star_reviews,
    COUNT(CASE WHEN ur.rating = 1 THEN 1 END) as one_star_reviews
FROM products p
LEFT JOIN user_reviews ur ON p.id = ur.product_id AND ur.is_approved = 1
GROUP BY p.id;

