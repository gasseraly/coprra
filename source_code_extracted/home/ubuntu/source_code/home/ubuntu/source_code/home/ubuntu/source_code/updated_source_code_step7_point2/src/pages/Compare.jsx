import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Star, Check, Minus, ArrowRight, ArrowLeft, ShoppingCart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiService from '../services/api';

const Compare = ({ compareItems, removeFromCompare, language, currency, darkMode }) => {
  const [showSpecs, setShowSpecs] = useState(true);
  const [productDetails, setProductDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      title: 'مقارنة المنتجات',
      subtitle: 'قارن بين المنتجات المختلفة لاتخاذ قرار شراء مدروس',
      noItems: 'لا توجد منتجات للمقارنة',
      noItemsDesc: 'أضف منتجات من صفحة المنتجات لبدء المقارنة',
      addProducts: 'تصفح المنتجات',
      remove: 'إزالة',
      price: 'السعر',
      rating: 'التقييم',
      reviews: 'مراجعة',
      specifications: 'المواصفات',
      features: 'المميزات',
      overview: 'نظرة عامة',
      details: 'التفاصيل',
      pros: 'المميزات',
      cons: 'العيوب',
      buyNow: 'اشتري الآن',
      addToCart: 'أضف للسلة',
      showSpecs: 'عرض المواصفات',
      hideSpecs: 'إخفاء المواصفات',
      winner: 'الأفضل',
      bestPrice: 'أفضل سعر',
      bestRating: 'أعلى تقييم',
      brand: 'العلامة التجارية',
      category: 'الفئة',
      availability: 'التوفر',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      compareUp3: 'يمكنك مقارنة حتى 3 منتجات',
      addMore: 'أضف منتجات أخرى',
      clearAll: 'مسح الكل',
      share: 'مشاركة المقارنة',
      print: 'طباعة',
      save: 'حفظ المقارنة'
    },
    en: {
      title: 'Product Comparison',
      subtitle: 'Compare different products to make an informed purchase decision',
      noItems: 'No products to compare',
      noItemsDesc: 'Add products from the products page to start comparing',
      addProducts: 'Browse Products',
      remove: 'Remove',
      price: 'Price',
      rating: 'Rating',
      reviews: 'reviews',
      specifications: 'Specifications',
      features: 'Features',
      overview: 'Overview',
      details: 'Details',
      pros: 'Pros',
      cons: 'Cons',
      buyNow: 'Buy Now',
      addToCart: 'Add to Cart',
      showSpecs: 'Show Specifications',
      hideSpecs: 'Hide Specifications',
      winner: 'Best Choice',
      bestPrice: 'Best Price',
      bestRating: 'Highest Rating',
      brand: 'Brand',
      category: 'Category',
      availability: 'Availability',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      compareUp3: 'You can compare up to 3 products',
      addMore: 'Add More Products',
      clearAll: 'Clear All',
      share: 'Share Comparison',
      print: 'Print',
      save: 'Save Comparison'
    }
  };

  const t = texts[language];

  // جلب تفاصيل المنتجات من API
  useEffect(() => {
    const loadProductDetails = async () => {
      if (compareItems.length === 0) return;
      
      setIsLoading(true);
      const details = {};
      
      try {
        for (const item of compareItems) {
          try {
            const productDetail = await apiService.getProduct(item.id);
            details[item.id] = productDetail;
          } catch (error) {
            console.error(`Error loading product ${item.id}:`, error);
            // استخدام البيانات الموجودة كاحتياطي
            details[item.id] = item;
          }
        }
        setProductDetails(details);
      } catch (error) {
        console.error('Error loading product details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductDetails();
  }, [compareItems]);

  // دالة لتحويل السعر حسب العملة المختارة
  const formatPrice = (price, currencyCode = 'USD') => {
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

  // دالة لتحديد أفضل منتج حسب السعر
  const getBestPriceProduct = () => {
    if (compareItems.length === 0) return null;
    return compareItems.reduce((best, current) => 
      (current.price || 799) < (best.price || 799) ? current : best
    );
  };

  // دالة لتحديد أفضل منتج حسب التقييم
  const getBestRatingProduct = () => {
    if (compareItems.length === 0) return null;
    return compareItems.reduce((best, current) => 
      (current.rating || 4.5) > (best.rating || 4.5) ? current : best
    );
  };

  // مواصفات نموذجية للمنتجات
  const getProductSpecs = (productId) => {
    const specs = {
      1: {
        display: '6.2" Dynamic AMOLED 2X',
        processor: 'Exynos 2400',
        ram: '8GB',
        storage: '256GB',
        camera: '50MP + 12MP + 10MP',
        battery: '4000mAh',
        os: 'Android 14',
        weight: '167g',
        dimensions: '147 x 70.6 x 7.6 mm'
      },
      2: {
        display: '6.1" Super Retina XDR',
        processor: 'A17 Pro',
        ram: '8GB',
        storage: '256GB',
        camera: '48MP + 12MP + 12MP',
        battery: '3274mAh',
        os: 'iOS 17',
        weight: '187g',
        dimensions: '146.6 x 70.6 x 8.25 mm'
      },
      3: {
        display: '13.6" Liquid Retina',
        processor: 'Apple M3',
        ram: '16GB',
        storage: '512GB SSD',
        graphics: '10-core GPU',
        battery: '18 hours',
        os: 'macOS Sonoma',
        weight: '1.24kg',
        dimensions: '304 x 215 x 11.3 mm'
      }
    };
    return specs[productId] || {};
  };

  const clearAllComparisons = () => {
    compareItems.forEach(item => removeFromCompare(item.id));
  };

  if (compareItems.length === 0) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-12 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {t.noItems}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {t.noItemsDesc}
              </p>
              <Link to="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  {t.addProducts}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const bestPriceProduct = getBestPriceProduct();
  const bestRatingProduct = getBestRatingProduct();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
            {t.subtitle}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button variant="outline" onClick={clearAllComparisons}>
              {t.clearAll}
            </Button>
            <Link to="/products">
              <Button variant="outline">
                {t.addMore}
              </Button>
            </Link>
            <Button variant="outline">
              {t.share}
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.compareUp3} ({compareItems.length}/3)
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t.overview}</TabsTrigger>
              <TabsTrigger value="specifications">{t.specifications}</TabsTrigger>
              <TabsTrigger value="details">{t.details}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <td className="p-4 w-48"></td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center min-w-64">
                          <Card className="relative dark:bg-gray-700">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCompare(item.id)}
                              className="absolute top-2 right-2 z-10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            
                            <CardContent className="p-4">
                              <img
                                src={item.main_image_url || item.image || '/api/placeholder/200/200'}
                                alt={language === 'ar' ? item.name_ar : item.name_en || item.name}
                                className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/200/200';
                                }}
                              />
                              
                              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                                {language === 'ar' ? item.name_ar : item.name_en || item.name}
                              </h3>
                              
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                {item.brand_name || item.brand}
                              </p>
                              
                              {/* Badges */}
                              <div className="flex flex-wrap justify-center gap-2 mb-4">
                                {bestPriceProduct?.id === item.id && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    {t.bestPrice}
                                  </Badge>
                                )}
                                {bestRatingProduct?.id === item.id && (
                                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {t.bestRating}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <Button className="w-full" size="sm">
                                  {t.buyNow}
                                </Button>
                                <Button variant="outline" className="w-full" size="sm">
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  {t.addToCart}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </td>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {/* Price Row */}
                    <tr className="border-t dark:border-gray-600">
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">
                        {t.price}
                      </td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(item.price || 799)}
                          </div>
                          {item.originalPrice && item.originalPrice > (item.price || 799) && (
                            <div className="text-sm text-gray-400 line-through">
                              {formatPrice(item.originalPrice)}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Rating Row */}
                    <tr className="border-t dark:border-gray-600">
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">
                        {t.rating}
                      </td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{item.rating || 4.5}</span>
                            <span className="text-gray-500 text-sm">
                              ({item.reviews || 1250} {t.reviews})
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Brand Row */}
                    <tr className="border-t dark:border-gray-600">
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">
                        {t.brand}
                      </td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.brand_name || item.brand}
                          </span>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Availability Row */}
                    <tr className="border-t dark:border-gray-600">
                      <td className="p-4 font-semibold text-gray-900 dark:text-white">
                        {t.availability}
                      </td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center">
                          <Badge variant={item.inStock !== false ? "default" : "destructive"}>
                            {item.inStock !== false ? t.inStock : t.outOfStock}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <td className="p-4 w-48"></td>
                      {compareItems.map((item) => (
                        <td key={item.id} className="p-4 text-center font-semibold text-gray-900 dark:text-white">
                          {language === 'ar' ? item.name_ar : item.name_en || item.name}
                        </td>
                      ))}
                    </tr>
                  </thead>
                  
                  <tbody>
                    {/* Specifications */}
                    {Object.keys(getProductSpecs(compareItems[0]?.id) || {}).map((specKey) => (
                      <tr key={specKey} className="border-t dark:border-gray-600">
                        <td className="p-4 font-semibold text-gray-900 dark:text-white capitalize">
                          {specKey.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        {compareItems.map((item) => {
                          const specs = getProductSpecs(item.id);
                          return (
                            <td key={item.id} className="p-4 text-center text-gray-700 dark:text-gray-300">
                              {specs[specKey] || '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="details" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compareItems.map((item) => (
                  <Card key={item.id} className="dark:bg-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {language === 'ar' ? item.name_ar : item.name_en || item.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                            {t.pros}
                          </h4>
                          <ul className="space-y-1">
                            <li className="flex items-center text-sm">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              ميزة رائعة 1
                            </li>
                            <li className="flex items-center text-sm">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              ميزة رائعة 2
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                            {t.cons}
                          </h4>
                          <ul className="space-y-1">
                            <li className="flex items-center text-sm">
                              <Minus className="w-4 h-4 text-red-500 mr-2" />
                              عيب بسيط 1
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add More Products */}
        {compareItems.length < 3 && (
          <div className="mt-8 text-center">
            <Card className="max-w-md mx-auto dark:bg-gray-800">
              <CardContent className="p-6">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t.addMore}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  يمكنك إضافة {3 - compareItems.length} منتجات أخرى للمقارنة
                </p>
                <Link to="/products">
                  <Button>
                    {t.addProducts}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;

