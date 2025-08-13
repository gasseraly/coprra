import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, Tag, Search, Filter, Grid, List, BookOpen, TrendingUp, Eye, Heart, Share2, MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import apiService from '../services/api';

const Blog = ({ language, currency, darkMode }) => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const articlesPerPage = 9;

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      title: 'مدونة CopRRA',
      subtitle: 'آخر الأخبار والنصائح حول التسوق الذكي ومقارنة الأسعار',
      search: 'البحث في المقالات...',
      filters: 'الفلاتر',
      allCategories: 'جميع الفئات',
      allAuthors: 'جميع الكتاب',
      sortBy: 'ترتيب حسب',
      newest: 'الأحدث',
      oldest: 'الأقدم',
      mostViewed: 'الأكثر مشاهدة',
      mostLiked: 'الأكثر إعجاباً',
      alphabetical: 'أبجدي',
      readMore: 'اقرأ المزيد',
      by: 'بواسطة',
      minRead: 'دقيقة قراءة',
      views: 'مشاهدة',
      likes: 'إعجاب',
      comments: 'تعليق',
      share: 'مشاركة',
      noArticles: 'لا توجد مقالات متاحة حالياً',
      noResults: 'لا توجد مقالات تطابق البحث',
      categories: {
        all: 'الكل',
        tips: 'نصائح التسوق',
        reviews: 'مراجعات المنتجات',
        news: 'أخبار التقنية',
        guides: 'أدلة الشراء',
        comparisons: 'مقارنات',
        deals: 'عروض وخصومات'
      },
      tabs: {
        all: 'جميع المقالات',
        featured: 'مقالات مميزة',
        trending: 'الأكثر رواجاً',
        recent: 'الأحدث'
      },
      featuredArticle: 'مقال مميز',
      latestArticles: 'أحدث المقالات',
      trendingArticles: 'المقالات الرائجة',
      popularAuthors: 'الكتاب المشهورون',
      relatedArticles: 'مقالات ذات صلة',
      loading: 'جاري تحميل المقالات...',
      loadMore: 'تحميل المزيد',
      error: 'حدث خطأ في تحميل المقالات',
      showingResults: 'عرض {start}-{end} من {total} مقال',
      readingTime: 'وقت القراءة',
      publishedOn: 'نُشر في',
      lastUpdated: 'آخر تحديث',
      tags: 'العلامات',
      category: 'الفئة',
      author: 'الكاتب',
      clearFilters: 'مسح الفلاتر'
    },
    en: {
      title: 'CopRRA Blog',
      subtitle: 'Latest news and tips about smart shopping and price comparison',
      search: 'Search articles...',
      filters: 'Filters',
      allCategories: 'All Categories',
      allAuthors: 'All Authors',
      sortBy: 'Sort By',
      newest: 'Newest',
      oldest: 'Oldest',
      mostViewed: 'Most Viewed',
      mostLiked: 'Most Liked',
      alphabetical: 'Alphabetical',
      readMore: 'Read More',
      by: 'By',
      minRead: 'min read',
      views: 'views',
      likes: 'likes',
      comments: 'comments',
      share: 'Share',
      noArticles: 'No articles available at the moment',
      noResults: 'No articles match your search',
      categories: {
        all: 'All',
        tips: 'Shopping Tips',
        reviews: 'Product Reviews',
        news: 'Tech News',
        guides: 'Buying Guides',
        comparisons: 'Comparisons',
        deals: 'Deals & Discounts'
      },
      tabs: {
        all: 'All Articles',
        featured: 'Featured',
        trending: 'Trending',
        recent: 'Recent'
      },
      featuredArticle: 'Featured Article',
      latestArticles: 'Latest Articles',
      trendingArticles: 'Trending Articles',
      popularAuthors: 'Popular Authors',
      relatedArticles: 'Related Articles',
      loading: 'Loading articles...',
      loadMore: 'Load More',
      error: 'Error loading articles',
      showingResults: 'Showing {start}-{end} of {total} articles',
      readingTime: 'Reading Time',
      publishedOn: 'Published on',
      lastUpdated: 'Last updated',
      tags: 'Tags',
      category: 'Category',
      author: 'Author',
      clearFilters: 'Clear Filters'
    }
  };

  const t = texts[language];

  // بيانات احتياطية محسنة
  const fallbackArticles = [
    {
      id: 1,
      slug: 'best-smartphones-2024',
      title_ar: 'أفضل الهواتف الذكية لعام 2024',
      title_en: 'Best Smartphones of 2024',
      excerpt_ar: 'دليل شامل لأفضل الهواتف الذكية المتاحة في السوق لعام 2024 مع مقارنة الأسعار والمواصفات',
      excerpt_en: 'A comprehensive guide to the best smartphones available in the market for 2024 with price and specification comparisons',
      content_ar: 'مع تقدمنا خلال عام 2024، يستمر سوق الهواتف الذكية في التطور بوتيرة سريعة...',
      content_en: 'As we move through 2024, the smartphone market continues to evolve at a rapid pace...',
      image_url: '/api/placeholder/600/400',
      created_at: '2024-08-10T10:00:00Z',
      updated_at: '2024-08-10T10:00:00Z',
      category: 'reviews',
      tags: 'smartphones,reviews,2024,technology',
      author: 'أحمد محمد',
      is_published: true,
      views: 1250,
      likes: 89,
      comments: 23,
      reading_time: 8,
      is_featured: true
    },
    {
      id: 2,
      slug: 'tv-buying-guide-2024',
      title_ar: 'دليل شراء التلفزيون 2024',
      title_en: 'TV Buying Guide 2024',
      excerpt_ar: 'كل ما تحتاج معرفته قبل شراء تلفزيون جديد في عام 2024، من التقنيات الحديثة إلى أفضل الأسعار',
      excerpt_en: 'Everything you need to know before buying a new TV in 2024, from modern technologies to the best prices',
      content_ar: 'شراء تلفزيون جديد يمكن أن يكون قراراً صعباً مع توفر العديد من الخيارات...',
      content_en: 'Buying a new TV can be a difficult decision with so many options available...',
      image_url: '/api/placeholder/600/400',
      created_at: '2024-08-09T14:30:00Z',
      updated_at: '2024-08-09T14:30:00Z',
      category: 'guides',
      tags: 'tv,buying guide,electronics,home entertainment',
      author: 'سارة أحمد',
      is_published: true,
      views: 980,
      likes: 67,
      comments: 15,
      reading_time: 12,
      is_featured: false
    },
    {
      id: 3,
      slug: 'smart-shopping-tips',
      title_ar: 'نصائح التسوق الذكي',
      title_en: 'Smart Shopping Tips',
      excerpt_ar: 'تعلم كيفية التسوق بذكاء وتوفير المال مع هذه النصائح المجربة والفعالة',
      excerpt_en: 'Learn how to shop smart and save money with these proven and effective tips',
      content_ar: 'التسوق الذكي ليس مجرد البحث عن أقل الأسعار، بل يتطلب استراتيجية شاملة...',
      content_en: 'Smart shopping is not just about finding the lowest prices, but requires a comprehensive strategy...',
      image_url: '/api/placeholder/600/400',
      created_at: '2024-08-08T09:15:00Z',
      updated_at: '2024-08-08T09:15:00Z',
      category: 'tips',
      tags: 'shopping,tips,money saving,smart shopping',
      author: 'محمد علي',
      is_published: true,
      views: 1450,
      likes: 112,
      comments: 34,
      reading_time: 6,
      is_featured: true
    },
    {
      id: 4,
      slug: 'laptop-comparison-2024',
      title_ar: 'مقارنة أفضل أجهزة الكمبيوتر المحمولة 2024',
      title_en: 'Best Laptop Comparison 2024',
      excerpt_ar: 'مقارنة شاملة لأفضل أجهزة الكمبيوتر المحمولة المتاحة في السوق مع التركيز على الأداء والسعر',
      excerpt_en: 'Comprehensive comparison of the best laptops available in the market focusing on performance and price',
      content_ar: 'اختيار الكمبيوتر المحمول المناسب يعتمد على احتياجاتك الشخصية وميزانيتك...',
      content_en: 'Choosing the right laptop depends on your personal needs and budget...',
      image_url: '/api/placeholder/600/400',
      created_at: '2024-08-07T16:45:00Z',
      updated_at: '2024-08-07T16:45:00Z',
      category: 'comparisons',
      tags: 'laptops,comparison,technology,productivity',
      author: 'فاطمة حسن',
      is_published: true,
      views: 890,
      likes: 54,
      comments: 18,
      reading_time: 10,
      is_featured: false
    },
    {
      id: 5,
      slug: 'tech-deals-august-2024',
      title_ar: 'أفضل عروض التقنية لشهر أغسطس 2024',
      title_en: 'Best Tech Deals August 2024',
      excerpt_ar: 'اكتشف أفضل العروض والخصومات على المنتجات التقنية المتاحة هذا الشهر',
      excerpt_en: 'Discover the best deals and discounts on tech products available this month',
      content_ar: 'شهر أغسطس يحمل العديد من العروض المميزة على المنتجات التقنية...',
      content_en: 'August brings many great deals on tech products...',
      image_url: '/api/placeholder/600/400',
      created_at: '2024-08-06T11:20:00Z',
      updated_at: '2024-08-06T11:20:00Z',
      category: 'deals',
      tags: 'deals,discounts,technology,savings',
      author: 'عمر خالد',
      is_published: true,
      views: 1120,
      likes: 78,
      comments: 29,
      reading_time: 5,
      is_featured: false
    },
    {
      id: 6,
      slug: 'gaming-setup-guide',
      title_ar: 'دليل إعداد منطقة الألعاب المثالية',
      title_en: 'Perfect Gaming Setup Guide',
      excerpt_ar: 'كيفية إنشاء منطقة ألعاب مثالية بميزانية محدودة مع أفضل النصائح والتوصيات',
      excerpt_en: 'How to create the perfect gaming area on a budget with the best tips and recommendations',
      content_ar: 'إنشاء منطقة ألعاب مثالية لا يتطلب بالضرورة ميزانية ضخمة...',
      content_en: 'Creating the perfect gaming area does not necessarily require a huge budget...',
      image_url: '/api/placeholder/600/400',
      created_at: '2024-08-05T13:10:00Z',
      updated_at: '2024-08-05T13:10:00Z',
      category: 'guides',
      tags: 'gaming,setup,guide,budget',
      author: 'يوسف أحمد',
      is_published: true,
      views: 756,
      likes: 45,
      comments: 12,
      reading_time: 9,
      is_featured: true
    }
  ];

  // جلب البيانات من API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // جلب المقالات
        const articlesData = await apiService.getArticles({ 
          limit: articlesPerPage * currentPage 
        });
        
        if (articlesData && articlesData.length > 0) {
          setArticles(articlesData);
          setFeaturedArticles(articlesData.filter(article => article.is_featured));
        } else {
          // استخدام البيانات الاحتياطية
          setArticles(fallbackArticles);
          setFeaturedArticles(fallbackArticles.filter(article => article.is_featured));
        }
        
        // استخراج الفئات والكتاب من المقالات
        const uniqueCategories = [...new Set(fallbackArticles.map(article => article.category))];
        const uniqueAuthors = [...new Set(fallbackArticles.map(article => article.author))];
        
        setCategories(uniqueCategories);
        setAuthors(uniqueAuthors);
        
      } catch (error) {
        console.error('Error loading articles:', error);
        // استخدام البيانات الاحتياطية في حالة الخطأ
        setArticles(fallbackArticles);
        setFeaturedArticles(fallbackArticles.filter(article => article.is_featured));
        
        const uniqueCategories = [...new Set(fallbackArticles.map(article => article.category))];
        const uniqueAuthors = [...new Set(fallbackArticles.map(article => article.author))];
        
        setCategories(uniqueCategories);
        setAuthors(uniqueAuthors);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [currentPage]);

  // تطبيق الفلاتر والبحث
  useEffect(() => {
    let filtered = [...articles];

    // فلترة حسب التبويب النشط
    if (activeTab === 'featured') {
      filtered = filtered.filter(article => article.is_featured);
    } else if (activeTab === 'trending') {
      filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
    } else if (activeTab === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
    }

    // البحث النصي
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(article => {
        const title = language === 'ar' ? article.title_ar : article.title_en;
        const excerpt = language === 'ar' ? article.excerpt_ar : article.excerpt_en;
        const content = language === 'ar' ? article.content_ar : article.content_en;
        const tags = article.tags || '';
        const author = article.author || '';
        
        return title.toLowerCase().includes(query) ||
               excerpt.toLowerCase().includes(query) ||
               content.toLowerCase().includes(query) ||
               tags.toLowerCase().includes(query) ||
               author.toLowerCase().includes(query);
      });
    }

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // فلترة حسب الكاتب
    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(article => article.author === selectedAuthor);
    }

    // الترتيب
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'mostViewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'mostLiked':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => {
          const titleA = language === 'ar' ? a.title_ar : a.title_en;
          const titleB = language === 'ar' ? b.title_ar : b.title_en;
          return titleA.localeCompare(titleB);
        });
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredArticles(filtered);
    setTotalArticles(filtered.length);
  }, [articles, searchQuery, selectedCategory, selectedAuthor, sortBy, activeTab, language]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedAuthor('all');
    setSortBy('newest');
    setActiveTab('all');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content, readingTime) => {
    if (readingTime) return readingTime;
    const wordsPerMinute = language === 'ar' ? 200 : 250;
    const wordCount = content ? content.split(' ').length : 500;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // مكون بطاقة المقال
  const ArticleCard = ({ article, featured = false }) => {
    const title = language === 'ar' ? article.title_ar : article.title_en;
    const excerpt = language === 'ar' ? article.excerpt_ar : article.excerpt_en;
    const content = language === 'ar' ? article.content_ar : article.content_en;
    const readingTime = getReadingTime(content, article.reading_time);

    return (
      <Card className={`group hover:shadow-lg transition-all duration-300 dark:bg-gray-800 ${
        featured ? 'md:col-span-2 lg:col-span-3' : ''
      } ${viewMode === 'list' && !featured ? 'flex flex-row' : ''}`}>
        <div className={`${viewMode === 'list' && !featured ? 'w-64 flex-shrink-0' : ''}`}>
          <div className={`${featured ? 'aspect-[16/9]' : 'aspect-[4/3]'} bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden relative`}>
            <img
              src={article.image_url || '/api/placeholder/600/400'}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {article.is_featured && (
              <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                {t.featuredArticle}
              </Badge>
            )}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/50 text-white">
                {t.categories[article.category] || article.category}
              </Badge>
            </div>
          </div>
        </div>
        
        <CardContent className={`p-6 flex-1 ${viewMode === 'list' && !featured ? 'flex flex-col justify-between' : ''}`}>
          <div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{readingTime} {t.minRead}</span>
              </div>
            </div>
            
            <h3 className={`font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
              featured ? 'text-2xl md:text-3xl' : 'text-lg'
            }`}>
              {title}
            </h3>
            
            <p className={`text-gray-600 dark:text-gray-400 mb-4 ${
              featured ? 'text-lg line-clamp-3' : 'text-sm line-clamp-2'
            }`}>
              {excerpt}
            </p>

            {article.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.split(',').slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{article.views || 0} {t.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{article.likes || 0} {t.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{article.comments || 0} {t.comments}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button size="sm" asChild>
                <Link to={`/blog/${article.slug}`}>
                  {t.readMore}
                  {isRTL ? <ChevronLeft className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400 w-5 h-5`} />
                <Input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={handleSearch}
                  className={`${isRTL ? 'pr-12' : 'pl-12'} h-12 dark:bg-gray-700 dark:text-white`}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder={t.allCategories} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allCategories}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t.categories[category] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-48 dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder={t.allAuthors} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allAuthors}</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder={t.sortBy} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t.newest}</SelectItem>
                  <SelectItem value="oldest">{t.oldest}</SelectItem>
                  <SelectItem value="mostViewed">{t.mostViewed}</SelectItem>
                  <SelectItem value="mostLiked">{t.mostLiked}</SelectItem>
                  <SelectItem value="alphabetical">{t.alphabetical}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg dark:border-gray-600">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline" onClick={clearFilters}>
                {t.clearFilters}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="all">{t.tabs.all}</TabsTrigger>
            <TabsTrigger value="featured">{t.tabs.featured}</TabsTrigger>
            <TabsTrigger value="trending">{t.tabs.trending}</TabsTrigger>
            <TabsTrigger value="recent">{t.tabs.recent}</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredArticles.length > 0 ? (
                  t.showingResults
                    .replace('{start}', '1')
                    .replace('{end}', Math.min(articlesPerPage, filteredArticles.length).toString())
                    .replace('{total}', totalArticles.toString())
                ) : (
                  `0 ${t.results || 'results'}`
                )}
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchQuery ? t.noResults : t.noArticles}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t.subtitle}
                </p>
                {searchQuery && (
                  <Button onClick={clearFilters} variant="outline">
                    {t.clearFilters}
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredArticles.slice(0, currentPage * articlesPerPage).map((article, index) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    featured={index === 0 && article.is_featured && viewMode === 'grid'}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.slice(0, 9).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.slice(0, 9).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Load More Button */}
        {filteredArticles.length > currentPage * articlesPerPage && (
          <div className="text-center mt-8">
            <Button 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              variant="outline" 
              size="lg"
            >
              {t.loadMore}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;

