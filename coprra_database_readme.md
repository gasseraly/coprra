# CopRRA Database Installation Guide

## 🗄️ قاعدة بيانات CopRRA المحسنة

### 📋 نظرة عامة
هذا الملف يحتوي على قاعدة البيانات المحسنة لموقع CopRRA مع دعم كامل لميزات الذكاء الاصطناعي.

### 📦 الملفات المرفقة
1. **`coprra_ai_enhanced_database.sql`** - قاعدة البيانات الرئيسية المحسنة
2. **`database_users_tables.sql`** - جداول المستخدمين الأساسية

### 🚀 التثبيت

#### الخطوة 1: إنشاء قاعدة البيانات
```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE `coprra_ai` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- استخدام قاعدة البيانات
USE `coprra_ai`;
```

#### الخطوة 2: استيراد قاعدة البيانات الأساسية
```bash
# استيراد جداول المستخدمين الأساسية
mysql -u root -p coprra_ai < database_users_tables.sql
```

#### الخطوة 3: استيراد قاعدة البيانات المحسنة
```bash
# استيراد قاعدة البيانات الكاملة
mysql -u root -p coprra_ai < coprra_ai_enhanced_database.sql
```

### 🗂️ الجداول الجديدة

#### جداول الذكاء الاصطناعي
- **`ai_conversations`** - محادثات الذكاء الاصطناعي
- **`ai_responses`** - ردود الذكاء الاصطناعي
- **`ai_feedback`** - تقييمات المستخدمين
- **`search_queries`** - استعلامات البحث
- **`user_preferences`** - تفضيلات المستخدمين
- **`ai_recommendations`** - التوصيات الذكية
- **`ai_content_generation`** - المحتوى المُولد تلقائياً
- **`ai_image_generation`** - الصور المُولدة تلقائياً
- **`ai_shopping_assistant`** - مساعد التسوق الذكي
- **`ai_seo_optimization`** - تحسين محركات البحث
- **`ai_affiliate_integration`** - تكامل الأفلييت
- **`ai_analytics`** - التحليلات الذكية

### 🔧 الإعدادات المطلوبة

#### إعدادات MySQL
```sql
-- التأكد من دعم UTF8MB4
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';

-- تعيين الترميز الافتراضي
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';
```

#### صلاحيات المستخدم
```sql
-- إنشاء مستخدم جديد
CREATE USER 'coprra_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON coprra_ai.* TO 'coprra_user'@'localhost';
FLUSH PRIVILEGES;
```

### 📊 المشاهد (Views)

#### مشاهد التحليلات
- **`v_ai_conversation_analytics`** - تحليلات المحادثات
- **`v_search_query_analytics`** - تحليلات البحث
- **`v_user_preference_insights`** - رؤى تفضيلات المستخدمين
- **`v_ai_recommendation_performance`** - أداء التوصيات
- **`v_ai_content_generation_quality`** - جودة المحتوى المُولد

### 🗃️ الإجراءات المخزنة (Stored Procedures)

#### الإجراءات الرئيسية
- **`GetConversationContext`** - الحصول على سياق المحادثة
- **`UpdateUserPreferences`** - تحديث تفضيلات المستخدم
- **`GenerateAIRecommendations`** - توليد التوصيات الذكية
- **`LogAIIteraction`** - تسجيل تفاعل الذكاء الاصطناعي

### 🔄 المحفزات (Triggers)

#### المحفزات التلقائية
- **`tr_ai_conversation_preferences`** - تحديث التفضيلات عند المحادثة
- **`tr_search_query_analytics`** - تحديث إحصائيات البحث

### 📈 الفهارس (Indexes)

#### فهارس الأداء
- فهارس مركبة للمحادثات والبحث
- فهارس للتصنيفات والعلامات التجارية
- فهارس للتواريخ والوقت
- فهارس للجودة والثقة

### 🧪 اختبار قاعدة البيانات

#### اختبار الاتصال
```bash
mysql -u coprra_user -p coprra_ai -e "SELECT 'Database connection successful!' as status;"
```

#### اختبار الجداول
```sql
-- عرض جميع الجداول
SHOW TABLES;

-- عرض هيكل جدول المحادثات
DESCRIBE ai_conversations;

-- اختبار إدراج بيانات
INSERT INTO ai_conversations (session_id, message, language, mode) 
VALUES ('test_session', 'رسالة اختبار', 'ar', 'general');

-- التحقق من الإدراج
SELECT * FROM ai_conversations WHERE session_id = 'test_session';
```

### 🔒 الأمان

#### إعدادات الأمان
- تشفير كلمات المرور
- صلاحيات محدودة للمستخدمين
- استعلامات مُعدة مسبقاً
- حماية من SQL Injection

#### النسخ الاحتياطي
```bash
# نسخ احتياطي يومي
mysqldump -u root -p coprra_ai > backup_$(date +%Y%m%d).sql

# نسخ احتياطي مع الضغط
mysqldump -u root -p coprra_ai | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 📊 المراقبة

#### مراقبة الأداء
```sql
-- مراقبة حجم قاعدة البيانات
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'coprra_ai'
GROUP BY table_schema;

-- مراقبة الجداول الكبيرة
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'coprra_ai'
ORDER BY (data_length + index_length) DESC;
```

### 🚨 استكشاف الأخطاء

#### مشاكل شائعة
1. **خطأ في الترميز**: تأكد من استخدام UTF8MB4
2. **خطأ في الصلاحيات**: تأكد من صلاحيات المستخدم
3. **خطأ في الإجراءات المخزنة**: تأكد من دعم MySQL 8.0+

#### حلول سريعة
```sql
-- إعادة تعيين الترميز
ALTER DATABASE coprra_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- إعادة إنشاء الإجراءات المخزنة
SOURCE coprra_ai_enhanced_database.sql;
```

### 📞 الدعم

للمساعدة في إعداد قاعدة البيانات:
- **البريد الإلكتروني**: contact@coprra.com
- **التوثيق**: [رابط التوثيق]
- **GitHub Issues**: [رابط المستودع]

---

**تم التطوير بواسطة فريق CopRRA** 🚀

*آخر تحديث: ديسمبر 2024*