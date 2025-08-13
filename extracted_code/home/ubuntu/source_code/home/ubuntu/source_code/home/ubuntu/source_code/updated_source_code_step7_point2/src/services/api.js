// خدمة API للتواصل مع الخادم
const API_BASE_URL = 'http://localhost/api/index.php';

class ApiService {
  constructor() {
    // إعداد cache للبيانات الثابتة
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 دقائق
  }

  // دالة للتحقق من صحة البيانات المخزنة مؤقتاً
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // دالة لحفظ البيانات في الذاكرة المؤقتة
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // دالة لجلب البيانات من الذاكرة المؤقتة
  getCache(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // دالة عامة لإرسال طلبات HTTP مع تحسينات الأداء
  async request(endpoint, options = {}) {
    try {
      // التحقق من الذاكرة المؤقتة للبيانات الثابتة
      const cacheKey = endpoint;
      if (this.isCacheValid(cacheKey) && !options.skipCache) {
        return this.getCache(cacheKey);
      }

      const url = `${API_BASE_URL}?${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300', // 5 دقائق
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // حفظ البيانات الثابتة في الذاكرة المؤقتة
      if (!options.skipCache && this.isStaticData(endpoint)) {
        this.setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // تحديد البيانات الثابتة التي يمكن تخزينها مؤقتاً
  isStaticData(endpoint) {
    const staticEndpoints = ['languages', 'currencies', 'categories', 'brands'];
    return staticEndpoints.some(staticEndpoint => endpoint.includes(staticEndpoint));
  }

  // اختبار الاتصال بـ API
  async testConnection() {
    return this.request('action=test', { skipCache: true });
  }

  // جلب قائمة اللغات المدعومة
  async getLanguages() {
    return this.request('action=languages');
  }

  // جلب قائمة العملات المدعومة
  async getCurrencies() {
    return this.request('action=currencies');
  }

  // جلب قائمة الفئات
  async getCategories() {
    return this.request('action=categories');
  }

  // جلب قائمة العلامات التجارية
  async getBrands() {
    return this.request('action=brands');
  }

  // جلب قائمة المنتجات مع إمكانية الفلترة والتصفح
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams({
      action: 'products',
      ...params
    });
    return this.request(queryParams.toString(), { skipCache: true });
  }

  // جلب تفاصيل منتج واحد
  async getProduct(productId) {
    return this.request(`action=product&id=${productId}`, { skipCache: true });
  }

  // جلب محتوى صفحة ثابتة
  async getPage(slug) {
    return this.request(`action=page&slug=${slug}`);
  }

  // جلب قائمة المقالات
  async getArticles(params = {}) {
    const queryParams = new URLSearchParams({
      action: 'articles',
      ...params
    });
    return this.request(queryParams.toString(), { skipCache: true });
  }

  // جلب محتوى مقال واحد
  async getArticle(slug) {
    return this.request(`action=article&slug=${slug}`, { skipCache: true });
  }

  // جلب المنتجات حسب الفئة
  async getProductsByCategory(categoryId, params = {}) {
    return this.getProducts({
      category_id: categoryId,
      ...params
    });
  }

  // جلب المنتجات حسب العلامة التجارية
  async getProductsByBrand(brandId, params = {}) {
    return this.getProducts({
      brand_id: brandId,
      ...params
    });
  }

  // البحث في المنتجات مع تحسينات الأداء
  async searchProducts(query, params = {}) {
    if (!query || query.trim().length < 2) {
      return this.getProducts(params);
    }

    // إضافة معامل البحث إلى الطلب
    const searchParams = {
      search: query.trim(),
      ...params
    };

    return this.getProducts(searchParams);
  }

  // دوال جديدة لنظام المستخدمين
  async registerUser(userData) {
    return this.request('action=register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipCache: true
    });
  }

  async loginUser(credentials) {
    return this.request('action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipCache: true
    });
  }

  async logoutUser() {
    return this.request('action=logout', {
      method: 'POST',
      skipCache: true
    });
  }

  async getUserProfile() {
    return this.request('action=profile', { skipCache: true });
  }

  async updateUserProfile(userData) {
    return this.request('action=update_profile', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipCache: true
    });
  }

  // دوال نظام المراجعات
  async getProductReviews(productId, params = {}) {
    const queryParams = new URLSearchParams({
      action: 'reviews',
      product_id: productId,
      ...params
    });
    return this.request(queryParams.toString(), { skipCache: true });
  }

  async addReview(reviewData) {
    return this.request('action=add_review', {
      method: 'POST',
      body: JSON.stringify(reviewData),
      skipCache: true
    });
  }

  async updateReview(reviewId, reviewData) {
    return this.request('action=update_review', {
      method: 'POST',
      body: JSON.stringify({ review_id: reviewId, ...reviewData }),
      skipCache: true
    });
  }

  async deleteReview(reviewId) {
    return this.request('action=delete_review', {
      method: 'POST',
      body: JSON.stringify({ review_id: reviewId }),
      skipCache: true
    });
  }

  // دوال نظام الأسئلة والأجوبة
  async getProductQuestions(productId, params = {}) {
    const queryParams = new URLSearchParams({
      action: 'questions',
      product_id: productId,
      ...params
    });
    return this.request(queryParams.toString(), { skipCache: true });
  }

  async addQuestion(questionData) {
    return this.request('action=add_question', {
      method: 'POST',
      body: JSON.stringify(questionData),
      skipCache: true
    });
  }

  async addAnswer(answerData) {
    return this.request('action=add_answer', {
      method: 'POST',
      body: JSON.stringify(answerData),
      skipCache: true
    });
  }

  // دوال قائمة المفضلة
  async getWishlist() {
    return this.request('action=wishlist', { skipCache: true });
  }

  async addToWishlist(productId) {
    return this.request('action=add_to_wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
      skipCache: true
    });
  }

  async removeFromWishlist(productId) {
    return this.request('action=remove_from_wishlist', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
      skipCache: true
    });
  }

  async isInWishlist(productId) {
    return this.request(`action=check_wishlist&product_id=${productId}`, { skipCache: true });
  }

  // دالة لمسح الذاكرة المؤقتة
  clearCache() {
    this.cache.clear();
  }

  // دالة لمسح عنصر محدد من الذاكرة المؤقتة
  clearCacheItem(key) {
    this.cache.delete(key);
  }
}

// إنشاء مثيل واحد من الخدمة
const apiService = new ApiService();

export default apiService;

