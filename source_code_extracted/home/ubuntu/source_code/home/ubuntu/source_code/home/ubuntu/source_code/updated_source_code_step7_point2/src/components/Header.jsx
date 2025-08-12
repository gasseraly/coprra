import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Moon, Sun, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = ({ 
  compareCount, 
  language, 
  currency,
  toggleLanguage, 
  changeCurrency,
  darkMode, 
  toggleDarkMode,
  supportedLanguages = [],
  supportedCurrencies = []
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      home: 'الرئيسية',
      products: 'المنتجات',
      articles: 'المقالات',
      resources: 'الموارد',
      compare: 'المقارنة',
      login: 'تسجيل الدخول',
      search: 'البحث عن المنتجات...',
      language: 'EN',
      videos: 'الفيديوهات التعليمية',
      catalog: 'الكتالوج',
      reports: 'التقارير',
      analytics: 'التحليلات',
      notifications: 'الإشعارات'
    },
    en: {
      home: 'Home',
      products: 'Products',
      articles: 'Articles',
      resources: 'Resources',
      compare: 'Compare',
      login: 'Login',
      search: 'Search products...',
      language: 'AR',
      videos: 'Educational Videos',
      catalog: 'Catalog',
      reports: 'Reports',
      analytics: 'Analytics',
      notifications: 'Notifications'
    }
  };

  const t = texts[language];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md sticky top-0 z-50 transition-colors duration-200`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CopRRA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}
            >
              {t.home}
            </Link>
            <Link 
              to="/products" 
              className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}
            >
              {t.products}
            </Link>
            <Link 
              to="/blog" 
              className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium`}
            >
              {t.articles}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium flex items-center space-x-1`}>
                  <span>{t.resources}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem>
                  <Link to="/videos" className="w-full">{t.videos}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/catalog" className="w-full">{t.catalog}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/reports" className="w-full">{t.reports}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/analytics" className="w-full">{t.analytics}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link to="/notifications" className="w-full">{t.notifications}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link 
              to="/compare" 
              className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium relative`}
            >
              {t.compare}
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} ${darkMode ? 'text-gray-400' : 'text-gray-400'} w-4 h-4`} />
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="hidden md:flex"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            
            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{currency}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {supportedCurrencies.map((curr) => (
                  <DropdownMenuItem 
                    key={curr.code}
                    onClick={() => changeCurrency(curr.code)}
                    className={`flex items-center space-x-2 ${currency === curr.code ? 'bg-blue-50' : ''}`}
                  >
                    <span>{curr.flag}</span>
                    <span>{curr.symbol}</span>
                    <span>{curr.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{supportedLanguages.find(lang => lang.code === language)?.flag || '🌐'}</span>
                  <span>{supportedLanguages.find(lang => lang.code === language)?.code.toUpperCase() || language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={`flex items-center space-x-2 ${language === lang.code ? 'bg-blue-50' : ''}`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{t.login}</span>
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'} rounded-lg`}
                />
                <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400 w-4 h-4`} />
              </form>

              {/* Mobile Navigation Links */}
              <Link 
                to="/" 
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.home}
              </Link>
              <Link 
                to="/products" 
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.products}
              </Link>
              <Link 
                to="/blog" 
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.articles}
              </Link>
              
              {/* Mobile Resources Section */}
              <div className="py-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>{t.resources}</span>
                <div className="ml-4 mt-2 space-y-2">
                  <Link 
                    to="/videos" 
                    className={`block ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm py-1`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.videos}
                  </Link>
                  <Link 
                    to="/catalog" 
                    className={`block ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm py-1`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.catalog}
                  </Link>
                  <Link 
                    to="/reports" 
                    className={`block ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm py-1`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.reports}
                  </Link>
                  <Link 
                    to="/analytics" 
                    className={`block ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm py-1`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.analytics}
                  </Link>
                  <Link 
                    to="/notifications" 
                    className={`block ${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors text-sm py-1`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.notifications}
                  </Link>
                </div>
              </div>
              
              <Link 
                to="/compare" 
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium py-2 flex items-center`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.compare}
                {compareCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </Link>
              <Link 
                to="/login" 
                className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors font-medium py-2`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.login}
              </Link>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{darkMode ? 'نهاري' : 'ليلي'}</span>
                </Button>
              </div>
              
              {/* Mobile Language Selector */}
              <div className="py-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>اللغة</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {supportedLanguages.slice(0, 8).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        toggleLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                        language === lang.code 
                          ? 'bg-blue-100 text-blue-800' 
                          : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mobile Currency Selector */}
              <div className="py-2">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>العملة</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {supportedCurrencies.slice(0, 8).map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        changeCurrency(curr.code);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-sm ${
                        currency === curr.code 
                          ? 'bg-blue-100 text-blue-800' 
                          : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{curr.flag}</span>
                      <span>{curr.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

