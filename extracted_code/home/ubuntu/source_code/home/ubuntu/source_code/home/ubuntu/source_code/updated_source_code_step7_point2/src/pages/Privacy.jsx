import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

const Privacy = ({ language, darkMode }) => {
  const [pageContent, setPageContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isRTL = language === 'ar';

  const texts = {
    ar: {
      title: 'سياسة الخصوصية',
      lastUpdated: 'آخر تحديث: 8 أغسطس 2024',
      introduction: {
        title: 'مقدمة',
        content: 'نحن في CopRRA نقدر خصوصيتك ونلتزم بحماية معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام منصتنا لمقارنة الأسعار.'
      },
      dataCollection: {
        title: 'المعلومات التي نجمعها',
        content: 'نجمع المعلومات التالية عند استخدامك لخدماتنا:',
        items: [
          'معلومات الحساب: الاسم، عنوان البريد الإلكتروني، كلمة المرور',
          'معلومات الاستخدام: صفحات الويب التي تزورها، المنتجات التي تبحث عنها',
          'معلومات الجهاز: نوع المتصفح، عنوان IP، نظام التشغيل',
          'ملفات تعريف الارتباط: لتحسين تجربة المستخدم وتذكر تفضيلاتك'
        ]
      },
      dataUsage: {
        title: 'كيف نستخدم معلوماتك',
        content: 'نستخدم المعلومات المجمعة للأغراض التالية:',
        items: [
          'تقديم خدمات مقارنة الأسعار وتحسينها',
          'إنشاء حساب المستخدم وإدارته',
          'إرسال إشعارات حول العروض والتحديثات',
          'تحليل استخدام الموقع لتحسين الخدمات',
          'الامتثال للمتطلبات القانونية'
        ]
      },
      dataSharing: {
        title: 'مشاركة المعلومات',
        content: 'لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك في الحالات التالية:',
        items: [
          'مع مقدمي الخدمات الموثوقين الذين يساعدوننا في تشغيل الموقع',
          'عند الحاجة للامتثال للقوانين أو الأوامر القضائية',
          'لحماية حقوقنا أو سلامة المستخدمين',
          'في حالة دمج أو بيع الشركة'
        ]
      },
      dataSecurity: {
        title: 'أمان البيانات',
        content: 'نتخذ تدابير أمنية متقدمة لحماية معلوماتك الشخصية، بما في ذلك:',
        items: [
          'تشفير البيانات أثناء النقل والتخزين',
          'استخدام خوادم آمنة ومحمية',
          'مراقبة مستمرة للأنشطة المشبوهة',
          'تحديث أنظمة الأمان بانتظام'
        ]
      },
      userRights: {
        title: 'حقوقك',
        content: 'لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:',
        items: [
          'الوصول إلى معلوماتك الشخصية وتحديثها',
          'طلب حذف حسابك ومعلوماتك',
          'إلغاء الاشتراك في الرسائل التسويقية',
          'تقييد معالجة معلوماتك في ظروف معينة'
        ]
      },
      cookies: {
        title: 'ملفات تعريف الارتباط',
        content: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.'
      },
      contact: {
        title: 'اتصل بنا',
        content: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا على:',
        email: 'privacy@coprra.com',
        phone: '+966 11 123 4567'
      }
    },
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: August 8, 2024',
      introduction: {
        title: 'Introduction',
        content: 'At CopRRA, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your information when you use our price comparison platform.'
      },
      dataCollection: {
        title: 'Information We Collect',
        content: 'We collect the following information when you use our services:',
        items: [
          'Account information: Name, email address, password',
          'Usage information: Web pages you visit, products you search for',
          'Device information: Browser type, IP address, operating system',
          'Cookies: To improve user experience and remember your preferences'
        ]
      },
      dataUsage: {
        title: 'How We Use Your Information',
        content: 'We use the collected information for the following purposes:',
        items: [
          'Provide and improve price comparison services',
          'Create and manage user accounts',
          'Send notifications about offers and updates',
          'Analyze website usage to improve services',
          'Comply with legal requirements'
        ]
      },
      dataSharing: {
        title: 'Information Sharing',
        content: 'We do not sell or rent your personal information to third parties. We may share your information in the following cases:',
        items: [
          'With trusted service providers who help us operate the website',
          'When required to comply with laws or court orders',
          'To protect our rights or user safety',
          'In case of company merger or sale'
        ]
      },
      dataSecurity: {
        title: 'Data Security',
        content: 'We implement advanced security measures to protect your personal information, including:',
        items: [
          'Data encryption during transmission and storage',
          'Use of secure and protected servers',
          'Continuous monitoring for suspicious activities',
          'Regular security system updates'
        ]
      },
      userRights: {
        title: 'Your Rights',
        content: 'You have the following rights regarding your personal information:',
        items: [
          'Access and update your personal information',
          'Request deletion of your account and information',
          'Unsubscribe from marketing messages',
          'Restrict processing of your information under certain circumstances'
        ]
      },
      cookies: {
        title: 'Cookies',
        content: 'We use cookies to improve your experience on our website. You can control cookie settings through your browser.'
      },
      contact: {
        title: 'Contact Us',
        content: 'If you have any questions about this Privacy Policy, please contact us at:',
        email: 'privacy@coprra.com',
        phone: '+966 11 123 4567'
      }
    }
  };

  const t = texts[language];

  // جلب محتوى الصفحة من API
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const content = await apiService.getPage('privacy-policy');
        setPageContent(content);
      } catch (err) {
        console.error('Error loading privacy policy:', err);
        setError('حدث خطأ في تحميل المحتوى');
        // سنستخدم المحتوى الثابت كاحتياطي
      } finally {
        setIsLoading(false);
      }
    };

    loadPageContent();
  }, [language]);

  // إذا كان هناك محتوى من API، استخدمه
  if (pageContent && !isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 ${isRTL ? 'rtl' : 'ltr'} transition-colors duration-200`}>
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8 transition-colors duration-200`}>
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                {language === 'ar' ? pageContent.title_ar : pageContent.title_en}
              </h1>
              {pageContent.updated_at && (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  آخر تحديث: {new Date(pageContent.updated_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                </p>
              )}
            </div>

            {/* عرض المحتوى بطريقة آمنة */}
            <div className={`prose prose-lg max-w-none ${darkMode ? 'prose-invert' : ''} ${isRTL ? 'text-right' : 'text-left'}`}>
              {/* تنظيف وعرض المحتوى بطريقة آمنة */}
              {language === 'ar' ? (
                <div>{pageContent.content_ar}</div>
              ) : (
                <div>{pageContent.content_en}</div>
              )}
            </div>

            <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Link to="/" className="text-blue-600 hover:underline">
                ← العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>جاري تحميل المحتوى...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 ${isRTL ? 'rtl' : 'ltr'} transition-colors duration-200`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8 transition-colors duration-200`}>
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t.title}</h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t.lastUpdated}</p>
          </div>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.introduction.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{t.introduction.content}</p>
          </section>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.dataCollection.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>{t.dataCollection.content}</p>
            <ul className={`list-disc list-inside space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.dataCollection.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Usage */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.dataUsage.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>{t.dataUsage.content}</p>
            <ul className={`list-disc list-inside space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.dataUsage.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.dataSharing.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>{t.dataSharing.content}</p>
            <ul className={`list-disc list-inside space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.dataSharing.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.dataSecurity.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>{t.dataSecurity.content}</p>
            <ul className={`list-disc list-inside space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.dataSecurity.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* User Rights */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.userRights.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>{t.userRights.content}</p>
            <ul className={`list-disc list-inside space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.userRights.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.cookies.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{t.cookies.content}</p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t.contact.title}</h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>{t.contact.content}</p>
            <div className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>البريد الإلكتروني: <a href={`mailto:${t.contact.email}`} className="text-blue-600 hover:underline">{t.contact.email}</a></p>
              <p>الهاتف: <a href={`tel:${t.contact.phone}`} className="text-blue-600 hover:underline">{t.contact.phone}</a></p>
            </div>
          </section>

          <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <Link to="/" className="text-blue-600 hover:underline">
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

