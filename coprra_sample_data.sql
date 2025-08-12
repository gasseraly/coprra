-- ===================================
-- بيانات تجريبية أساسية لقاعدة بيانات CopRRA
-- يجب تشغيل هذا الملف بعد إنشاء الجداول
-- ===================================

USE `coprra_db`;

-- ===================================
-- 1. بيانات اللغات الأساسية (أكبر 15 لغة عالمية)
-- ===================================

INSERT INTO `languages` (`code`, `name`, `native_name`, `flag`, `is_rtl`, `is_active`, `sort_order`) VALUES
('en', 'English', 'English', '🇺🇸', FALSE, TRUE, 1),
('ar', 'Arabic', 'العربية', '🇸🇦', TRUE, TRUE, 2),
('zh', 'Chinese', '中文', '🇨🇳', FALSE, TRUE, 3),
('hi', 'Hindi', 'हिन्दी', '🇮🇳', FALSE, TRUE, 4),
('es', 'Spanish', 'Español', '🇪🇸', FALSE, TRUE, 5),
('fr', 'French', 'Français', '🇫🇷', FALSE, TRUE, 6),
('bn', 'Bengali', 'বাংলা', '🇧🇩', FALSE, TRUE, 7),
('pt', 'Portuguese', 'Português', '🇧🇷', FALSE, TRUE, 8),
('ru', 'Russian', 'Русский', '🇷🇺', FALSE, TRUE, 9),
('ja', 'Japanese', '日本語', '🇯🇵', FALSE, TRUE, 10),
('de', 'German', 'Deutsch', '🇩🇪', FALSE, TRUE, 11),
('ko', 'Korean', '한국어', '🇰🇷', FALSE, TRUE, 12),
('tr', 'Turkish', 'Türkçe', '🇹🇷', FALSE, TRUE, 13),
('it', 'Italian', 'Italiano', '🇮🇹', FALSE, TRUE, 14),
('vi', 'Vietnamese', 'Tiếng Việt', '🇻🇳', FALSE, TRUE, 15);

-- ===================================
-- 2. بيانات العملات الأساسية
-- ===================================

INSERT INTO `currencies` (`code`, `name`, `symbol`, `flag`, `country`, `exchange_rate`, `is_active`) VALUES
('USD', 'US Dollar', '$', '🇺🇸', 'United States', 1.0000, TRUE),
('EUR', 'Euro', '€', '🇪🇺', 'European Union', 0.8500, TRUE),
('SAR', 'Saudi Riyal', 'ر.س', '🇸🇦', 'Saudi Arabia', 3.7500, TRUE),
('AED', 'UAE Dirham', 'د.إ', '🇦🇪', 'United Arab Emirates', 3.6700, TRUE),
('EGP', 'Egyptian Pound', 'ج.م', '🇪🇬', 'Egypt', 30.9000, TRUE),
('GBP', 'British Pound', '£', '🇬🇧', 'United Kingdom', 0.7800, TRUE),
('JPY', 'Japanese Yen', '¥', '🇯🇵', 'Japan', 150.0000, TRUE),
('CNY', 'Chinese Yuan', '¥', '🇨🇳', 'China', 7.2000, TRUE),
('INR', 'Indian Rupee', '₹', '🇮🇳', 'India', 83.0000, TRUE),
('CAD', 'Canadian Dollar', 'C$', '🇨🇦', 'Canada', 1.3500, TRUE),
('AUD', 'Australian Dollar', 'A$', '🇦🇺', 'Australia', 1.5000, TRUE),
('BRL', 'Brazilian Real', 'R$', '🇧🇷', 'Brazil', 5.2000, TRUE),
('RUB', 'Russian Ruble', '₽', '🇷🇺', 'Russia', 75.0000, TRUE),
('KRW', 'South Korean Won', '₩', '🇰🇷', 'South Korea', 1300.0000, TRUE),
('TRY', 'Turkish Lira', '₺', '🇹🇷', 'Turkey', 28.0000, TRUE);

-- ===================================
-- 3. بيانات المناطق الجغرافية
-- ===================================

INSERT INTO `regions` (`name`, `code`, `currency_id`, `language_id`, `timezone`, `is_active`) VALUES
('North America', 'NA', 1, 1, 'America/New_York', TRUE),
('Europe', 'EU', 2, 6, 'Europe/London', TRUE),
('Middle East', 'ME', 3, 2, 'Asia/Riyadh', TRUE),
('Asia Pacific', 'AP', 8, 3, 'Asia/Shanghai', TRUE),
('South America', 'SA', 12, 8, 'America/Sao_Paulo', TRUE),
('Africa', 'AF', 5, 2, 'Africa/Cairo', TRUE);

-- ===================================
-- 4. بيانات الفئات الرئيسية
-- ===================================

INSERT INTO `categories` (`name_en`, `name_ar`, `slug`, `description_en`, `description_ar`, `icon`, `is_featured`, `is_active`, `sort_order`) VALUES
('Electronics', 'الإلكترونيات', 'electronics', 'All electronic devices and gadgets', 'جميع الأجهزة الإلكترونية والأدوات', '📱', TRUE, TRUE, 1),
('Smartphones', 'الهواتف الذكية', 'smartphones', 'Mobile phones and accessories', 'الهواتف المحمولة والإكسسوارات', '📱', TRUE, TRUE, 2),
('Laptops', 'أجهزة الكمبيوتر المحمولة', 'laptops', 'Portable computers and notebooks', 'أجهزة الكمبيوتر المحمولة والدفاتر', '💻', TRUE, TRUE, 3),
('Tablets', 'الأجهزة اللوحية', 'tablets', 'Tablet computers and e-readers', 'أجهزة الكمبيوتر اللوحية وقارئات الكتب الإلكترونية', '📱', TRUE, TRUE, 4),
('TVs', 'أجهزة التلفزيون', 'tvs', 'Television sets and displays', 'أجهزة التلفزيون والشاشات', '📺', TRUE, TRUE, 5),
('Home Appliances', 'الأجهزة المنزلية', 'home-appliances', 'Household electrical appliances', 'الأجهزة الكهربائية المنزلية', '🏠', TRUE, TRUE, 6),
('Audio', 'الصوتيات', 'audio', 'Speakers, headphones, and audio equipment', 'السماعات وسماعات الرأس ومعدات الصوت', '🎧', TRUE, TRUE, 7),
('Gaming', 'الألعاب', 'gaming', 'Gaming consoles and accessories', 'أجهزة الألعاب والإكسسوارات', '🎮', TRUE, TRUE, 8),
('Cameras', 'الكاميرات', 'cameras', 'Digital cameras and photography equipment', 'الكاميرات الرقمية ومعدات التصوير', '📷', TRUE, TRUE, 9),
('Wearables', 'الأجهزة القابلة للارتداء', 'wearables', 'Smartwatches and fitness trackers', 'الساعات الذكية وأجهزة تتبع اللياقة', '⌚', TRUE, TRUE, 10);

-- ===================================
-- 5. بيانات العلامات التجارية
-- ===================================

INSERT INTO `brands` (`name`, `slug`, `description_en`, `description_ar`, `logo_url`, `website_url`, `country_origin`, `founded_year`, `is_featured`, `is_active`, `popularity_score`) VALUES
('Apple', 'apple', 'Premium consumer electronics', 'الإلكترونيات الاستهلاكية المميزة', '/images/brands/apple.png', 'https://apple.com', 'United States', 1976, TRUE, TRUE, 100),
('Samsung', 'samsung', 'South Korean multinational electronics', 'شركة إلكترونيات متعددة الجنسيات كورية جنوبية', '/images/brands/samsung.png', 'https://samsung.com', 'South Korea', 1938, TRUE, TRUE, 95),
('Google', 'google', 'Technology and internet services', 'خدمات التكنولوجيا والإنترنت', '/images/brands/google.png', 'https://google.com', 'United States', 1998, TRUE, TRUE, 90),
('Microsoft', 'microsoft', 'Software and technology solutions', 'حلول البرمجيات والتكنولوجيا', '/images/brands/microsoft.png', 'https://microsoft.com', 'United States', 1975, TRUE, TRUE, 85),
('Sony', 'sony', 'Entertainment and electronics', 'الترفيه والإلكترونيات', '/images/brands/sony.png', 'https://sony.com', 'Japan', 1946, TRUE, TRUE, 80),
('LG', 'lg', 'Home appliances and electronics', 'الأجهزة المنزلية والإلكترونيات', '/images/brands/lg.png', 'https://lg.com', 'South Korea', 1947, TRUE, TRUE, 75),
('Huawei', 'huawei', 'Telecommunications and consumer electronics', 'الاتصالات والإلكترونيات الاستهلاكية', '/images/brands/huawei.png', 'https://huawei.com', 'China', 1987, TRUE, TRUE, 70),
('Dell', 'dell', 'Computer technology solutions', 'حلول تكنولوجيا الكمبيوتر', '/images/brands/dell.png', 'https://dell.com', 'United States', 1984, TRUE, TRUE, 65),
('HP', 'hp', 'Personal computers and printers', 'أجهزة الكمبيوتر الشخصية والطابعات', '/images/brands/hp.png', 'https://hp.com', 'United States', 1939, TRUE, TRUE, 60),
('Xiaomi', 'xiaomi', 'Consumer electronics and smartphones', 'الإلكترونيات الاستهلاكية والهواتف الذكية', '/images/brands/xiaomi.png', 'https://mi.com', 'China', 2010, TRUE, TRUE, 55);

-- ===================================
-- 6. بيانات المتاجر
-- ===================================

INSERT INTO `stores` (`name`, `slug`, `website_url`, `logo_url`, `country`, `currency_id`, `language_id`, `commission_rate`, `is_partner`, `is_active`) VALUES
('Amazon', 'amazon', 'https://amazon.com', '/images/stores/amazon.png', 'United States', 1, 1, 5.00, TRUE, TRUE),
('Best Buy', 'best-buy', 'https://bestbuy.com', '/images/stores/bestbuy.png', 'United States', 1, 1, 4.00, TRUE, TRUE),
('Newegg', 'newegg', 'https://newegg.com', '/images/stores/newegg.png', 'United States', 1, 1, 3.50, TRUE, TRUE),
('B&H Photo', 'bh-photo', 'https://bhphotovideo.com', '/images/stores/bh.png', 'United States', 1, 1, 4.50, TRUE, TRUE),
('Jarir Bookstore', 'jarir', 'https://jarir.com', '/images/stores/jarir.png', 'Saudi Arabia', 3, 2, 3.00, TRUE, TRUE),
('Extra', 'extra', 'https://extra.com', '/images/stores/extra.png', 'Saudi Arabia', 3, 2, 3.50, TRUE, TRUE),
('Noon', 'noon', 'https://noon.com', '/images/stores/noon.png', 'UAE', 4, 2, 4.00, TRUE, TRUE),
('Carrefour', 'carrefour', 'https://carrefour.com', '/images/stores/carrefour.png', 'France', 2, 6, 3.00, TRUE, TRUE);

-- ===================================
-- 7. بيانات المنتجات التجريبية
-- ===================================

INSERT INTO `products` (`name_en`, `name_ar`, `slug`, `model_number`, `brand_id`, `category_id`, `description_en`, `description_ar`, `specifications`, `main_image`, `min_price`, `max_price`, `avg_price`, `rating`, `is_featured`, `is_trending`, `is_active`) VALUES
('iPhone 15 Pro Max', 'آيفون 15 برو ماكس', 'iphone-15-pro-max', 'A3108', 1, 2, 'Latest flagship iPhone with A17 Pro chip', 'أحدث هاتف آيفون رائد مع معالج A17 Pro', '{"display": "6.7-inch Super Retina XDR", "storage": ["128GB", "256GB", "512GB", "1TB"], "camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto", "battery": "Up to 29 hours video playback"}', '/images/products/iphone-15-pro-max.jpg', 1199.00, 1599.00, 1399.00, 4.8, TRUE, TRUE, TRUE),

('Samsung Galaxy S24 Ultra', 'سامسونج جالاكسي S24 الترا', 'samsung-galaxy-s24-ultra', 'SM-S928', 2, 2, 'Premium Android smartphone with S Pen', 'هاتف أندرويد مميز مع قلم S Pen', '{"display": "6.8-inch Dynamic AMOLED 2X", "storage": ["256GB", "512GB", "1TB"], "camera": "200MP Main + 12MP Ultra Wide + 10MP Telephoto", "battery": "5000mAh"}', '/images/products/galaxy-s24-ultra.jpg', 1199.99, 1419.99, 1299.99, 4.7, TRUE, TRUE, TRUE),

('MacBook Pro 16-inch', 'ماك بوك برو 16 بوصة', 'macbook-pro-16', 'MK1E3', 1, 3, 'Professional laptop with M3 Pro chip', 'كمبيوتر محمول احترافي مع معالج M3 Pro', '{"display": "16.2-inch Liquid Retina XDR", "processor": "Apple M3 Pro", "memory": ["18GB", "36GB"], "storage": ["512GB", "1TB", "2TB", "4TB"]}', '/images/products/macbook-pro-16.jpg', 2499.00, 3999.00, 2999.00, 4.6, TRUE, FALSE, TRUE),

('Dell XPS 13', 'ديل XPS 13', 'dell-xps-13', 'XPS13-9310', 8, 3, 'Ultra-portable laptop with Intel Core i7', 'كمبيوتر محمول فائق المحمولية مع معالج Intel Core i7', '{"display": "13.4-inch FHD+", "processor": "Intel Core i7-1185G7", "memory": ["16GB", "32GB"], "storage": ["512GB", "1TB"]}', '/images/products/dell-xps-13.jpg', 999.99, 1699.99, 1299.99, 4.4, TRUE, FALSE, TRUE),

('iPad Pro 12.9', 'آيباد برو 12.9', 'ipad-pro-12-9', 'MHNL3', 1, 4, 'Professional tablet with M2 chip', 'جهاز لوحي احترافي مع معالج M2', '{"display": "12.9-inch Liquid Retina XDR", "processor": "Apple M2", "storage": ["128GB", "256GB", "512GB", "1TB", "2TB"], "connectivity": ["Wi-Fi", "Wi-Fi + Cellular"]}', '/images/products/ipad-pro-12-9.jpg', 1099.00, 2199.00, 1399.00, 4.7, TRUE, TRUE, TRUE),

('Samsung 85" Neo QLED 8K', 'سامسونج 85 بوصة نيو QLED 8K', 'samsung-85-neo-qled-8k', 'QN85QN900C', 2, 5, '85-inch 8K Smart TV with Neo Quantum Processor', 'تلفزيون ذكي 85 بوصة 8K مع معالج نيو كوانتوم', '{"display": "85-inch Neo QLED 8K", "resolution": "7680x4320", "smart_tv": "Tizen OS", "hdr": "HDR10+"}', '/images/products/samsung-85-neo-qled.jpg', 3499.99, 4999.99, 3999.99, 4.5, TRUE, FALSE, TRUE),

('Sony PlayStation 5', 'سوني بلايستيشن 5', 'sony-playstation-5', 'CFI-1200', 5, 8, 'Next-gen gaming console', 'جهاز ألعاب الجيل القادم', '{"processor": "AMD Zen 2", "graphics": "AMD RDNA 2", "storage": "825GB SSD", "games": "Backward compatible with PS4"}', '/images/products/ps5.jpg', 499.99, 599.99, 549.99, 4.8, TRUE, TRUE, TRUE),

('AirPods Pro (2nd generation)', 'إيربودز برو (الجيل الثاني)', 'airpods-pro-2nd-gen', 'MTJV3', 1, 7, 'Premium wireless earbuds with ANC', 'سماعات أذن لاسلكية مميزة مع إلغاء الضوضاء النشط', '{"noise_cancellation": "Active Noise Cancellation", "battery": "Up to 6 hours listening", "case": "MagSafe Charging Case", "water_resistance": "IPX4"}', '/images/products/airpods-pro-2.jpg', 249.00, 279.00, 259.00, 4.6, TRUE, TRUE, TRUE);

-- ===================================
-- 8. بيانات أسعار المنتجات
-- ===================================

INSERT INTO `product_prices` (`product_id`, `store_id`, `price`, `currency_id`, `stock_status`, `product_url`, `is_affiliate_link`) VALUES
-- iPhone 15 Pro Max prices
(1, 1, 1199.00, 1, 'in_stock', 'https://amazon.com/iphone-15-pro-max', TRUE),
(1, 2, 1199.99, 1, 'in_stock', 'https://bestbuy.com/iphone-15-pro-max', TRUE),
(1, 5, 4499.00, 3, 'in_stock', 'https://jarir.com/iphone-15-pro-max', TRUE),

-- Samsung Galaxy S24 Ultra prices  
(2, 1, 1199.99, 1, 'in_stock', 'https://amazon.com/galaxy-s24-ultra', TRUE),
(2, 2, 1299.99, 1, 'in_stock', 'https://bestbuy.com/galaxy-s24-ultra', TRUE),
(2, 6, 4899.00, 3, 'limited', 'https://extra.com/galaxy-s24-ultra', TRUE),

-- MacBook Pro 16-inch prices
(3, 1, 2499.00, 1, 'in_stock', 'https://amazon.com/macbook-pro-16', TRUE),
(3, 2, 2499.99, 1, 'in_stock', 'https://bestbuy.com/macbook-pro-16', TRUE),
(3, 4, 2449.00, 1, 'in_stock', 'https://bhphotovideo.com/macbook-pro-16', TRUE),

-- Dell XPS 13 prices
(4, 1, 999.99, 1, 'in_stock', 'https://amazon.com/dell-xps-13', TRUE),
(4, 3, 1049.99, 1, 'in_stock', 'https://newegg.com/dell-xps-13', TRUE),

-- iPad Pro 12.9 prices
(5, 1, 1099.00, 1, 'in_stock', 'https://amazon.com/ipad-pro-12-9', TRUE),
(5, 2, 1099.99, 1, 'in_stock', 'https://bestbuy.com/ipad-pro-12-9', TRUE),

-- Samsung TV prices
(6, 1, 3499.99, 1, 'in_stock', 'https://amazon.com/samsung-85-neo-qled', TRUE),
(6, 2, 3699.99, 1, 'limited', 'https://bestbuy.com/samsung-85-neo-qled', TRUE),

-- PlayStation 5 prices
(7, 1, 499.99, 1, 'limited', 'https://amazon.com/playstation-5', TRUE),
(7, 2, 499.99, 1, 'out_of_stock', 'https://bestbuy.com/playstation-5', TRUE),

-- AirPods Pro prices
(8, 1, 249.00, 1, 'in_stock', 'https://amazon.com/airpods-pro-2', TRUE),
(8, 2, 249.99, 1, 'in_stock', 'https://bestbuy.com/airpods-pro-2', TRUE);

-- ===================================
-- 9. مستخدم إداري افتراضي
-- ===================================

INSERT INTO `users` (`email`, `password`, `first_name`, `last_name`, `username`, `role`, `preferred_language_id`, `preferred_currency_id`, `email_verified`, `is_active`) VALUES
('admin@coprra.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', 'admin', 1, 1, TRUE, TRUE),
('demo@coprra.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo', 'User', 'demo', 'user', 1, 1, TRUE, TRUE);

-- ===================================
-- 10. إعدادات النظام الأساسية
-- ===================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description_en`, `description_ar`, `is_public`) VALUES
('site_name', 'CopRRA', 'string', 'general', 'Website name', 'اسم الموقع', TRUE),
('site_description_en', 'Compare prices and find the best deals on electronics', 'text', 'general', 'Site description in English', 'وصف الموقع بالإنجليزية', TRUE),
('site_description_ar', 'قارن الأسعار واعثر على أفضل العروض للإلكترونيات', 'text', 'general', 'Site description in Arabic', 'وصف الموقع بالعربية', TRUE),
('default_language', 'en', 'string', 'localization', 'Default site language', 'اللغة الافتراضية للموقع', TRUE),
('default_currency', 'USD', 'string', 'localization', 'Default site currency', 'العملة الافتراضية للموقع', TRUE),
('products_per_page', '20', 'number', 'display', 'Number of products per page', 'عدد المنتجات في الصفحة', TRUE),
('enable_user_reviews', 'true', 'boolean', 'features', 'Enable user reviews', 'تفعيل مراجعات المستخدمين', TRUE),
('enable_price_alerts', 'true', 'boolean', 'features', 'Enable price alerts', 'تفعيل تنبيهات الأسعار', TRUE),
('enable_comparison', 'true', 'boolean', 'features', 'Enable product comparison', 'تفعيل مقارنة المنتجات', TRUE),
('max_comparison_products', '4', 'number', 'features', 'Maximum products in comparison', 'الحد الأقصى للمنتجات في المقارنة', TRUE),
('enable_dark_mode', 'true', 'boolean', 'ui', 'Enable dark mode toggle', 'تفعيل تبديل الوضع المظلم', TRUE),
('enable_voice_search', 'false', 'boolean', 'features', 'Enable voice search', 'تفعيل البحث الصوتي', TRUE),
('contact_email', 'info@coprra.com', 'string', 'contact', 'Contact email address', 'عنوان البريد الإلكتروني للتواصل', TRUE),
('support_phone', '+1-800-COPRRA', 'string', 'contact', 'Support phone number', 'رقم الهاتف للدعم', TRUE),
('social_facebook', 'https://facebook.com/coprra', 'string', 'social', 'Facebook page URL', 'رابط صفحة فيسبوك', TRUE),
('social_twitter', 'https://twitter.com/coprra', 'string', 'social', 'Twitter profile URL', 'رابط ملف تويتر', TRUE),
('social_instagram', 'https://instagram.com/coprra', 'string', 'social', 'Instagram profile URL', 'رابط ملف إنستغرام', TRUE),
('google_analytics_id', '', 'string', 'tracking', 'Google Analytics tracking ID', 'معرف تتبع Google Analytics', FALSE),
('facebook_pixel_id', '', 'string', 'tracking', 'Facebook Pixel ID', 'معرف Facebook Pixel', FALSE);

-- ===================================
-- 11. صفحات ثابتة أساسية
-- ===================================

INSERT INTO `static_pages` (`slug`, `title_en`, `title_ar`, `content_en`, `content_ar`, `is_active`) VALUES
('about-us', 'About Us', 'من نحن', '<h1>About CopRRA</h1><p>CopRRA is your trusted companion for comparing prices and finding the best deals on electronics and technology products.</p>', '<h1>حول كوبرا</h1><p>كوبرا هو رفيقك الموثوق لمقارنة الأسعار والعثور على أفضل العروض للإلكترونيات ومنتجات التكنولوجيا.</p>', TRUE),

('privacy-policy', 'Privacy Policy', 'سياسة الخصوصية', '<h1>Privacy Policy</h1><p>We value your privacy and are committed to protecting your personal information.</p>', '<h1>سياسة الخصوصية</h1><p>نحن نقدر خصوصيتك وملتزمون بحماية معلوماتك الشخصية.</p>', TRUE),

('terms-of-service', 'Terms of Service', 'شروط الخدمة', '<h1>Terms of Service</h1><p>By using our website, you agree to these terms and conditions.</p>', '<h1>شروط الخدمة</h1><p>باستخدام موقعنا الإلكتروني، فإنك توافق على هذه الشروط والأحكام.</p>', TRUE),

('contact-us', 'Contact Us', 'اتصل بنا', '<h1>Contact Us</h1><p>Get in touch with our team for any questions or support.</p>', '<h1>اتصل بنا</h1><p>تواصل مع فريقنا لأي أسئلة أو دعم.</p>', TRUE),

('faq', 'Frequently Asked Questions', 'الأسئلة الشائعة', '<h1>FAQ</h1><p>Find answers to common questions about our service.</p>', '<h1>الأسئلة الشائعة</h1><p>اعثر على إجابات للأسئلة الشائعة حول خدمتنا.</p>', TRUE);

-- ===================================
-- 12. مقالات تجريبية للمدونة
-- ===================================

INSERT INTO `articles` (`title_en`, `title_ar`, `slug`, `excerpt_en`, `excerpt_ar`, `content_en`, `content_ar`, `author_id`, `category`, `is_featured`, `is_published`, `published_at`) VALUES
('Best Smartphones of 2024', 'أفضل الهواتف الذكية لعام 2024', 'best-smartphones-2024', 'Discover the top smartphone picks for this year', 'اكتشف أفضل اختيارات الهواتف الذكية لهذا العام', '<h1>Best Smartphones of 2024</h1><p>As technology continues to evolve, 2024 brings us some incredible smartphone innovations...</p>', '<h1>أفضل الهواتف الذكية لعام 2024</h1><p>مع استمرار تطور التكنولوجيا، يقدم لنا عام 2024 بعض الابتكارات المذهلة في الهواتف الذكية...</p>', 1, 'review', TRUE, TRUE, NOW()),

('How to Choose the Right Laptop', 'كيفية اختيار الكمبيوتر المحمول المناسب', 'how-to-choose-laptop', 'A comprehensive guide to finding your perfect laptop', 'دليل شامل للعثور على الكمبيوتر المحمول المثالي', '<h1>Laptop Buying Guide</h1><p>Choosing the right laptop can be overwhelming with so many options available...</p>', '<h1>دليل شراء الكمبيوتر المحمول</h1><p>قد يكون اختيار الكمبيوتر المحمول المناسب أمراً صعباً مع وجود العديد من الخيارات المتاحة...</p>', 1, 'buying_guide', TRUE, TRUE, NOW());

-- ===================================
-- 13. إشعارات ترحيبية للمستخدمين الجدد
-- ===================================

INSERT INTO `notifications` (`user_id`, `type`, `title`, `message`, `is_read`, `is_sent`) VALUES
(2, 'system', 'Welcome to CopRRA!', 'Thank you for joining CopRRA. Start comparing prices and finding the best deals now!', FALSE, TRUE);

-- ===================================
-- 14. نقاط ولاء للمستخدم التجريبي
-- ===================================

INSERT INTO `loyalty_points_history` (`user_id`, `points`, `transaction_type`, `reason`) VALUES
(2, 100, 'earned', 'Welcome bonus for new user registration');

-- تحديث نقاط المستخدم
UPDATE `users` SET `loyalty_points` = 100 WHERE `id` = 2;