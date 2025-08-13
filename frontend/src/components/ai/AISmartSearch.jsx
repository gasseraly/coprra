import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Mic, MicOff, Camera, X, Filter, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useDebounce } from '../../hooks/useDebounce';

const AISmartSearch = ({ 
  onSearch, 
  onResults, 
  language = 'ar', 
  placeholder,
  className = '',
  showVoiceSearch = true,
  showImageSearch = true,
  showFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [correctedQuery, setCorrectedQuery] = useState('');
  const [showCorrection, setShowCorrection] = useState(false);
  const [searchIntent, setSearchIntent] = useState('');
  const [detectedEntities, setDetectedEntities] = useState({});

  const inputRef = useRef(null);
  const searchRef = useRef(null);
  const recognitionRef = useRef(null);

  // استخدام debounce للاقتراحات
  const debouncedQuery = useDebounce(query, 300);

  // تحميل البيانات المبدئية
  useEffect(() => {
    loadRecentSearches();
    loadPopularSearches();
    initializeVoiceSearch();
  }, []);

  // جلب الاقتراحات عند تغيير النص
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // إعداد البحث الصوتي
  const initializeVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognitionRef.current.onstart = () => {
        setIsVoiceActive(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        handleSearch(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current.onerror = () => {
        setIsVoiceActive(false);
      };
    }
  };

  // تحميل البحثات الأخيرة
  const loadRecentSearches = () => {
    const saved = localStorage.getItem('coprra_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  // تحميل البحثات الشائعة
  const loadPopularSearches = async () => {
    try {
      const response = await fetch('/api/ai_search.php?action=popular_searches');
      const data = await response.json();
      if (data.success) {
        setPopularSearches(data.searches);
      }
    } catch (error) {
      console.error('Error loading popular searches:', error);
    }
  };

  // جلب الاقتراحات الذكية
  const fetchSuggestions = async (searchQuery) => {
    try {
      const response = await fetch(`/api/ai_search.php?action=suggestions&q=${encodeURIComponent(searchQuery)}&lang=${language}`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
        
        // إظهار التصحيح إذا كان متوفرًا
        if (data.query_info && data.query_info.was_corrected) {
          setCorrectedQuery(data.query_info.corrected);
          setShowCorrection(true);
        } else {
          setShowCorrection(false);
        }
        
        setSearchIntent(data.query_info?.intent || '');
        setDetectedEntities(data.query_info?.entities || {});
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // تنفيذ البحث
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const searchParams = new URLSearchParams({
        q: searchQuery,
        lang: language
      });

      const response = await fetch(`/api/ai_search.php?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        // حفظ البحث في التاريخ
        saveToSearchHistory(searchQuery);
        
        // إظهار التصحيح إذا كان متوفرًا
        if (data.query_info?.was_corrected) {
          setCorrectedQuery(data.query_info.corrected);
          setShowCorrection(true);
        }

        // تمرير النتائج للمكون الأب
        if (onResults) {
          onResults(data);
        }

        if (onSearch) {
          onSearch(searchQuery, data);
        }
      } else {
        console.error('Search error:', data.error);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // حفظ البحث في التاريخ
  const saveToSearchHistory = (searchQuery) => {
    const newSearch = {
      query: searchQuery,
      timestamp: new Date().toISOString()
    };

    const updated = [newSearch, ...recentSearches.filter(s => s.query !== searchQuery)]
      .slice(0, 10); // الاحتفاظ بآخر 10 بحثات

    setRecentSearches(updated);
    localStorage.setItem('coprra_recent_searches', JSON.stringify(updated));
  };

  // البحث الصوتي
  const handleVoiceSearch = () => {
    if (!voiceSupported) return;

    if (isVoiceActive) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // البحث بالصورة
  const handleImageSearch = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // معالجة الصورة للبحث
        processImageSearch(file);
      }
    };
    input.click();
  };

  // معالجة البحث بالصورة
  const processImageSearch = async (file) => {
    // هنا يمكن إضافة معالجة البحث بالصورة باستخدام AI
    console.log('Image search:', file);
  };

  // استخدام اقتراح
  const useSuggestion = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // استخدام البحث الأخير
  const useRecentSearch = (search) => {
    setQuery(search.query);
    handleSearch(search.query);
  };

  // استخدام التصحيح
  const useCorrection = () => {
    setQuery(correctedQuery);
    handleSearch(correctedQuery);
    setShowCorrection(false);
  };

  // إخفاء الاقتراحات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    return language === 'ar' 
      ? 'ابحث عن المنتجات، العلامات التجارية، أو الفئات...'
      : 'Search for products, brands, or categories...';
  };

  const getIntentBadgeText = (intent) => {
    const intents = {
      'ar': {
        'price_comparison': 'مقارنة أسعار',
        'product_specs': 'مواصفات',
        'brand_search': 'علامة تجارية',
        'deals_search': 'عروض',
        'reviews_search': 'مراجعات',
        'general_search': 'بحث عام'
      },
      'en': {
        'price_comparison': 'Price comparison',
        'product_specs': 'Specifications',
        'brand_search': 'Brand search',
        'deals_search': 'Deals',
        'reviews_search': 'Reviews',
        'general_search': 'General search'
      }
    };

    return intents[language]?.[intent] || intent;
  };

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      {/* شريط البحث الرئيسي */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search 
            size={20} 
            className={`text-gray-400 ${isSearching ? 'animate-pulse' : ''}`}
          />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={getPlaceholderText()}
          className={`pl-12 pr-32 h-14 text-lg border-2 rounded-xl transition-all duration-200 ${
            showSuggestions ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-300'
          }`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        />

        {/* أزرار البحث المتقدم */}
        <div className="absolute inset-y-0 right-3 flex items-center gap-1">
          {showImageSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImageSearch}
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
              title={language === 'ar' ? 'البحث بالصورة' : 'Search by image'}
            >
              <Camera size={16} />
            </Button>
          )}

          {showVoiceSearch && voiceSupported && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceSearch}
              className={`h-8 w-8 p-0 transition-colors ${
                isVoiceActive 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              title={language === 'ar' ? 'البحث الصوتي' : 'Voice search'}
            >
              {isVoiceActive ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
          )}

          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
              title={language === 'ar' ? 'الفلاتر' : 'Filters'}
            >
              <Filter size={16} />
            </Button>
          )}

          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* تصحيح الخطأ الإملائي */}
      {showCorrection && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Sparkles size={16} className="text-blue-500" />
          <span className="text-gray-600">
            {language === 'ar' ? 'هل قصدت:' : 'Did you mean:'}
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={useCorrection}
            className="h-auto p-0 text-blue-600 underline"
          >
            {correctedQuery}
          </Button>
        </div>
      )}

      {/* معلومات القصد والكيانات */}
      {(searchIntent || Object.keys(detectedEntities).length > 0) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {searchIntent && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              <Sparkles size={12} className="mr-1" />
              {getIntentBadgeText(searchIntent)}
            </Badge>
          )}
          
          {detectedEntities.brands?.map((brand, index) => (
            <Badge key={index} variant="outline" className="text-green-700 border-green-200">
              {brand}
            </Badge>
          ))}
          
          {detectedEntities.categories?.map((category, index) => (
            <Badge key={index} variant="outline" className="text-purple-700 border-purple-200">
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* نافذة الاقتراحات */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl border-0 bg-white">
          <CardContent className="p-0">
            {/* الاقتراحات الذكية */}
            {suggestions.length > 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'ar' ? 'اقتراحات ذكية' : 'Smart suggestions'}
                  </span>
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => useSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-sm transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Search size={14} className="text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* البحثات الأخيرة */}
            {recentSearches.length > 0 && (
              <>
                {suggestions.length > 0 && <Separator />}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'البحثات الأخيرة' : 'Recent searches'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => useRecentSearch(search)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          <span>{search.query}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* البحثات الشائعة */}
            {popularSearches.length > 0 && query.length < 2 && (
              <>
                {(suggestions.length > 0 || recentSearches.length > 0) && <Separator />}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {language === 'ar' ? 'البحثات الشائعة' : 'Popular searches'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {popularSearches.slice(0, 5).map((search, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(search)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 text-sm transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp size={14} className="text-orange-400" />
                          <span>{search}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISmartSearch;