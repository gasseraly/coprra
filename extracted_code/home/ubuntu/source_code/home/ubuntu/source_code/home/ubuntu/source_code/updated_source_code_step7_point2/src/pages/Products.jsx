import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, Filter, Star, Grid, List, ChevronDown, SlidersHorizontal, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import apiService from '../services/api';

// مكون ProductCard محسن مع memo
const ProductCard = memo(({ product, texts, isRTL, addToCompare, viewMode }) => {
  const productName = isRTL ? product.name_ar : product.name_en;
  const productDescription = isRTL ? product.description_ar : product.description_en;

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''}`}>
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
        <img
          src={product.image_url || '/api/placeholder/300/300'}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.discount_percentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{product.discount_percentage}%
          </Badge>
        )}
      </div>
      
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
            {productName}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {productDescription}
          </p>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.reviews_count || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-600">
                  ${product.price}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.original_price}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToCompare?.(product)}
                className="text-xs"
              >
                {texts.addToCompare}
              </Button>
              <Button
                size="sm"
                onClick={() => window.location.href = `/product/${product.id}`}
                className="text-xs"
              >
                {texts.viewDetails}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

const Products = ({ addToCompare, currentLanguage, currentCurrency, isDarkMode }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const productsPerPage = 12;

  const isRTL = currentLanguage === 'ar';

  // النصوص محسنة مع useMemo
  const texts = useMemo(() => ({
    ar: {
      title: 'جميع المنتجات',
      subtitle: 'اكتشف آلاف المنتجات بأفضل الأسعار',
      search: 'البحث في المنتجات...',
      filters: 'الفلاتر',
      advancedFilters: 'فلاتر متقدمة',
      category: 'الفئة',
      categories: 'الفئات',
      brand: 'العلامة التجارية',
      brands: 'العلامات التجارية',
      priceRange: 'نطاق السعر',
      rating: 'التقييم',
      availability: 'التوفر',
      sortBy: 'ترتيب حسب',
      allCategories: 'جميع الفئات',
      allBrands: 'جميع العلامات التجارية',
      featured: 'مميز',
      priceLowToHigh: 'السعر: من الأقل إلى الأعلى',
      priceHighToLow: 'السعر: من الأعلى إلى الأقل',
      ratingHighToLow: 'التقييم: من الأعلى إلى الأقل',
      newest: 'الأحدث',
      oldest: 'الأقدم',
      nameAZ: 'الاسم: أ - ي',
      nameZA: 'الاسم: ي - أ',
      addToCompare: 'أضف للمقارنة',
      viewDetails: 'عرض التفاصيل',
      noProducts: 'لا توجد منتجات تطابق البحث',
      showingResults: 'عرض {start}-{end} من {total} منتج',
      clearFilters: 'مسح الفلاتر',
      clearAll: 'مسح الكل',
      loading: 'جاري التحميل...',
      loadMore: 'تحميل المزيد',
      error: 'حدث خطأ في تحميل المنتجات',
      applyFilters: 'تطبيق الفلاتر',
      activeFilters: 'فلاتر نشطة',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      all: 'الكل',
      starsAndUp: 'نجوم وأكثر',
      from: 'من',
      to: 'إلى',
      currency: 'العملة',
      results: 'نتيجة',
      result: 'نتيجة',
      showFilters: 'إظهار الفلاتر',
      hideFilters: 'إخفاء الفلاتر'
    },
    en: {
      title: 'All Products',
      subtitle: 'Discover thousands of products at the best prices',
      search: 'Search products...',
      filters: 'Filters',
      advancedFilters: 'Advanced Filters',
      category: 'Category',
      categories: 'Categories',
      brand: 'Brand',
      brands: 'Brands',
      priceRange: 'Price Range',
      rating: 'Rating',
      availability: 'Availability',
      sortBy: 'Sort By',
      allCategories: 'All Categories',
      allBrands: 'All Brands',
      featured: 'Featured',
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      ratingHighToLow: 'Rating: High to Low',
      newest: 'Newest',
      oldest: 'Oldest',
      nameAZ: 'Name: A - Z',
      nameZA: 'Name: Z - A',
      addToCompare: 'Add to Compare',
      viewDetails: 'View Details',
      noProducts: 'No products match your search',
      showingResults: 'Showing {start}-{end} of {total} products',
      clearFilters: 'Clear Filters',
      clearAll: 'Clear All',
      loading: 'Loading...',
      loadMore: 'Load More',
      error: 'Error loading products',
      applyFilters: 'Apply Filters',
      activeFilters: 'Active Filters',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      all: 'All',
      starsAndUp: 'stars & up',
      from: 'From',
      to: 'To',
      currency: 'Currency',
      results: 'results',
      result: 'result',
      showFilters: 'Show Filters',
      hideFilters: 'Hide Filters'
    }
  }), [])[currentLanguage];

  // تحميل البيانات الأساسية مع تحسينات
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // تحميل البيانات بشكل متوازي
        const [productsData, categoriesData, brandsData] = await Promise.all([
          apiService.getProducts({ page: 1, limit: productsPerPage }),
          apiService.getCategories(),
          apiService.getBrands()
        ]);

        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
        setBrands(brandsData);
        setTotalProducts(productsData.length);

        // حساب أقصى سعر
        if (productsData.length > 0) {
          const maxProductPrice = Math.max(...productsData.map(p => p.price || 0));
          setMaxPrice(maxProductPrice);
          setPriceRange([0, maxProductPrice]);
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // البحث والفلترة محسنة مع useCallback
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    if (query.trim().length === 0) {
      setFilteredProducts(products);
      return;
    }

    try {
      const searchResults = await apiService.searchProducts(query, {
        categories: selectedCategories,
        brands: selectedBrands,
        min_price: priceRange[0],
        max_price: priceRange[1],
        min_rating: ratingFilter,
        availability: availabilityFilter
      });
      
      setFilteredProducts(searchResults);
      setTotalProducts(searchResults.length);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, [products, selectedCategories, selectedBrands, priceRange, ratingFilter, availabilityFilter]);

  // تطبيق الفلاتر محسن
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // فلترة حسب البحث
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        (product.name_en?.toLowerCase().includes(searchTerm)) ||
        (product.name_ar?.toLowerCase().includes(searchTerm)) ||
        (product.description_en?.toLowerCase().includes(searchTerm)) ||
        (product.description_ar?.toLowerCase().includes(searchTerm))
      );
    }

    // فلترة حسب الفئات
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category_id?.toString())
      );
    }

    // فلترة حسب العلامات التجارية
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        selectedBrands.includes(product.brand_id?.toString())
      );
    }

    // فلترة حسب السعر
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // فلترة حسب التقييم
    if (ratingFilter > 0) {
      filtered = filtered.filter(product => 
        (product.rating || 0) >= ratingFilter
      );
    }

    // فلترة حسب التوفر
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(product => 
        availabilityFilter === 'inStock' ? product.in_stock : !product.in_stock
      );
    }

    // ترتيب النتائج
    filtered = sortProducts(filtered, sortBy);

    setFilteredProducts(filtered);
    setTotalProducts(filtered.length);
    setCurrentPage(1);

    // حساب عدد الفلاتر النشطة
    let activeCount = 0;
    if (selectedCategories.length > 0) activeCount++;
    if (selectedBrands.length > 0) activeCount++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) activeCount++;
    if (ratingFilter > 0) activeCount++;
    if (availabilityFilter !== 'all') activeCount++;
    
    setActiveFiltersCount(activeCount);
  }, [products, searchQuery, selectedCategories, selectedBrands, priceRange, ratingFilter, availabilityFilter, sortBy, maxPrice]);

  // ترتيب المنتجات
  const sortProducts = useCallback((productsToSort, sortOption) => {
    const sorted = [...productsToSort];
    
    switch (sortOption) {
      case 'priceLowToHigh':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'priceHighToLow':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'ratingHighToLow':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      case 'nameAZ':
        return sorted.sort((a, b) => {
          const nameA = isRTL ? a.name_ar : a.name_en;
          const nameB = isRTL ? b.name_ar : b.name_en;
          return nameA.localeCompare(nameB);
        });
      case 'nameZA':
        return sorted.sort((a, b) => {
          const nameA = isRTL ? a.name_ar : a.name_en;
          const nameB = isRTL ? b.name_ar : b.name_en;
          return nameB.localeCompare(nameA);
        });
      default:
        return sorted;
    }
  }, [isRTL]);

  // تطبيق الفلاتر عند تغيير أي منها
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // مسح جميع الفلاتر
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, maxPrice]);
    setRatingFilter(0);
    setAvailabilityFilter('all');
    setSortBy('featured');
    setCurrentPage(1);
  }, [maxPrice]);

  // المنتجات المعروضة في الصفحة الحالية
  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, productsPerPage]);

  // معلومات التصفح
  const paginationInfo = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, totalProducts);
    return { start, end, total: totalProducts };
  }, [currentPage, productsPerPage, totalProducts]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {texts.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {texts.subtitle}
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={texts.search}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder={texts.sortBy} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{texts.featured}</SelectItem>
                <SelectItem value="priceLowToHigh">{texts.priceLowToHigh}</SelectItem>
                <SelectItem value="priceHighToLow">{texts.priceHighToLow}</SelectItem>
                <SelectItem value="ratingHighToLow">{texts.ratingHighToLow}</SelectItem>
                <SelectItem value="newest">{texts.newest}</SelectItem>
                <SelectItem value="nameAZ">{texts.nameAZ}</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Filters */}
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  {texts.filters}
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-80">
                <SheetHeader>
                  <SheetTitle>{texts.filters}</SheetTitle>
                  <SheetDescription>
                    {texts.advancedFilters}
                  </SheetDescription>
                </SheetHeader>
                {/* Mobile Filters Content - يمكن إضافة المحتوى هنا */}
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {texts.activeFilters}:
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                {texts.clearAll}
              </Button>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {texts.showingResults
              .replace('{start}', paginationInfo.start)
              .replace('{end}', paginationInfo.end)
              .replace('{total}', paginationInfo.total)}
          </p>
        </div>

        {/* Products Grid */}
        {displayedProducts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                texts={texts}
                isRTL={isRTL}
                addToCompare={addToCompare}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {texts.noProducts}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalProducts > productsPerPage && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(totalProducts / productsPerPage) }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

