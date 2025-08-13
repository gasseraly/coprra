/**
 * أدوات تحسين الأداء
 */

// Lazy loading للصور
export const lazyLoadImage = (src, placeholder = '/placeholder.jpg') => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(placeholder);
    img.src = src;
  });
};

// Debounce للبحث
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle للأحداث
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Cache للبيانات
class SimpleCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 دقائق افتراضياً
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    // إزالة العناصر القديمة إذا تجاوز الحد الأقصى
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // فحص انتهاء الصلاحية
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const apiCache = new SimpleCache();

// تحسين الطلبات
export const optimizedFetch = async (url, options = {}) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // فحص الكاش أولاً
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // حفظ في الكاش
    apiCache.set(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// تحسين التمرير
export const smoothScrollTo = (element, duration = 500) => {
  const start = window.pageYOffset;
  const target = element.offsetTop;
  const distance = target - start;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, start, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
};

// مراقبة الأداء
export const performanceMonitor = {
  marks: new Map(),
  
  mark(name) {
    this.marks.set(name, performance.now());
  },
  
  measure(name, startMark) {
    const startTime = this.marks.get(startMark);
    if (startTime) {
      const duration = performance.now() - startTime;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return duration;
    }
    return null;
  },
  
  clearMarks() {
    this.marks.clear();
  }
};

// تحسين الصور
export const optimizeImage = (src, width, height, quality = 80) => {
  // في بيئة الإنتاج، يمكن استخدام خدمة تحسين الصور
  const params = new URLSearchParams({
    w: width,
    h: height,
    q: quality,
    f: 'webp'
  });
  
  return `${src}?${params.toString()}`;
};

// تحميل الموارد بشكل مؤجل
export const loadResource = (src, type = 'script') => {
  return new Promise((resolve, reject) => {
    let element;
    
    if (type === 'script') {
      element = document.createElement('script');
      element.src = src;
      element.async = true;
    } else if (type === 'style') {
      element = document.createElement('link');
      element.rel = 'stylesheet';
      element.href = src;
    }
    
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error(`Failed to load ${type}: ${src}`));
    
    document.head.appendChild(element);
  });
};

// تحسين LocalStorage
export const storage = {
  set(key, value, expiry = null) {
    const item = {
      value,
      expiry: expiry ? Date.now() + expiry : null
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  get(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      localStorage.removeItem(key);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

// تحسين معالجة الأخطاء
export const errorHandler = {
  log(error, context = '') {
    console.error(`Error ${context}:`, error);
    
    // في بيئة الإنتاج، يمكن إرسال الأخطاء لخدمة المراقبة
    if (process.env.NODE_ENV === 'production') {
      // إرسال للخدمة
    }
  },
  
  async retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
};

export default {
  lazyLoadImage,
  debounce,
  throttle,
  apiCache,
  optimizedFetch,
  smoothScrollTo,
  performanceMonitor,
  optimizeImage,
  loadResource,
  storage,
  errorHandler
};

