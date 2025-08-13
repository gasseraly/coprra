import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import apiService from './services/api';
import './App.css';

// تحميل الصفحات بشكل تدريجي (Lazy Loading)
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Blog = lazy(() => import('./pages/Blog'));
const Compare = lazy(() => import('./pages/Compare'));
const Login = lazy(() => import('./pages/Login'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

// مكون Loading للصفحات
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// دالة للحصول على معلومات الموقع الجغرافي مع تحسينات
const getLocationBasedDefaults = async () => {
  try {
    // التحقق من الذاكرة المؤقتة أولاً
    const cached = localStorage.getItem('locationDefaults');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // إذا كانت البيانات أقل من 24 ساعة
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    }

    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const countryCode = data.country_code?.toLowerCase();
    
    const countryLanguageMap = {
      'us': 'en', 'gb': 'en', 'ca': 'en', 'au': 'en', 'nz': 'en',
      'cn': 'zh', 'tw': 'zh', 'hk': 'zh', 'sg': 'zh',
      'in': 'hi',
      'es': 'es', 'mx': 'es', 'ar': 'es', 'co': 'es', 'pe': 'es',
      'sa': 'ar', 'ae': 'ar', 'eg': 'ar', 'ma': 'ar', 'jo': 'ar',
      'br': 'pt', 'pt': 'pt',
      'bd': 'bn',
      'ru': 'ru', 'by': 'ru', 'kz': 'ru',
      'jp': 'ja',
      'fr': 'fr', 'be': 'fr', 'ch': 'fr',
      'de': 'de', 'at': 'de',
      'kr': 'ko',
      'tr': 'tr',
      'it': 'it',
      'vn': 'vi'
    };
    
    const countryCurrencyMap = {
      'us': 'USD', 'gb': 'GBP', 'ca': 'CAD', 'au': 'AUD',
      'cn': 'CNY', 'tw': 'CNY', 'hk': 'CNY', 'sg': 'CNY',
      'in': 'INR',
      'es': 'EUR', 'mx': 'USD', 'ar': 'USD', 'co': 'USD', 'pe': 'USD',
      'sa': 'SAR', 'ae': 'AED', 'eg': 'USD', 'ma': 'USD', 'jo': 'USD',
      'br': 'BRL', 'pt': 'EUR',
      'bd': 'USD',
      'ru': 'RUB', 'by': 'RUB', 'kz': 'RUB',
      'jp': 'JPY',
      'fr': 'EUR', 'be': 'EUR', 'ch': 'EUR',
      'de': 'EUR', 'at': 'EUR',
      'kr': 'KRW',
      'tr': 'TRY',
      'it': 'EUR',
      'vn': 'USD'
    };
    
    const defaults = {
      language: countryLanguageMap[countryCode] || 'en',
      currency: countryCurrencyMap[countryCode] || 'USD'
    };

    // حفظ في الذاكرة المؤقتة
    localStorage.setItem('locationDefaults', JSON.stringify({
      data: defaults,
      timestamp: Date.now()
    }));

    return defaults;
  } catch (error) {
    console.error('Error getting location:', error);
    return { language: 'en', currency: 'USD' };
  }
};

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('ar');
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // تحسين إدارة الحالة باستخدام useMemo
  const appState = useMemo(() => ({
    currentLanguage,
    setCurrentLanguage,
    currentCurrency,
    setCurrentCurrency,
    isDarkMode,
    setIsDarkMode,
    languages,
    currencies,
    user,
    setUser
  }), [currentLanguage, currentCurrency, isDarkMode, languages, currencies, user]);

  // تحميل البيانات الأساسية
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);

        // تحميل البيانات بشكل متوازي
        const [languagesData, currenciesData, locationDefaults] = await Promise.all([
          apiService.getLanguages(),
          apiService.getCurrencies(),
          getLocationBasedDefaults()
        ]);

        setLanguages(languagesData);
        setCurrencies(currenciesData);

        // تطبيق الإعدادات المحفوظة أو الافتراضية
        const savedLanguage = localStorage.getItem('selectedLanguage');
        const savedCurrency = localStorage.getItem('selectedCurrency');
        const savedTheme = localStorage.getItem('isDarkMode');

        setCurrentLanguage(savedLanguage || locationDefaults.language);
        setCurrentCurrency(savedCurrency || locationDefaults.currency);
        setIsDarkMode(savedTheme === 'true');

        // التحقق من حالة تسجيل الدخول
        try {
          const userProfile = await apiService.getUserProfile();
          if (userProfile && userProfile.success) {
            setUser(userProfile.user);
          }
        } catch (error) {
          // المستخدم غير مسجل الدخول
          console.log('User not logged in');
        }

      } catch (error) {
        console.error('Error initializing app:', error);
        // استخدام القيم الافتراضية في حالة الخطأ
        setCurrentLanguage('ar');
        setCurrentCurrency('USD');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // حفظ الإعدادات عند تغييرها
  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', currentCurrency);
  }, [currentCurrency]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode.toString());
    // تطبيق الثيم على الجسم
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // عرض شاشة التحميل
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <HelmetProvider>
      <Router>
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
          <SEOHead />
          
          <Header 
            {...appState}
          />
          
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home {...appState} />} />
                <Route path="/products" element={<Products {...appState} />} />
                <Route path="/product/:id" element={<ProductDetail {...appState} />} />
                <Route path="/wishlist" element={<Wishlist {...appState} />} />
                <Route path="/blog" element={<Blog {...appState} />} />
                <Route path="/blog/:slug" element={<Blog {...appState} />} />
                <Route path="/compare" element={<Compare {...appState} />} />
                <Route path="/login" element={<Login {...appState} />} />
                <Route path="/privacy" element={<Privacy {...appState} />} />
                <Route path="/terms" element={<Terms {...appState} />} />
              </Routes>
            </Suspense>
          </main>
          
          <Footer 
            {...appState}
          />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;

