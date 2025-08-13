import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = ({ language, darkMode }) => {
  const isRTL = language === 'ar';

  const texts = {
    ar: {
      about: 'حول CopRRA',
      aboutText: 'منصة مقارنة الأسعار الرائدة في المنطقة، نساعدك في العثور على أفضل الصفقات والمنتجات بأسعار منافسة.',
      quickLinks: 'روابط سريعة',
      home: 'الرئيسية',
      products: 'المنتجات',
      articles: 'المقالات',
      compare: 'المقارنة',
      aboutUs: 'من نحن',
      contactUs: 'اتصل بنا',
      faq: 'الأسئلة الشائعة',
      categories: 'الفئات',
      phones: 'الهواتف الذكية',
      laptops: 'أجهزة الكمبيوتر المحمولة',
      appliances: 'الأجهزة المنزلية',
      contact: 'تواصل معنا',
      email: 'info@coprra.com',
      phone: '+966 11 123 4567',
      address: 'الرياض، المملكة العربية السعودية',
      followUs: 'تابعنا',
      rights: '© 2024 CopRRA. جميع الحقوق محفوظة.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام'
    },
    en: {
      about: 'About CopRRA',
      aboutText: 'The leading price comparison platform in the region, helping you find the best deals and products at competitive prices.',
      quickLinks: 'Quick Links',
      home: 'Home',
      products: 'Products',
      articles: 'Articles',
      compare: 'Compare',
      aboutUs: 'About Us',
      contactUs: 'Contact Us',
      faq: 'FAQ',
      categories: 'Categories',
      phones: 'Smartphones',
      laptops: 'Laptops',
      appliances: 'Home Appliances',
      contact: 'Contact Us',
      email: 'info@coprra.com',
      phone: '+966 11 123 4567',
      address: 'Riyadh, Saudi Arabia',
      followUs: 'Follow Us',
      rights: '© 2024 CopRRA. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service'
    }
  };

  const t = texts[language];

  return (
    <footer className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white'} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold">CopRRA</span>
            </div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-300'} text-sm leading-relaxed`}>
              {t.aboutText}
            </p>
            <div className="flex space-x-4">
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-400'} transition-colors`}>
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-400'} transition-colors`}>
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-400'} transition-colors`}>
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.products}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.articles}
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.compare}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.aboutUs}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.contactUs}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.faq}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.categories}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.phones}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.laptops}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t.appliances}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t.contact}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">{t.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">{t.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">{t.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">{t.rights}</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t.privacy}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

