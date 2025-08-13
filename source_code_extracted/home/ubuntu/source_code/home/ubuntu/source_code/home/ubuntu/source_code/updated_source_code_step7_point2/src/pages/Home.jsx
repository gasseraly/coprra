import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, TrendingUp, Shield, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SEOHead from '../components/SEOHead';
import apiService from '../services/api';

const Home = ({ addToCompare, language, currency, darkMode }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      heroTitle: 'اعثر على أفضل الأسعار في مكان واحد',
      heroSubtitle: 'قارن الأسعار من آلاف المتاجر واحصل على أفضل الصفقات للمنتجات التي تحبها',
      searchPlaceholder: 'ابحث عن المنتجات...',
      searchButton: 'بحث',
      featuredProducts: 'المنتجات المميزة',
      browseCategories: 'تصفح الفئات',
      featuredBrands: 'العلامات التجارية المميزة',
      whyChooseUs: 'لماذا تختار CopRRA؟',
      priceComparison: 'مقارنة الأسعار',
      priceComparisonDesc: 'قارن الأسعار من مئات المتاجر في ثوانٍ',
      trustedReviews: 'مراجعات موثوقة',
      trustedReviewsDesc: 'اقرأ مراجعات حقيقية من مستخدمين آخرين',
      fastDelivery: 'توصيل سريع',
      fastDeliveryDesc: 'احصل على منتجاتك بأسرع وقت ممكن',
      securePayment: 'دفع آمن',
      securePaymentDesc: 'معاملات آمنة ومحمية 100%',
      addToCompare: 'أضف للمقارنة',
      viewDetails: 'عرض التفاصيل',
      latestArticles: 'أحدث المقالات',
      noArticles: 'لا توجد مقالات متاحة حالياً',
      readMore: 'اقرأ المزيد',
      getStarted: 'ابدأ الآن',
      viewAllProducts: 'عرض جميع المنتجات',
      products: 'منتج',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ في تحميل البيانات',
      startSavingToday: 'ابدأ في توفير المال اليوم',
      joinThousands: 'انضم إلى آلاف المستخدمين الذين يوفرون المال مع CopRRA'
    },
    en: {
      heroTitle: 'Find the Best Prices in One Place',
      heroSubtitle: 'Compare prices from thousands of stores and get the best deals on products you love',
      searchPlaceholder: 'Search for products...',
      searchButton: 'Search',
      featuredProducts: 'Featured Products',
      browseCategories: 'Browse Categories',
      featuredBrands: 'Featured Brands',
      whyChooseUs: 'Why Choose CopRRA?',
      priceComparison: 'Price Comparison',
      priceComparisonDesc: 'Compare prices from hundreds of stores in seconds',
      trustedReviews: 'Trusted Reviews',
      trustedReviewsDesc: 'Read genuine reviews from other users',
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: 'Get your products as fast as possible',
      securePayment: 'Secure Payment',
      securePaymentDesc: '100% secure and protected transactions',
      addToCompare: 'Add to Compare',
      viewDetails: 'View Details',
      latestArticles: 'Latest Articles',
      noArticles: 'No articles available at the moment',
      readMore: 'Read More',
      getStarted: 'Get Started',
      viewAllProducts: 'View All Products',
      products: 'products',
      loading: 'Loading...',
      error: 'Error loading data',
      startSavingToday: 'Start Saving Money Today',
      joinThousands: 'Join thousands of users who save money with CopRRA'
    }
  };

  const t = texts[language];

  // جلب البيانات من API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // جلب البيانات بشكل متوازي
        const [productsData, brandsData, categoriesData, articlesData] = await Promise.all([
          apiService.getProducts({ limit: 8 }), // جلب 8 منتجات مميزة
          apiService.getBrands(),
          apiService.getCategories(),
          apiService.getArticles({ limit: 3 }) // جلب 3 مقالات حديثة
        ]);

        setFeaturedProducts(productsData);
        setBrands(brandsData);
        
        // فلترة الفئات الرئيسية فقط (التي ليس لها parent_id)
        const mainCategories = categoriesData.filter(cat => !cat.parent_id);
        setCategories(mainCategories.slice(0, 6)); // أخذ أول 6 فئات
        
        setArticles(articlesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      // يمكن إضافة منطق البحث هنا أو التوجه إلى صفحة المنتجات مع البحث
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: t.priceComparison,
      description: t.priceComparisonDesc
    },
    {
      icon: Star,
      title: t.trustedReviews,
      description: t.trustedReviewsDesc
    },
    {
      icon: Zap,
      title: t.fastDelivery,
      description: t.fastDeliveryDesc
    },
    {
      icon: Shield,
      title: t.securePayment,
      description: t.securePaymentDesc
    }
  ];

  // دالة لتحويل السعر حسب العملة المختارة
  const formatPrice = (price, currencyCode = 'USD') => {
    // هذه دالة مبسطة، يمكن تطويرها لاحقاً لتشمل تحويل العملات الحقيقي
    const currencySymbols = {
      'USD': '$',
      'SAR': 'ر.س',
      'AED': 'د.إ',
      'EUR': '€',
      'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${price}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <SEOHead 
        title={language === 'ar' ? 'CopRRA - مقارنة الأسعار والتسوق الذكي' : 'CopRRA - Price Comparison & Smart Shopping'}
        description={language === 'ar' ? 'اكتشف أفضل الأسعار للمنتجات التقنية مع CopRRA. قارن الأسعار من متاجر متعددة واتخذ قرارات شراء ذكية.' : 'Discover the best prices for tech products with CopRRA. Compare prices from multiple stores and make smart purchasing decisions.'}
        keywords={language === 'ar' ? 'مقارنة أسعار, تسوق ذكي, أفضل الأسعار, منتجات تقنية, هواتف ذكية, أجهزة كمبيوتر, إلكترونيات' : 'price comparison, smart shopping, best prices, tech products, smartphones, computers, electronics'}
        type="website"
        language={language}
        currency={currency}
        breadcrumbs={[
          { name: language === 'ar' ? 'الرئيسية' : 'Home', url: 'https://coprra.com/' }
        ]}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {t.heroSubtitle}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400 w-5 h-5`} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-lg text-gray-900 text-lg focus:ring-4 focus:ring-blue-300 focus:outline-none`}
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
                >
                  {t.searchButton}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {featuredProducts.slice(0, 4).map((product) => (
                <span key={product.id} className="bg-white/20 px-4 py-2 rounded-full">
                  {language === 'ar' ? product.name_ar : product.name_en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.featuredProducts}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={product.main_image_url || '/api/placeholder/300/300'}
                      alt={language === 'ar' ? product.name_ar : product.name_en}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/300';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {language === 'ar' ? product.name_ar : product.name_en}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{product.brand_name}</p>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                          4.5 (1250)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(799.00)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToCompare(product)}
                        className="flex-1"
                      >
                        {t.addToCompare}
                      </Button>
                      <Button size="sm" className="flex-1">
                        {t.viewDetails}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/products">
              <Button size="lg" variant="outline">
                {t.viewAllProducts}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.browseCategories}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer dark:bg-gray-700">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    📱
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    1000+ {t.products}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.whyChooseUs}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.featuredBrands}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.slice(0, 6).map((brand) => (
              <div key={brand.id} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-center">
                <img
                  src={brand.logo_url || '/api/placeholder/120/60'}
                  alt={brand.name}
                  className="max-h-12 w-auto opacity-70 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/120/60';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t.latestArticles}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="group hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800">
                  <CardContent className="p-0">
                    <img
                      src={article.image_url || '/api/placeholder/400/200'}
                      alt={language === 'ar' ? article.title_ar : article.title_en}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/200';
                      }}
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                        {language === 'ar' ? article.title_ar : article.title_en}
                      </h3>
                      <Link to={`/blog/${article.slug}`}>
                        <Button variant="outline" size="sm">
                          {t.readMore}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.startSavingToday}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t.joinThousands}
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
              {t.getStarted}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

