import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw, Award, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import SEOHead from '../components/SEOHead';
import ReviewSystem from '../components/ReviewSystem';
import WishlistButton from '../components/WishlistButton';
import apiService from '../services/api';

const ProductDetail = ({ addToCompare, language, currency, darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      loading: 'جاري التحميل...',
      error: 'حدث خطأ في تحميل المنتج',
      notFound: 'المنتج غير موجود',
      backToProducts: 'العودة للمنتجات',
      addToCart: 'إضافة للسلة',
      addToWishlist: 'إضافة للمفضلة',
      removeFromWishlist: 'إزالة من المفضلة',
      addToCompare: 'إضافة للمقارنة',
      share: 'مشاركة',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      limitedStock: 'كمية محدودة',
      freeShipping: 'شحن مجاني',
      warranty: 'ضمان',
      returns: 'إرجاع مجاني',
      authentic: 'منتج أصلي',
      overview: 'نظرة عامة',
      specifications: 'المواصفات',
      reviews: 'المراجعات',
      qa: 'الأسئلة والأجوبة',
      description: 'الوصف',
      features: 'المميزات',
      keyFeatures: 'المميزات الرئيسية',
      technicalSpecs: 'المواصفات التقنية',
      dimensions: 'الأبعاد',
      weight: 'الوزن',
      color: 'اللون',
      material: 'المادة',
      brand: 'العلامة التجارية',
      model: 'الموديل',
      category: 'الفئة',
      tags: 'العلامات',
      relatedProducts: 'منتجات ذات صلة',
      recentlyViewed: 'شوهدت مؤخراً',
      priceHistory: 'تاريخ السعر',
      availability: 'التوفر',
      seller: 'البائع',
      shippingInfo: 'معلومات الشحن',
      returnPolicy: 'سياسة الإرجاع',
      customerService: 'خدمة العملاء'
    },
    en: {
      loading: 'Loading...',
      error: 'Error loading product',
      notFound: 'Product not found',
      backToProducts: 'Back to Products',
      addToCart: 'Add to Cart',
      addToWishlist: 'Add to Wishlist',
      removeFromWishlist: 'Remove from Wishlist',
      addToCompare: 'Add to Compare',
      share: 'Share',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      limitedStock: 'Limited Stock',
      freeShipping: 'Free Shipping',
      warranty: 'Warranty',
      returns: 'Free Returns',
      authentic: 'Authentic Product',
      overview: 'Overview',
      specifications: 'Specifications',
      reviews: 'Reviews',
      qa: 'Q&A',
      description: 'Description',
      features: 'Features',
      keyFeatures: 'Key Features',
      technicalSpecs: 'Technical Specifications',
      dimensions: 'Dimensions',
      weight: 'Weight',
      color: 'Color',
      material: 'Material',
      brand: 'Brand',
      model: 'Model',
      category: 'Category',
      tags: 'Tags',
      relatedProducts: 'Related Products',
      recentlyViewed: 'Recently Viewed',
      priceHistory: 'Price History',
      availability: 'Availability',
      seller: 'Seller',
      shippingInfo: 'Shipping Info',
      returnPolicy: 'Return Policy',
      customerService: 'Customer Service'
    }
  };

  const t = texts[language] || texts.en;

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getProduct(id);
      
      if (response.success && response.product) {
        setProduct(response.product);
        
        // Check if product is in wishlist (if user is logged in)
        const sessionToken = localStorage.getItem('session_token');
        if (sessionToken) {
          // TODO: Check wishlist status
        }
      } else {
        setError(t.notFound);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product.id);
  };

  const handleWishlistToggle = () => {
    // TODO: Implement wishlist functionality
    setIsInWishlist(!isInWishlist);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product[`name_${language}`] || product.name_en,
          text: product[`description_${language}`] || product.description_en,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { text: t.outOfStock, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' };
    } else if (stock <= 5) {
      return { text: t.limitedStock, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
    } else {
      return { text: t.inStock, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
    }).format(price * currency.rate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <Button onClick={() => navigate('/products')} variant="outline">
            {t.backToProducts}
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const stockStatus = getStockStatus(product.stock_quantity || 0);
  const productImages = product.images || [product.main_image_url].filter(Boolean);

  return (
    <>
      <SEOHead
        title={product[`name_${language}`] || product.name_en}
        description={product[`description_${language}`] || product.description_en}
        keywords={product.tags || ''}
        image={product.main_image_url}
        type="product"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product[`name_${language}`] || product.name_en,
          "description": product[`description_${language}`] || product.description_en,
          "image": productImages,
          "brand": {
            "@type": "Brand",
            "name": product.brand_name
          },
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": currency.code,
            "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "COPRRA"
            }
          },
          "aggregateRating": product.average_rating ? {
            "@type": "AggregateRating",
            "ratingValue": product.average_rating,
            "reviewCount": product.review_count || 0
          } : undefined
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-gray-900 dark:hover:text-gray-100">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-gray-900 dark:hover:text-gray-100">
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </button>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">
            {product[`name_${language}`] || product.name_en}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {productImages.length > 0 ? (
                <>
                  <img
                    src={productImages[currentImageIndex]}
                    alt={product[`name_${language}`] || product.name_en}
                    className="w-full h-full object-cover"
                  />
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={currentImageIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(Math.min(productImages.length - 1, currentImageIndex + 1))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        disabled={currentImageIndex === productImages.length - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4"></div>
                    <p className="text-gray-500 dark:text-gray-400">No image available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? 'border-blue-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product[`name_${language}`] || product.name_en} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {product[`name_${language}`] || product.name_en}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  {renderStars(Math.round(product.average_rating || 0))}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({product.review_count || 0} {language === 'ar' ? 'مراجعة' : 'reviews'})
                  </span>
                </div>
                
                <Badge variant="secondary">
                  {product.brand_name}
                </Badge>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(product.price)}
                </div>
                
                {product.original_price && product.original_price > product.price && (
                  <div className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.original_price)}
                  </div>
                )}
                
                <Badge className={stockStatus.bgColor}>
                  <span className={stockStatus.color}>{stockStatus.text}</span>
                </Badge>
              </div>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span>{t.freeShipping}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>{t.warranty}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="h-4 w-4 text-orange-600" />
                <span>{t.returns}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Award className="h-4 w-4 text-purple-600" />
                <span>{t.authentic}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t.addToCart}
                </Button>
                
                <WishlistButton
                  productId={product.id}
                  language={language}
                  size="lg"
                  variant="outline"
                />
                
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              <Button
                onClick={() => addToCompare(product)}
                variant="outline"
                className="w-full"
              >
                {t.addToCompare}
              </Button>
            </div>

            {/* Quick Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{t.brand}:</span>
                    <span className="ml-2">{product.brand_name}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t.category}:</span>
                    <span className="ml-2">{product.category_name}</span>
                  </div>
                  <div>
                    <span className="font-medium">{t.availability}:</span>
                    <span className={`ml-2 ${stockStatus.color}`}>{stockStatus.text}</span>
                  </div>
                  <div>
                    <span className="font-medium">SKU:</span>
                    <span className="ml-2">{product.sku || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="specifications">{t.specifications}</TabsTrigger>
            <TabsTrigger value="reviews">{t.reviews}</TabsTrigger>
            <TabsTrigger value="qa">{t.qa}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{product[`description_${language}`] || product.description_en}</p>
                  
                  {product.features && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">{t.keyFeatures}</h3>
                      <ul className="list-disc list-inside space-y-2">
                        {product.features.split('\n').map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.technicalSpecs}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications && Object.entries(JSON.parse(product.specifications)).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewSystem
              productId={product.id}
              language={language}
              darkMode={darkMode}
            />
          </TabsContent>

          <TabsContent value="qa" className="mt-6">
            <ReviewSystem
              productId={product.id}
              language={language}
              darkMode={darkMode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProductDetail;

