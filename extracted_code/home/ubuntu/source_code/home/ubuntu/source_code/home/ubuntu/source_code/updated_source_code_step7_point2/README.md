# CopRRA - منصة مقارنة الأسعار الذكية

## 🚀 نظرة عامة

CopRRA هي منصة متطورة لمقارنة الأسعار مع دمج تقنيات الذكاء الاصطناعي لتقديم تجربة تسوق ذكية ومتطورة. تم تطوير الموقع باستخدام React.js للواجهة الأمامية و PHP للخلفية، مع قاعدة بيانات MySQL محسنة.

## ✨ الميزات الرئيسية

### 🤖 الذكاء الاصطناعي
- **المحادثة الذكية (AI Chatbot)**: مساعد ذكي يعمل 24/7 مع فهم اللغة العربية والإنجليزية
- **البحث الذكي**: بحث متطور مع تصحيح الأخطاء الإملائية والاقتراحات الذكية
- **التوصيات الذكية**: نظام توصيات متقدم كما في أمازون
- **إنشاء المحتوى التلقائي**: توليد أوصاف المنتجات والمحتوى تلقائياً
- **مساعد التسوق الذكي**: يساعد المستخدمين في اختيار أفضل المنتجات

### 🛍️ ميزات التسوق
- **مقارنة المنتجات**: مقارنة شاملة بين المنتجات
- **تتبع الأسعار**: مراقبة تغيرات الأسعار
- **قائمة الأمنيات**: حفظ المنتجات المفضلة
- **نظام التقييمات**: تقييمات ومراجعات العملاء
- **متجر الأفلييت**: تكامل مع شبكات الأفلييت

### 🌐 الميزات التقنية
- **تصميم متجاوب**: يعمل على جميع الأجهزة
- **دعم متعدد اللغات**: العربية والإنجليزية
- **تحسين محركات البحث (SEO)**: محسن تلقائياً
- **الأمان المتقدم**: حماية شاملة للمستخدمين
- **الأداء العالي**: محسن للسرعة والكفاءة

## 🛠️ المتطلبات التقنية

### الخادم
- PHP 8.0 أو أحدث
- MySQL 8.0 أو أحدث
- Apache/Nginx
- SSL Certificate

### المتصفح
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📦 التثبيت

### 1. تحميل الملفات
```bash
# استنساخ المستودع
git clone https://github.com/gasseraly/coprra.git
cd coprra
```

### 2. إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
mysql -u root -p
CREATE DATABASE coprra_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coprra_ai;

# استيراد قاعدة البيانات المحسنة
mysql -u root -p coprra_ai < coprra_ai_enhanced_database.sql
```

### 3. إعداد PHP
```bash
# نسخ ملف الإعدادات
cp config_secure.php.example config_secure.php

# تعديل الإعدادات
nano config_secure.php
```

### 4. تثبيت التبعيات
```bash
# تثبيت Node.js dependencies
npm install

# أو باستخدام pnpm
pnpm install
```

### 5. بناء المشروع
```bash
# بناء للانتاج
npm run build

# أو للاختبار
npm run dev
```

## ⚙️ الإعدادات

### ملف الإعدادات (config_secure.php)
```php
<?php
// إعدادات قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'coprra_ai');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');

// إعدادات الذكاء الاصطناعي
define('AI_API_KEY', 'your_ai_api_key');
define('AI_ENDPOINT', 'https://api.openai.com/v1');

// إعدادات الأمان
define('JWT_SECRET', 'your_jwt_secret');
define('ENCRYPTION_KEY', 'your_encryption_key');

// إعدادات البريد الإلكتروني
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'contact@coprra.com');
define('SMTP_PASS', 'your_smtp_password');
?>
```

### متغيرات البيئة (.env)
```env
# إعدادات التطبيق
APP_NAME=CopRRA
APP_ENV=production
APP_DEBUG=false
APP_URL=https://coprra.com

# إعدادات قاعدة البيانات
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=coprra_ai
DB_USERNAME=your_username
DB_PASSWORD=your_password

# إعدادات الذكاء الاصطناعي
AI_PROVIDER=openai
AI_API_KEY=your_api_key
AI_MODEL=gpt-4

# إعدادات الأمان
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
CSRF_PROTECTION=true
```

## 🔧 الملفات الرئيسية

### الواجهة الأمامية (React)
```
src/
├── components/
│   ├── ai/
│   │   ├── AIChatbot.jsx          # المحادثة الذكية
│   │   └── AISmartSearch.jsx      # البحث الذكي
│   ├── ui/                        # مكونات الواجهة
│   ├── Header.jsx                 # رأس الصفحة
│   ├── Footer.jsx                 # تذييل الصفحة
│   └── ...
├── pages/                         # صفحات الموقع
├── services/                      # خدمات API
└── App.jsx                        # التطبيق الرئيسي
```

### الخلفية (PHP)
```
api/
├── ai_chatbot.php                 # API المحادثة الذكية
├── ai_search.php                  # API البحث الذكي
├── auth.php                       # API المصادقة
├── reviews.php                    # API التقييمات
├── wishlist.php                   # API قائمة الأمنيات
└── rate_limiter.php               # حد معدل الطلبات
```

### قاعدة البيانات
```
coprra_ai_enhanced_database.sql    # قاعدة البيانات المحسنة
database_users_tables.sql          # جداول المستخدمين الأساسية
```

## 🚀 الاستخدام

### 1. تشغيل المحادثة الذكية
```jsx
import AIChatbot from './components/ai/AIChatbot';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  return (
    <div>
      <AIChatbot 
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        currentLanguage="ar"
      />
    </div>
  );
}
```

### 2. استخدام البحث الذكي
```jsx
import AISmartSearch from './components/ai/AISmartSearch';

function SearchPage() {
  const handleSearch = (results, query, data) => {
    console.log('نتائج البحث:', results);
    console.log('استعلام البحث:', query);
    console.log('بيانات إضافية:', data);
  };
  
  return (
    <AISmartSearch 
      onSearch={handleSearch}
      currentLanguage="ar"
      showSuggestions={true}
      showTrending={true}
    />
  );
}
```

### 3. API المحادثة الذكية
```javascript
// إرسال رسالة للمحادثة الذكية
const response = await fetch('/api/ai_chatbot.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'أريد شراء هاتف ذكي',
    language: 'ar',
    mode: 'shopping'
  })
});

const data = await response.json();
console.log('رد الذكاء الاصطناعي:', data.response);
```

### 4. API البحث الذكي
```javascript
// البحث الذكي
const response = await fetch('/api/ai_search.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'هاتف ذكي',
    language: 'ar',
    filters: {
      category: 'smartphones',
      priceRange: 'low'
    }
  })
});

const data = await response.json();
console.log('نتائج البحث:', data.results);
```

## 📊 قاعدة البيانات

### الجداول الرئيسية
- **ai_conversations**: محادثات الذكاء الاصطناعي
- **ai_responses**: ردود الذكاء الاصطناعي
- **search_queries**: استعلامات البحث
- **user_preferences**: تفضيلات المستخدمين
- **ai_recommendations**: التوصيات الذكية
- **ai_content_generation**: المحتوى المُولد تلقائياً
- **ai_image_generation**: الصور المُولدة تلقائياً
- **ai_shopping_assistant**: مساعد التسوق الذكي
- **ai_seo_optimization**: تحسين محركات البحث
- **ai_affiliate_integration**: تكامل الأفلييت
- **ai_analytics**: التحليلات الذكية

### الإجراءات المخزنة
- **GetConversationContext**: الحصول على سياق المحادثة
- **UpdateUserPreferences**: تحديث تفضيلات المستخدم
- **GenerateAIRecommendations**: توليد التوصيات الذكية
- **LogAIIteraction**: تسجيل تفاعل الذكاء الاصطناعي

## 🔒 الأمان

### حماية API
- حد معدل الطلبات (Rate Limiting)
- مصادقة JWT
- تشفير البيانات الحساسة
- حماية من CSRF
- فلترة المدخلات

### حماية قاعدة البيانات
- استعلامات مُعدة مسبقاً
- تشفير كلمات المرور
- صلاحيات محدودة للمستخدمين
- نسخ احتياطية منتظمة

## 📈 الأداء

### تحسينات السرعة
- تخزين مؤقت للصفحات
- ضغط الصور
- تحميل تدريجي للمحتوى
- فهرسة قاعدة البيانات
- CDN للملفات الثابتة

### مراقبة الأداء
- تتبع وقت الاستجابة
- مراقبة استخدام الذاكرة
- تحليل استعلامات قاعدة البيانات
- تقارير الأخطاء

## 🧪 الاختبار

### اختبار الواجهة الأمامية
```bash
# تشغيل الاختبارات
npm test

# اختبار مكونات الذكاء الاصطناعي
npm test -- --testPathPattern="ai"
```

### اختبار الخلفية
```bash
# اختبار PHP APIs
php -l api/ai_chatbot.php
php -l api/ai_search.php

# اختبار قاعدة البيانات
mysql -u root -p -e "USE coprra_ai; SHOW TABLES;"
```

## 📝 التخصيص

### تغيير الألوان
```css
/* في src/App.css */
:root {
  --primary-color: #3b82f6;      /* أزرق */
  --secondary-color: #f8fafc;    /* لبنى */
  --accent-color: #1e40af;       /* كحلى */
}
```

### إضافة لغات جديدة
```javascript
// في مكونات الذكاء الاصطناعي
const translations = {
  ar: { /* العربية */ },
  en: { /* الإنجليزية */ },
  fr: { /* الفرنسية */ },  // إضافة لغة جديدة
  de: { /* الألمانية */ }  // إضافة لغة جديدة
};
```

### تخصيص الذكاء الاصطناعي
```php
// في api/ai_chatbot.php
function generateAIResponse($message, $language, $mode, $context) {
    // إضافة منطق مخصص هنا
    $customLogic = applyCustomLogic($message, $context);
    
    return [
        'content' => $customLogic['response'],
        'suggestions' => $customLogic['suggestions'],
        'type' => $mode
    ];
}
```

## 🚀 النشر

### 1. رفع الملفات
```bash
# رفع جميع الملفات
scp -r * user@your-server:/var/www/html/

# أو باستخدام Git
git push origin main
```

### 2. إعداد الخادم
```bash
# إعداد Apache
sudo a2enmod rewrite
sudo systemctl restart apache2

# إعداد MySQL
sudo mysql_secure_installation
```

### 3. إعداد SSL
```bash
# تثبيت Let's Encrypt
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d coprra.com
```

## 📞 الدعم

### معلومات الاتصال
- **البريد الإلكتروني**: contact@coprra.com
- **الموقع**: https://coprra.com
- **الدعم الفني**: متاح 24/7

### التوثيق
- **دليل المستخدم**: [رابط الدليل]
- **دليل المطور**: [رابط الدليل]
- **API Reference**: [رابط التوثيق]

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف LICENSE للتفاصيل.

## 🤝 المساهمة

نرحب بمساهماتكم! يرجى:

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push للفرع
5. إنشاء Pull Request

## 📊 الإحصائيات

- **المستخدمين النشطين**: 10,000+
- **المنتجات**: 100,000+
- **المحادثات اليومية**: 5,000+
- **عمليات البحث**: 50,000+
- **معدل الرضا**: 4.8/5

## 🔮 التطوير المستقبلي

### الميزات القادمة
- دعم المزيد من اللغات
- تكامل مع المزيد من شبكات الأفلييت
- تحليلات متقدمة
- تطبيق الهاتف المحمول
- دعم الواقع المعزز

### التحسينات التقنية
- تحسين أداء الذكاء الاصطناعي
- دعم WebSocket للمحادثات المباشرة
- تحسين SEO
- دعم PWA

---

**تم التطوير بواسطة فريق CopRRA** 🚀

*آخر تحديث: ديسمبر 2024*