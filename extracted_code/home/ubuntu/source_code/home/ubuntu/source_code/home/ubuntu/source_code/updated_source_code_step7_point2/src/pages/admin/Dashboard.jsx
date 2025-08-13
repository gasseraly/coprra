import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Star,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import apiService from '../../services/api';

const AdminDashboard = ({ currentLanguage, currentCurrency, isDarkMode, user }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeUsers: 0,
      pendingReviews: 0,
      avgRating: 0,
      conversionRate: 0
    },
    recentActivity: [],
    topProducts: [],
    userGrowth: [],
    salesData: [],
    notifications: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const isRTL = currentLanguage === 'ar';

  // النصوص متعددة اللغات
  const texts = useMemo(() => ({
    ar: {
      title: 'لوحة تحكم المسؤول',
      subtitle: 'إدارة شاملة لموقع CopRRA',
      overview: 'نظرة عامة',
      analytics: 'التحليلات',
      users: 'المستخدمون',
      products: 'المنتجات',
      orders: 'الطلبات',
      reviews: 'المراجعات',
      settings: 'الإعدادات',
      notifications: 'الإشعارات',
      totalUsers: 'إجمالي المستخدمين',
      totalProducts: 'إجمالي المنتجات',
      totalOrders: 'إجمالي الطلبات',
      totalRevenue: 'إجمالي الإيرادات',
      activeUsers: 'المستخدمون النشطون',
      pendingReviews: 'المراجعات المعلقة',
      avgRating: 'متوسط التقييم',
      conversionRate: 'معدل التحويل',
      recentActivity: 'النشاط الأخير',
      topProducts: 'أفضل المنتجات',
      userGrowth: 'نمو المستخدمين',
      salesTrend: 'اتجاه المبيعات',
      quickActions: 'إجراءات سريعة',
      addProduct: 'إضافة منتج',
      manageUsers: 'إدارة المستخدمين',
      viewReports: 'عرض التقارير',
      systemHealth: 'صحة النظام',
      serverStatus: 'حالة الخادم',
      databaseStatus: 'حالة قاعدة البيانات',
      cacheStatus: 'حالة التخزين المؤقت',
      apiStatus: 'حالة API',
      online: 'متصل',
      offline: 'غير متصل',
      healthy: 'سليم',
      warning: 'تحذير',
      error: 'خطأ',
      last7Days: 'آخر 7 أيام',
      last30Days: 'آخر 30 يوم',
      last3Months: 'آخر 3 أشهر',
      lastYear: 'العام الماضي',
      search: 'البحث...',
      filter: 'فلترة',
      export: 'تصدير',
      refresh: 'تحديث',
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات',
      viewAll: 'عرض الكل',
      today: 'اليوم',
      thisWeek: 'هذا الأسبوع',
      thisMonth: 'هذا الشهر',
      performance: 'الأداء',
      excellent: 'ممتاز',
      good: 'جيد',
      average: 'متوسط',
      poor: 'ضعيف'
    },
    en: {
      title: 'Admin Dashboard',
      subtitle: 'Comprehensive management for CopRRA website',
      overview: 'Overview',
      analytics: 'Analytics',
      users: 'Users',
      products: 'Products',
      orders: 'Orders',
      reviews: 'Reviews',
      settings: 'Settings',
      notifications: 'Notifications',
      totalUsers: 'Total Users',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      activeUsers: 'Active Users',
      pendingReviews: 'Pending Reviews',
      avgRating: 'Average Rating',
      conversionRate: 'Conversion Rate',
      recentActivity: 'Recent Activity',
      topProducts: 'Top Products',
      userGrowth: 'User Growth',
      salesTrend: 'Sales Trend',
      quickActions: 'Quick Actions',
      addProduct: 'Add Product',
      manageUsers: 'Manage Users',
      viewReports: 'View Reports',
      systemHealth: 'System Health',
      serverStatus: 'Server Status',
      databaseStatus: 'Database Status',
      cacheStatus: 'Cache Status',
      apiStatus: 'API Status',
      online: 'Online',
      offline: 'Offline',
      healthy: 'Healthy',
      warning: 'Warning',
      error: 'Error',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      last3Months: 'Last 3 Months',
      lastYear: 'Last Year',
      search: 'Search...',
      filter: 'Filter',
      export: 'Export',
      refresh: 'Refresh',
      loading: 'Loading...',
      noData: 'No data available',
      viewAll: 'View All',
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      performance: 'Performance',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor'
    }
  }), [])[currentLanguage];

  // تحميل بيانات لوحة التحكم
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // محاكاة تحميل البيانات (يجب استبدالها بـ API حقيقي)
        const mockData = {
          stats: {
            totalUsers: 15420,
            totalProducts: 2847,
            totalOrders: 8932,
            totalRevenue: 245680,
            activeUsers: 1247,
            pendingReviews: 23,
            avgRating: 4.3,
            conversionRate: 3.2
          },
          recentActivity: [
            { id: 1, type: 'user_registered', message: 'مستخدم جديد سجل في الموقع', time: '5 دقائق' },
            { id: 2, type: 'product_added', message: 'تم إضافة منتج جديد', time: '15 دقيقة' },
            { id: 3, type: 'review_submitted', message: 'تم إرسال مراجعة جديدة', time: '30 دقيقة' },
            { id: 4, type: 'order_placed', message: 'تم تقديم طلب جديد', time: '1 ساعة' }
          ],
          topProducts: [
            { id: 1, name: 'iPhone 15 Pro', sales: 234, revenue: 234000 },
            { id: 2, name: 'Samsung Galaxy S24', sales: 189, revenue: 189000 },
            { id: 3, name: 'MacBook Pro M3', sales: 156, revenue: 312000 },
            { id: 4, name: 'iPad Air', sales: 134, revenue: 80400 }
          ],
          notifications: [
            { id: 1, type: 'warning', message: 'مراجعة تحتاج إلى موافقة', time: '10 دقائق' },
            { id: 2, type: 'info', message: 'تحديث النظام متاح', time: '2 ساعة' },
            { id: 3, type: 'success', message: 'تم إكمال النسخ الاحتياطي', time: '4 ساعات' }
          ]
        };

        // تأخير لمحاكاة تحميل البيانات
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [selectedPeriod]);

  // مكونات الإحصائيات
  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
            {' '}من الشهر الماضي
          </p>
        )}
      </CardContent>
    </Card>
  );

  // مكون حالة النظام
  const SystemHealthCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {texts.systemHealth}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>{texts.serverStatus}</span>
          <Badge variant="success">{texts.online}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>{texts.databaseStatus}</span>
          <Badge variant="success">{texts.healthy}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>{texts.cacheStatus}</span>
          <Badge variant="warning">{texts.warning}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>{texts.apiStatus}</span>
          <Badge variant="success">{texts.healthy}</Badge>
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {texts.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {texts.subtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">{texts.last7Days}</SelectItem>
                  <SelectItem value="30days">{texts.last30Days}</SelectItem>
                  <SelectItem value="3months">{texts.last3Months}</SelectItem>
                  <SelectItem value="1year">{texts.lastYear}</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {texts.refresh}
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">{texts.overview}</TabsTrigger>
            <TabsTrigger value="analytics">{texts.analytics}</TabsTrigger>
            <TabsTrigger value="users">{texts.users}</TabsTrigger>
            <TabsTrigger value="products">{texts.products}</TabsTrigger>
            <TabsTrigger value="orders">{texts.orders}</TabsTrigger>
            <TabsTrigger value="reviews">{texts.reviews}</TabsTrigger>
            <TabsTrigger value="notifications">{texts.notifications}</TabsTrigger>
            <TabsTrigger value="settings">{texts.settings}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={texts.totalUsers}
                value={dashboardData.stats.totalUsers.toLocaleString()}
                icon={Users}
                trend={12.5}
                color="blue"
              />
              <StatCard
                title={texts.totalProducts}
                value={dashboardData.stats.totalProducts.toLocaleString()}
                icon={Package}
                trend={8.2}
                color="green"
              />
              <StatCard
                title={texts.totalOrders}
                value={dashboardData.stats.totalOrders.toLocaleString()}
                icon={ShoppingCart}
                trend={-2.1}
                color="orange"
              />
              <StatCard
                title={texts.totalRevenue}
                value={`$${dashboardData.stats.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                trend={15.3}
                color="purple"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={texts.activeUsers}
                value={dashboardData.stats.activeUsers.toLocaleString()}
                icon={Activity}
                trend={5.7}
                color="cyan"
              />
              <StatCard
                title={texts.pendingReviews}
                value={dashboardData.stats.pendingReviews}
                icon={MessageSquare}
                trend={-12.3}
                color="yellow"
              />
              <StatCard
                title={texts.avgRating}
                value={dashboardData.stats.avgRating.toFixed(1)}
                icon={Star}
                trend={2.1}
                color="pink"
              />
              <StatCard
                title={texts.conversionRate}
                value={`${dashboardData.stats.conversionRate}%`}
                icon={TrendingUp}
                trend={0.8}
                color="indigo"
              />
            </div>

            {/* Charts and Activity */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{texts.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    {texts.viewAll}
                  </Button>
                </CardContent>
              </Card>

              {/* System Health */}
              <SystemHealthCard />
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>{texts.topProducts}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{product.sales} مبيعة</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{texts.quickActions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button className="h-20 flex-col gap-2">
                    <Package className="h-6 w-6" />
                    {texts.addProduct}
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    {texts.manageUsers}
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <BarChart3 className="h-6 w-6" />
                    {texts.viewReports}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>{texts.analytics}</CardTitle>
                <CardDescription>
                  تحليلات مفصلة لأداء الموقع والمبيعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">سيتم تطوير صفحة التحليلات قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{texts.users}</CardTitle>
                <CardDescription>
                  إدارة المستخدمين والصلاحيات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">سيتم تطوير صفحة إدارة المستخدمين قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>{texts.products}</CardTitle>
                <CardDescription>
                  إدارة المنتجات والفئات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">سيتم تطوير صفحة إدارة المنتجات قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>{texts.orders}</CardTitle>
                <CardDescription>
                  إدارة الطلبات والمبيعات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">سيتم تطوير صفحة إدارة الطلبات قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>{texts.reviews}</CardTitle>
                <CardDescription>
                  إدارة المراجعات والتقييمات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">سيتم تطوير صفحة إدارة المراجعات قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{texts.notifications}</CardTitle>
                <CardDescription>
                  إدارة الإشعارات والتنبيهات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.notifications.map((notification) => (
                    <Alert key={notification.id}>
                      <Bell className="h-4 w-4" />
                      <AlertTitle>{notification.type}</AlertTitle>
                      <AlertDescription>
                        {notification.message} - {notification.time}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{texts.settings}</CardTitle>
                <CardDescription>
                  إعدادات النظام والموقع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">سيتم تطوير صفحة الإعدادات قريباً</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

