import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  article = null,
  product = null,
  breadcrumbs = [],
  language = 'ar',
  currency = 'USD'
}) => {
  const location = useLocation();
  const currentUrl = url || `https://coprra.com${location.pathname}`;
  
  // إعدادات SEO الافتراضية
  const defaultSEO = {
    ar: {
      title: 'CopRRA - مقارنة الأسعار والتسوق الذكي',
      description: 'اكتشف أفضل الأسعار للمنتجات التقنية مع CopRRA. قارن الأسعار من متاجر متعددة واتخذ قرارات شراء ذكية.',
      keywords: 'مقارنة أسعار, تسوق ذكي, أفضل الأسعار, منتجات تقنية, هواتف ذكية, أجهزة كمبيوتر, إلكترونيات'
    },
    en: {
      title: 'CopRRA - Price Comparison & Smart Shopping',
      description: 'Discover the best prices for tech products with CopRRA. Compare prices from multiple stores and make smart purchasing decisions.',
      keywords: 'price comparison, smart shopping, best prices, tech products, smartphones, computers, electronics'
    }
  };

  const seoData = {
    title: title || defaultSEO[language].title,
    description: description || defaultSEO[language].description,
    keywords: keywords || defaultSEO[language].keywords,
    image: image || 'https://coprra.com/images/og-image.jpg',
    url: currentUrl
  };

  // إنشاء structured data للموقع
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": language === 'ar' ? 'CopRRA' : 'CopRRA',
    "alternateName": language === 'ar' ? 'كوبرا - مقارنة الأسعار' : 'CopRRA - Price Comparison',
    "url": "https://coprra.com",
    "description": seoData.description,
    "inLanguage": language === 'ar' ? 'ar-SA' : 'en-US',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://coprra.com/products?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CopRRA",
      "url": "https://coprra.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://coprra.com/images/logo.png",
        "width": 300,
        "height": 100
      },
      "sameAs": [
        "https://twitter.com/coprra",
        "https://facebook.com/coprra",
        "https://instagram.com/coprra"
      ]
    }
  };

  // إنشاء structured data للمقال
  const articleStructuredData = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author || "CopRRA Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CopRRA",
      "logo": {
        "@type": "ImageObject",
        "url": "https://coprra.com/images/logo.png"
      }
    },
    "datePublished": article.publishedDate,
    "dateModified": article.modifiedDate || article.publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": currentUrl
    },
    "articleSection": article.category,
    "keywords": article.keywords,
    "wordCount": article.wordCount,
    "inLanguage": language === 'ar' ? 'ar-SA' : 'en-US'
  } : null;

  // إنشاء structured data للمنتج
  const productStructuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "model": product.model,
    "sku": product.sku,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": currency,
      "lowPrice": product.minPrice,
      "highPrice": product.maxPrice,
      "offerCount": product.offerCount,
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.value,
      "reviewCount": product.rating.count,
      "bestRating": 5,
      "worstRating": 1
    } : null,
    "category": product.category
  } : null;

  // إنشاء breadcrumbs structured data
  const breadcrumbsStructuredData = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  } : null;

  // إنشاء FAQ structured data للصفحات المناسبة
  const faqStructuredData = type === 'faq' ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": language === 'ar' ? "كيف يعمل موقع CopRRA؟" : "How does CopRRA work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'ar' 
            ? "CopRRA يقوم بمقارنة أسعار المنتجات من متاجر متعددة لمساعدتك في العثور على أفضل الصفقات والأسعار المناسبة."
            : "CopRRA compares product prices from multiple stores to help you find the best deals and suitable prices."
        }
      },
      {
        "@type": "Question",
        "name": language === 'ar' ? "هل الموقع مجاني؟" : "Is the website free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": language === 'ar' 
            ? "نعم، موقع CopRRA مجاني تماماً للاستخدام. يمكنك مقارنة الأسعار والبحث عن المنتجات دون أي رسوم."
            : "Yes, CopRRA website is completely free to use. You can compare prices and search for products without any fees."
        }
      }
    ]
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta name="author" content="CopRRA Team" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={seoData.url} />
      
      {/* Language and Locale */}
      <html lang={language === 'ar' ? 'ar-SA' : 'en-US'} />
      <meta name="language" content={language === 'ar' ? 'Arabic' : 'English'} />
      <meta property="og:locale" content={language === 'ar' ? 'ar_SA' : 'en_US'} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.image} />
      <meta property="og:url" content={seoData.url} />
      <meta property="og:site_name" content="CopRRA" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@coprra" />
      <meta name="twitter:creator" content="@coprra" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="application-name" content="CopRRA" />
      <meta name="apple-mobile-web-app-title" content="CopRRA" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Security Headers */}
      <meta http-equiv="X-Content-Type-Options" content="nosniff" />
      <meta http-equiv="X-Frame-Options" content="DENY" />
      <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.coprra.com" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Alternate Languages */}
      <link rel="alternate" hrefLang="ar" href={`https://coprra.com/ar${location.pathname}`} />
      <link rel="alternate" hrefLang="en" href={`https://coprra.com/en${location.pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={`https://coprra.com${location.pathname}`} />
      
      {/* Article specific meta tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedDate} />
          <meta property="article:modified_time" content={article.modifiedDate || article.publishedDate} />
          <meta property="article:author" content={article.author || "CopRRA Team"} />
          <meta property="article:section" content={article.category} />
          {article.tags && article.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Product specific meta tags */}
      {product && (
        <>
          <meta property="product:price:amount" content={product.minPrice} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={product.inStock ? "in stock" : "out of stock"} />
          <meta property="product:brand" content={product.brand} />
          <meta property="product:category" content={product.category} />
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </script>
      
      {articleStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(articleStructuredData)}
        </script>
      )}
      
      {productStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(productStructuredData)}
        </script>
      )}
      
      {breadcrumbsStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbsStructuredData)}
        </script>
      )}
      
      {faqStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

