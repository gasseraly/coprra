import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Star, Grid, List, SortAsc, Filter, Loader2, AlertCircle, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import SEOHead from '../components/SEOHead';

const Wishlist = ({ addToCompare, language, currency, darkMode }) => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      title: 'قائمة المفضلة',
      subtitle: 'المنتجات التي أضفتها لقائمة المفضلة',
      emptyWishlist: 'قائمة المفضلة فارغة',
      emptyDescription: 'لم تقم بإضافة أي منتجات لقائمة المفضلة بعد',
      browsProducts: 'تصفح المنتجات',
      removeFromWishlist: 'إزالة من المفضلة',
      addToCart: 'إضافة للسلة',
      addToCompare: 'إضافة للمقارنة',
      viewProduct: 'عرض المنتج',
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      oldest: 'الأقدم',
      priceLow: 'السعر: من الأقل للأعلى',
      priceHigh: 'السعر: من الأعلى للأقل',
      name: 'الاسم',
      selectAll: 'تحديد الكل',
      deselectAll: 'إلغاء تحديد الكل',
      selectedItems: 'عنصر محدد',
      removeSelected: 'إزالة المحددة',
      moveToCart: 'نقل للسلة',
      clearWishlist: 'مسح القائمة',
      confirmClear: 'هل أنت متأكد من مسح قائمة المفضلة بالكامل؟',
      confirmRemove: 'هل أنت متأكد من إزالة هذا المنتج من قائمة المفضلة؟',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      limitedStock: 'كمية محدودة',
      loginRequired: 'يجب تسجيل الدخول لعرض قائمة المفضلة',
      login: 'تسجيل الدخول',
      itemRemoved: 'تم إزالة المنتج من قائمة المفضلة',
      itemsRemoved: 'تم إزالة المنتجات المحددة من قائمة المفضلة',
      wishlistCleared: 'تم مسح قائمة المفضلة',
      movedToCart: 'تم نقل المنتج للسلة',
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى',
      totalItems: 'إجمالي العناصر'
    },
    en: {
      title: 'Wishlist',
      subtitle: 'Products you\'ve added to your wishlist',
      emptyWishlist: 'Your wishlist is empty',
      emptyDescription: 'You haven\'t added any products to your wishlist yet',
      browsProducts: 'Browse Products',
      removeFromWishlist: 'Remove from Wishlist',
      addToCart: 'Add to Cart',
      addToCompare: 'Add to Compare',
      viewProduct: 'View Product',
      sortBy: 'Sort by',
      newest: 'Newest',
      oldest: 'Oldest',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      name: 'Name',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      selectedItems: 'selected items',
      removeSelected: 'Remove Selected',
      moveToCart: 'Move to Cart',
      clearWishlist: 'Clear Wishlist',
      confirmClear: 'Are you sure you want to clear your entire wishlist?',
      confirmRemove: 'Are you sure you want to remove this product from your wishlist?',
      cancel: 'Cancel',
      confirm: 'Confirm',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      limitedStock: 'Limited Stock',
      loginRequired: 'Please login to view your wishlist',
      login: 'Login',
      itemRemoved: 'Product removed from wishlist',
      itemsRemoved: 'Selected products removed from wishlist',
      wishlistCleared: 'Wishlist cleared',
      movedToCart: 'Product moved to cart',
      error: 'An error occurred, please try again',
      totalItems: 'Total Items'
    }
  };

  const t = texts[language] || texts.en;

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('session_token') !== null;
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      setError(t.loginRequired);
      setIsLoading(false);
      return;
    }
    
    loadWishlist();
  }, [sortBy]);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/wishlist.php?action=get-wishlist&sort=${sortBy}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setWishlistItems(data.wishlist_items);
      } else {
        setError(data.error || t.error);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch(`/api/wishlist.php?action=remove-from-wishlist&product_id=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        setSelectedItems(prev => prev.filter(id => id !== productId));
        setMessage({ type: 'success', text: t.itemRemoved });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeSelectedItems = async () => {
    try {
      setIsProcessing(true);
      
      const promises = selectedItems.map(productId =>
        fetch(`/api/wishlist.php?action=remove-from-wishlist&product_id=${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session_token')}`
          }
        })
      );
      
      await Promise.all(promises);
      
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.product_id)));
      setSelectedItems([]);
      setMessage({ type: 'success', text: t.itemsRemoved });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearWishlist = async () => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/wishlist.php?action=clear-wishlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setWishlistItems([]);
        setSelectedItems([]);
        setMessage({ type: 'success', text: t.wishlistCleared });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setIsProcessing(false);
    }
  };

  const moveToCart = async (productId) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/wishlist.php?action=move-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
        setSelectedItems(prev => prev.filter(id => id !== productId));
        setMessage({ type: 'success', text: t.movedToCart });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || t.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.product_id));
    }
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
    }).format(price * currency.rate);
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
      return { text: t.outOfStock, color: 'text-red-600 dark:text-red-400' };
    } else if (stock <= 5) {
      return { text: t.limitedStock, color: 'text-orange-600 dark:text-orange-400' };
    } else {
      return { text: t.inStock, color: 'text-green-600 dark:text-green-400' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error === t.loginRequired) {
    return (
      <>
        <SEOHead
          title={t.title}
          description={t.subtitle}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{t.loginRequired}</h2>
            <Button onClick={() => navigate('/login')}>
              {t.login}
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead
          title={t.title}
          description={t.subtitle}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">{error}</h2>
            <Button onClick={loadWishlist} variant="outline">
              {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={t.title}
        description={t.subtitle}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": t.title,
          "description": t.subtitle
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
        </div>

        {message.text && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-green-500 bg-green-50 dark:bg-green-900/20'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">{t.emptyWishlist}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{t.emptyDescription}</p>
            <Button onClick={() => navigate('/products')}>
              <Package className="h-4 w-4 mr-2" />
              {t.browsProducts}
            </Button>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedItems.length === wishlistItems.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">
                    {selectedItems.length === wishlistItems.length ? t.deselectAll : t.selectAll}
                  </span>
                </div>
                
                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {selectedItems.length} {t.selectedItems}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isProcessing}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t.removeSelected}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t.removeSelected}</DialogTitle>
                          <DialogDescription>
                            {language === 'ar' 
                              ? `هل أنت متأكد من إزالة ${selectedItems.length} منتج من قائمة المفضلة؟`
                              : `Are you sure you want to remove ${selectedItems.length} products from your wishlist?`
                            }
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">{t.cancel}</Button>
                          <Button onClick={removeSelectedItems} disabled={isProcessing}>
                            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            {t.confirm}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{t.totalItems}: {wishlistItems.length}</span>
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t.newest}</SelectItem>
                    <SelectItem value="oldest">{t.oldest}</SelectItem>
                    <SelectItem value="price_low">{t.priceLow}</SelectItem>
                    <SelectItem value="price_high">{t.priceHigh}</SelectItem>
                    <SelectItem value="name">{t.name}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {wishlistItems.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={isProcessing}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t.clearWishlist}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t.clearWishlist}</DialogTitle>
                        <DialogDescription>
                          {t.confirmClear}
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline">{t.cancel}</Button>
                        <Button onClick={clearWishlist} disabled={isProcessing}>
                          {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                          {t.confirm}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {wishlistItems.map((item) => {
                const product = item.product;
                const stockStatus = getStockStatus(product.stock_quantity);
                const isSelected = selectedItems.includes(product.id);

                return (
                  <Card key={item.wishlist_id} className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center space-x-4'}>
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectItem(product.id)}
                        />
                      </div>

                      {/* Product Image */}
                      <div className={viewMode === 'grid' ? 'aspect-square mb-4' : 'w-24 h-24 flex-shrink-0'}>
                        <img
                          src={product.main_image_url || '/placeholder-product.jpg'}
                          alt={product[`name_${language}`] || product.name_en}
                          className="w-full h-full object-cover rounded-lg cursor-pointer"
                          onClick={() => navigate(`/product/${product.id}`)}
                        />
                      </div>

                      {/* Product Info */}
                      <div className={viewMode === 'grid' ? '' : 'flex-1'}>
                        <div className="mb-2">
                          <h3 
                            className="font-semibold text-lg cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            {product[`name_${language}`] || product.name_en}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {product.brand_name}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 mb-2">
                          {renderStars(Math.round(product.average_rating))}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({product.review_count})
                          </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(product.price)}
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.original_price)}
                              </span>
                            )}
                          </div>
                          <span className={`text-sm ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className={`flex gap-2 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
                          <Button
                            onClick={() => moveToCart(product.id)}
                            disabled={product.stock_quantity === 0 || isProcessing}
                            className="flex-1"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {t.addToCart}
                          </Button>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => addToCompare(product)}
                              variant="outline"
                              size="sm"
                            >
                              {t.addToCompare}
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{t.removeFromWishlist}</DialogTitle>
                                  <DialogDescription>
                                    {t.confirmRemove}
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">{t.cancel}</Button>
                                  <Button onClick={() => removeFromWishlist(product.id)} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    {t.confirm}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* Added Date */}
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {language === 'ar' ? 'أضيف في: ' : 'Added: '}
                          {new Date(item.added_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Wishlist;

