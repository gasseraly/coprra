import { useState, useEffect, useCallback, useRef } from 'react';
import { debounce, throttle, performanceMonitor } from '../utils/performance';

// Hook للتحميل المؤجل
export const useLazyLoading = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

// Hook للبحث المحسن
export const useOptimizedSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay),
    [searchFn, delay]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error
  };
};

// Hook لمراقبة الأداء
export const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    performanceMonitor.mark(`${componentName}_mount_start`);
    
    return () => {
      performanceMonitor.measure(
        `${componentName}_mount_duration`,
        `${componentName}_mount_start`
      );
    };
  }, [componentName]);

  const measureAction = useCallback((actionName, fn) => {
    return async (...args) => {
      const markName = `${componentName}_${actionName}_start`;
      performanceMonitor.mark(markName);
      
      try {
        const result = await fn(...args);
        performanceMonitor.measure(
          `${componentName}_${actionName}_duration`,
          markName
        );
        return result;
      } catch (error) {
        performanceMonitor.measure(
          `${componentName}_${actionName}_error`,
          markName
        );
        throw error;
      }
    };
  }, [componentName]);

  return { measureAction };
};

// Hook للتمرير المحسن
export const useOptimizedScroll = (callback, delay = 100) => {
  const throttledCallback = useCallback(
    throttle(callback, delay),
    [callback, delay]
  );

  useEffect(() => {
    window.addEventListener('scroll', throttledCallback);
    return () => window.removeEventListener('scroll', throttledCallback);
  }, [throttledCallback]);
};

// Hook للتحميل التدريجي للصور
export const useProgressiveImage = (src, placeholder) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    
    img.src = src;
  }, [src]);

  return { src: currentSrc, isLoading, error };
};

// Hook للكاش المحلي
export const useLocalCache = (key, initialValue, ttl = 5 * 60 * 1000) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch {
      return initialValue;
    }
  });

  const setCachedValue = useCallback((newValue) => {
    try {
      setValue(newValue);
      const item = {
        value: newValue,
        expiry: ttl ? Date.now() + ttl : null
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to cache value:', error);
    }
  }, [key, ttl]);

  const clearCache = useCallback(() => {
    localStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setCachedValue, clearCache];
};

// Hook لإدارة حالة التحميل
export const useAsyncState = (asyncFn, dependencies = []) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
};

// Hook للتحكم في الذاكرة
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef([]);

  const addCleanup = useCallback((fn) => {
    cleanupFunctions.current.push(fn);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    });
    cleanupFunctions.current = [];
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { addCleanup, cleanup };
};

export default {
  useLazyLoading,
  useOptimizedSearch,
  usePerformanceMonitor,
  useOptimizedScroll,
  useProgressiveImage,
  useLocalCache,
  useAsyncState,
  useMemoryOptimization
};

