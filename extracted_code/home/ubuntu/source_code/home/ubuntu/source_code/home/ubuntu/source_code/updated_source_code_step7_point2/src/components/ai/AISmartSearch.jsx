import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Sparkles, TrendingUp, Clock, Filter, ArrowRight, Loader2, Zap, Target, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';

const AISmartSearch = ({ 
  currentLanguage = 'ar', 
  onSearch, 
  placeholder = '', 
  className = '',
  showSuggestions = true,
  showTrending = true,
  showHistory = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    brand: '',
    rating: ''
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // الترجمات
  const translations = {
    ar: {
      placeholder: 'ابحث عن المنتجات، العروض، والمراجعات...',
      search: 'بحث',
      clear: 'مسح',
      suggestions: 'اقتراحات ذكية',
      trending: 'الأكثر بحثاً',
      recent: 'البحث الأخير',
      filters: 'المرشحات',
      category: 'الفئة',
      priceRange: 'نطاق السعر',
      brand: 'العلامة التجارية',
      rating: 'التقييم',
      aiInsights: 'رؤى الذكاء الاصطناعي',
      noResults: 'لا توجد نتائج',
      tryAgain: 'حاول مرة أخرى',
      smartSuggestions: 'اقتراحات ذكية',
      popularCategories: 'الفئات الشائعة',
      priceFilters: 'مرشحات السعر',
      brandFilters: 'مرشحات العلامات التجارية',
      ratingFilters: 'مرشحات التقييم',
      applyFilters: 'تطبيق المرشحات',
      clearFilters: 'مسح المرشحات',
      searchTips: 'نصائح البحث',
      useQuotes: 'استخدم علامات الاقتباس للبحث الدقيق',
      useMinus: 'استخدم علامة الطرح لاستبعاد الكلمات',
      useOr: 'استخدم "أو" للبحث عن بدائل'
    },
    en: {
      placeholder: 'Search for products, deals, and reviews...',
      search: 'Search',
      clear: 'Clear',
      suggestions: 'Smart Suggestions',
      trending: 'Trending',
      recent: 'Recent',
      filters: 'Filters',
      category: 'Category',
      priceRange: 'Price Range',
      brand: 'Brand',
      rating: 'Rating',
      aiInsights: 'AI Insights',
      noResults: 'No results found',
      tryAgain: 'Try again',
      smartSuggestions: 'Smart Suggestions',
      popularCategories: 'Popular Categories',
      priceFilters: 'Price Filters',
      brandFilters: 'Brand Filters',
      ratingFilters: 'Rating Filters',
      applyFilters: 'Apply Filters',
      clearFilters: 'Clear Filters',
      searchTips: 'Search Tips',
      useQuotes: 'Use quotes for exact search',
      useMinus: 'Use minus to exclude words',
      useOr: 'Use "OR" for alternatives'
    }
  };

  const t = translations[currentLanguage] || translations.ar;

  // تحميل البيانات الأولية
  useEffect(() => {
    loadInitialData();
    loadSearchHistory();
  }, []);

  // تحميل البيانات الأولية
  const loadInitialData = async () => {
    try {
      // تحميل عمليات البحث الشائعة
      const trendingResponse = await fetch('/api/ai_search.php?action=trending');
      if (trendingResponse.ok) {
        const trendingData = await response.json();
        setTrendingSearches(trendingData.trending || getDefaultTrending());
      } else {
        setTrendingSearches(getDefaultTrending());
      }

      // تحميل الفئات الشائعة
      const categoriesResponse = await fetch('/api/ai_search.php?action=categories');
      if (categoriesResponse.ok) {
        const categoriesData = await response.json();
        // تحديث الفئات
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setTrendingSearches(getDefaultTrending());
    }
  };

  // تحميل سجل البحث
  const loadSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  // حفظ سجل البحث
  const saveSearchHistory = (query) => {
    if (!query.trim()) return;
    
    const newHistory = [
      query,
      ...searchHistory.filter(item => item !== query)
    ].slice(0, 10); // حفظ آخر 10 عمليات بحث
    
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // الحصول على عمليات البحث الشائعة الافتراضية
  const getDefaultTrending = () => [
    'هاتف ذكي',
    'لابتوب',
    'سماعات',
    'ساعة ذكية',
    'كاميرا',
    'ألعاب',
    'كتب',
    'ملابس'
  ];

  // البحث الذكي
  const handleSearch = useCallback(async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setShowDropdown(false);
    saveSearchHistory(query);

    try {
      // البحث الذكي مع الذكاء الاصطناعي
      const response = await fetch('/api/ai_search.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          language: currentLanguage,
          filters: filters,
          context: {
            userHistory: searchHistory,
            trending: trendingSearches
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // تحديث الرؤى الذكية
        if (data.aiInsights) {
          setAiInsights(data.aiInsights);
        }

        // استدعاء دالة البحث
        if (onSearch) {
          onSearch(data.results || [], query, data);
        }
      } else {
        // البحث العادي في حالة فشل API
        if (onSearch) {
          onSearch([], query, {});
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      // البحث العادي في حالة الخطأ
      if (onSearch) {
        onSearch([], query, {});
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, currentLanguage, searchHistory, trendingSearches, onSearch]);

  // توليد الاقتراحات الذكية
  const generateSuggestions = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch('/api/ai_search.php?action=suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          language: currentLanguage,
          limit: 8
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || generateDefaultSuggestions(query));
      } else {
        setSuggestions(generateDefaultSuggestions(query));
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions(generateDefaultSuggestions(query));
    }
  }, [currentLanguage]);

  // توليد اقتراحات افتراضية
  const generateDefaultSuggestions = (query) => {
    const baseSuggestions = [
      `${query} رخيص`,
      `${query} عالي الجودة`,
      `${query} أحدث موديل`,
      `${query} أفضل سعر`,
      `${query} مراجعات`,
      `${query} مقارنة`,
      `${query} عروض`,
      `${query} توصيات`
    ];

    return baseSuggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
  };

  // معالجة تغيير البحث
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      setShowDropdown(true);
      generateSuggestions(value);
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }
  };

  // معالجة مفتاح Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // معالجة النقر خارج القائمة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تطبيق المرشحات
  const applyFilters = () => {
    handleSearch();
  };

  // مسح المرشحات
  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      brand: '',
      rating: ''
    });
  };

  // معالجة الاقتراح
  const handleSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowDropdown(false);
    handleSearch(suggestion);
  };

  // معالجة البحث السريع
  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <div className={`relative ${className}`}>
      <TooltipProvider>
        <div className="relative">
          {/* شريط البحث الرئيسي */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder || t.placeholder}
              className="pl-10 pr-12 py-3 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200"
              disabled={isLoading}
            />
            
            {/* زر البحث */}
            <Button
              onClick={() => handleSearch()}
              disabled={!searchQuery.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>

            {/* زر المسح */}
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                className="absolute right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* القائمة المنسدلة */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
            >
              <ScrollArea className="h-full">
                {/* الاقتراحات الذكية */}
                {suggestions.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-800">{t.smartSuggestions}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestion(suggestion)}
                          className="justify-start text-left text-sm h-auto py-2 px-3"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* عمليات البحث الشائعة */}
                {showTrending && trendingSearches.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <h4 className="font-semibold text-gray-800">{t.trending}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((trend, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => handleQuickSearch(trend)}
                        >
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* سجل البحث */}
                {showHistory && searchHistory.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <h4 className="font-semibold text-gray-800">{t.recent}</h4>
                    </div>
                    <div className="space-y-2">
                      {searchHistory.slice(0, 5).map((history, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuickSearch(history)}
                          className="w-full justify-start text-left text-sm h-auto py-2 px-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        >
                          <Clock className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          {history}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* الرؤى الذكية */}
                {aiInsights && (
                  <div className="p-4 bg-blue-50 border-t border-blue-100">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">{t.aiInsights}</h4>
                    </div>
                    <p className="text-sm text-blue-700">{aiInsights.message}</p>
                    {aiInsights.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {aiInsights.suggestions.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-blue-200 border-blue-300 text-blue-700"
                            onClick={() => handleQuickSearch(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* المرشحات */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Filter className="w-4 h-4" />
            <span>{t.filters}</span>
          </Button>

          {/* مرشحات سريعة */}
          <div className="flex flex-wrap gap-2">
            {['هاتف ذكي', 'لابتوب', 'سماعات', 'ساعة ذكية'].map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => handleQuickSearch(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* نصائح البحث */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <h5 className="font-medium text-gray-700">{t.searchTips}</h5>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p>{t.useQuotes}</p>
            <p>{t.useMinus}</p>
            <p>{t.useOr}</p>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default AISmartSearch;