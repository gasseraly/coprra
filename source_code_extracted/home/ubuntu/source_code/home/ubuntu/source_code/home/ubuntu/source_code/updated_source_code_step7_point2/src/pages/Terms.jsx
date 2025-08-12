import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

const Terms = ({ language, darkMode }) => {
  const [pageContent, setPageContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isRTL = language === 'ar';

  const texts = {
    ar: {
      title: 'شروط الاستخدام',
      lastUpdated: 'آخر تحديث: 8 أغسطس 2024',
      introduction: {
        title: 'مقدمة',
        content: 'مرحباً بك في CopRRA، منصة مقارنة الأسعار الرائدة. باستخدامك لموقعنا وخدماتنا، فإنك توافق على الالتزام بشروط الاستخدام هذه. يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا.'
      },
      acceptance: {
        title: 'قبول الشروط',
        content: 'باستخدام موقع CopRRA أو تطبيقاتنا، فإنك تؤكد أنك:',
        items: [
          'تبلغ من العمر 18 عاماً أو أكثر',
          'تمتلك الأهلية القانونية لإبرام هذه الاتفاقية',
          'توافق على الالتزام بجميع الشروط والأحكام',
          'تقر بأنك قرأت وفهمت سياسة الخصوصية'
        ]
      },
      services: {
        title: 'وصف الخدمات',
        content: 'تقدم CopRRA الخدمات التالية:',
        items: [
          'مقارنة أسعار المنتجات من متاجر مختلفة',
          'عرض معلومات المنتجات والمراجعات',
          'إشعارات حول العروض والخصومات',
          'أدوات البحث والتصفية المتقدمة',
          'حفظ المنتجات المفضلة ومقارنتها'
        ]
      },
      userResponsibilities: {
        title: 'مسؤوليات المستخدم',
        content: 'كمستخدم لخدماتنا، فإنك توافق على:',
        items: [
          'تقديم معلومات دقيقة وحديثة عند التسجيل',
          'الحفاظ على سرية بيانات حسابك',
          'عدم استخدام الموقع لأغراض غير قانونية',
          'احترام حقوق الملكية الفكرية',
          'عدم محاولة اختراق أو إلحاق الضرر بالموقع'
        ]
      },
      prohibitedUses: {
        title: 'الاستخدامات المحظورة',
        content: 'يُحظر استخدام موقعنا للأغراض التالية:',
        items: [
          'نشر محتوى مسيء أو غير لائق',
          'انتهاك حقوق الآخرين أو خصوصيتهم',
          'إرسال رسائل غير مرغوب فيها أو إعلانات',
          'استخدام برامج آلية لجمع البيانات',
          'محاولة الوصول غير المصرح به للأنظمة'
        ]
      },
      intellectualProperty: {
        title: 'الملكية الفكرية',
        content: 'جميع المحتويات الموجودة على موقع CopRRA، بما في ذلك النصوص والصور والشعارات والتصميمات، محمية بحقوق الطبع والنشر وحقوق الملكية الفكرية الأخرى.'
      },
      disclaimer: {
        title: 'إخلاء المسؤولية',
        content: 'نسعى لتقديم معلومات دقيقة ومحدثة، ولكننا لا نضمن:',
        items: [
          'دقة أو اكتمال معلومات الأسعار',
          'توفر المنتجات في المتاجر',
          'استمرارية الخدمة دون انقطاع',
          'خلو الموقع من الأخطاء أو الفيروسات'
        ]
      },
      limitation: {
        title: 'تحديد المسؤولية',
        content: 'لن تكون CopRRA مسؤولة عن أي أضرار مباشرة أو غير مباشرة قد تنتج عن استخدام موقعنا أو عدم القدرة على استخدامه.'
      },
      termination: {
        title: 'إنهاء الخدمة',
        content: 'نحتفظ بالحق في إنهاء أو تعليق حسابك في أي وقت دون إشعار مسبق في حالة انتهاك هذه الشروط.'
      },
      changes: {
        title: 'تعديل الشروط',
        content: 'قد نقوم بتحديث هذه الشروط من وقت لآخر. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.'
      },
      contact: {
        title: 'اتصل بنا',
        content: 'إذا كان لديك أي أسئلة حول شروط الاستخدام هذه، يرجى التواصل معنا على:',
        email: 'legal@coprra.com',
        phone: '+966 11 123 4567'
      }
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: August 8, 2024',
      introduction: {
        title: 'Introduction',
        content: 'Welcome to CopRRA, the leading price comparison platform. By using our website and services, you agree to comply with these Terms of Service. Please read these terms carefully before using our services.'
      },
      acceptance: {
        title: 'Acceptance of Terms',
        content: 'By using the CopRRA website or applications, you confirm that you:',
        items: [
          'Are 18 years of age or older',
          'Have the legal capacity to enter into this agreement',
          'Agree to comply with all terms and conditions',
          'Acknowledge that you have read and understood the Privacy Policy'
        ]
      },
      services: {
        title: 'Description of Services',
        content: 'CopRRA provides the following services:',
        items: [
          'Price comparison of products from different stores',
          'Display of product information and reviews',
          'Notifications about offers and discounts',
          'Advanced search and filtering tools',
          'Save favorite products and compare them'
        ]
      },
      userResponsibilities: {
        title: 'User Responsibilities',
        content: 'As a user of our services, you agree to:',
        items: [
          'Provide accurate and current information when registering',
          'Maintain the confidentiality of your account data',
          'Not use the site for illegal purposes',
          'Respect intellectual property rights',
          'Not attempt to hack or damage the site'
        ]
      },
      prohibitedUses: {
        title: 'Prohibited Uses',
        content: 'It is prohibited to use our site for the following purposes:',
        items: [
          'Publishing offensive or inappropriate content',
          'Violating the rights or privacy of others',
          'Sending spam or advertisements',
          'Using automated programs to collect data',
          'Attempting unauthorized access to systems'
        ]
      },
      intellectualProperty: {
        title: 'Intellectual Property',
        content: 'All content on the CopRRA website, including texts, images, logos, and designs, is protected by copyright and other intellectual property rights.'
      },
      disclaimer: {
        title: 'Disclaimer',
        content: 'We strive to provide accurate and up-to-date information, but we do not guarantee:',
        items: [
          'Accuracy or completeness of price information',
          'Product availability in stores',
          'Uninterrupted service continuity',
          'Site free from errors or viruses'
        ]
      },
      limitation: {
        title: 'Limitation of Liability',
        content: 'CopRRA shall not be liable for any direct or indirect damages that may result from using our site or inability to use it.'
      },
      termination: {
        title: 'Service Termination',
        content: 'We reserve the right to terminate or suspend your account at any time without prior notice in case of violation of these terms.'
      },
      changes: {
        title: 'Terms Modification',
        content: 'We may update these terms from time to time. You will be notified of any material changes via email or notice on the site.'
      },
      contact: {
        title: 'Contact Us',
        content: 'If you have any questions about these Terms of Service, please contact us at:',
        email: 'legal@coprra.com',
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
        
        const content = await apiService.getPage('terms-of-service');
        setPageContent(content);
      } catch (err) {
        console.error('Error loading terms of service:', err);
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
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.introduction.title}</h2>
            <p className="text-gray-700 leading-relaxed">{t.introduction.content}</p>
          </section>

          {/* Acceptance */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.acceptance.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t.acceptance.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.acceptance.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.services.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t.services.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.services.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.userResponsibilities.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t.userResponsibilities.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.userResponsibilities.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Prohibited Uses */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.prohibitedUses.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t.prohibitedUses.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.prohibitedUses.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.intellectualProperty.title}</h2>
            <p className="text-gray-700 leading-relaxed">{t.intellectualProperty.content}</p>
          </section>

          {/* Disclaimer */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.disclaimer.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t.disclaimer.content}</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {t.disclaimer.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Limitation */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.limitation.title}</h2>
            <p className="text-gray-700 leading-relaxed">{t.limitation.content}</p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.termination.title}</h2>
            <p className="text-gray-700 leading-relaxed">{t.termination.content}</p>
          </section>

          {/* Changes */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.changes.title}</h2>
            <p className="text-gray-700 leading-relaxed">{t.changes.content}</p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t.contact.title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{t.contact.content}</p>
            <div className="space-y-2 text-gray-700">
              <p>البريد الإلكتروني: <a href={`mailto:${t.contact.email}`} className="text-blue-600 hover:underline">{t.contact.email}</a></p>
              <p>الهاتف: <a href={`tel:${t.contact.phone}`} className="text-blue-600 hover:underline">{t.contact.phone}</a></p>
            </div>
          </section>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link to="/" className="text-blue-600 hover:underline">
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

