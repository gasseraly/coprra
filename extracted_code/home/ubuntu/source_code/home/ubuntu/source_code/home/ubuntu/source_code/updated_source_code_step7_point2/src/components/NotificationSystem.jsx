import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// أنواع الإشعارات
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// مكون الإشعار الفردي
const NotificationItem = ({ notification, onMarkAsRead, onDelete, isRTL }) => {
  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case NOTIFICATION_TYPES.ERROR:
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    if (notification.read) return 'bg-gray-50 dark:bg-gray-800';
    
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-50 dark:bg-green-900/20 border-green-200';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} ${!notification.read ? 'border-l-4' : ''}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <Badge variant="secondary" className="text-xs">
                جديد
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {notification.timestamp}
            </span>
            <div className="flex gap-2">
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onMarkAsRead(notification.id)}
                  className="h-6 px-2 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  تم القراءة
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(notification.id)}
                className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون إعدادات الإشعارات
const NotificationSettings = ({ settings, onUpdateSettings, isRTL }) => {
  const texts = {
    ar: {
      settings: 'إعدادات الإشعارات',
      enableNotifications: 'تفعيل الإشعارات',
      enableSound: 'تفعيل الصوت',
      enableDesktop: 'إشعارات سطح المكتب',
      enableEmail: 'إشعارات البريد الإلكتروني',
      enablePush: 'الإشعارات الفورية',
      notificationTypes: 'أنواع الإشعارات',
      orderUpdates: 'تحديثات الطلبات',
      productAlerts: 'تنبيهات المنتجات',
      priceChanges: 'تغييرات الأسعار',
      systemUpdates: 'تحديثات النظام',
      save: 'حفظ الإعدادات'
    },
    en: {
      settings: 'Notification Settings',
      enableNotifications: 'Enable Notifications',
      enableSound: 'Enable Sound',
      enableDesktop: 'Desktop Notifications',
      enableEmail: 'Email Notifications',
      enablePush: 'Push Notifications',
      notificationTypes: 'Notification Types',
      orderUpdates: 'Order Updates',
      productAlerts: 'Product Alerts',
      priceChanges: 'Price Changes',
      systemUpdates: 'System Updates',
      save: 'Save Settings'
    }
  };

  const t = texts.ar; // يمكن تغييرها حسب اللغة

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t.settings}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t.enableNotifications}</label>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => onUpdateSettings({ ...settings, enabled: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t.enableSound}</label>
            <Switch
              checked={settings.sound}
              onCheckedChange={(checked) => onUpdateSettings({ ...settings, sound: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t.enableDesktop}</label>
            <Switch
              checked={settings.desktop}
              onCheckedChange={(checked) => onUpdateSettings({ ...settings, desktop: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{t.enableEmail}</label>
            <Switch
              checked={settings.email}
              onCheckedChange={(checked) => onUpdateSettings({ ...settings, email: checked })}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">{t.notificationTypes}</h4>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">{t.orderUpdates}</label>
            <Switch
              checked={settings.types.orders}
              onCheckedChange={(checked) => 
                onUpdateSettings({ 
                  ...settings, 
                  types: { ...settings.types, orders: checked }
                })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">{t.productAlerts}</label>
            <Switch
              checked={settings.types.products}
              onCheckedChange={(checked) => 
                onUpdateSettings({ 
                  ...settings, 
                  types: { ...settings.types, products: checked }
                })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">{t.priceChanges}</label>
            <Switch
              checked={settings.types.prices}
              onCheckedChange={(checked) => 
                onUpdateSettings({ 
                  ...settings, 
                  types: { ...settings.types, prices: checked }
                })
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm">{t.systemUpdates}</label>
            <Switch
              checked={settings.types.system}
              onCheckedChange={(checked) => 
                onUpdateSettings({ 
                  ...settings, 
                  types: { ...settings.types, system: checked }
                })
              }
            />
          </div>
        </div>

        <Button className="w-full" size="sm">
          {t.save}
        </Button>
      </CardContent>
    </Card>
  );
};

// المكون الرئيسي لنظام الإشعارات
const NotificationSystem = ({ currentLanguage = 'ar', user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    desktop: false,
    email: true,
    types: {
      orders: true,
      products: true,
      prices: true,
      system: true
    }
  });

  const isRTL = currentLanguage === 'ar';

  // النصوص متعددة اللغات
  const texts = useMemo(() => ({
    ar: {
      notifications: 'الإشعارات',
      noNotifications: 'لا توجد إشعارات',
      markAllAsRead: 'تحديد الكل كمقروء',
      clearAll: 'مسح الكل',
      viewAll: 'عرض الكل',
      settings: 'الإعدادات'
    },
    en: {
      notifications: 'Notifications',
      noNotifications: 'No notifications',
      markAllAsRead: 'Mark all as read',
      clearAll: 'Clear all',
      viewAll: 'View all',
      settings: 'Settings'
    }
  }), [])[currentLanguage];

  // تحميل الإشعارات الأولية
  useEffect(() => {
    const loadNotifications = () => {
      // محاكاة تحميل الإشعارات من API
      const mockNotifications = [
        {
          id: 1,
          type: NOTIFICATION_TYPES.SUCCESS,
          title: 'تم تحديث المنتج بنجاح',
          message: 'تم تحديث معلومات المنتج iPhone 15 Pro بنجاح',
          timestamp: 'منذ 5 دقائق',
          read: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: 2,
          type: NOTIFICATION_TYPES.INFO,
          title: 'طلب جديد',
          message: 'تم استلام طلب جديد من العميل أحمد محمد',
          timestamp: 'منذ 15 دقيقة',
          read: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: 3,
          type: NOTIFICATION_TYPES.WARNING,
          title: 'مراجعة تحتاج موافقة',
          message: 'هناك مراجعة جديدة تحتاج إلى موافقة المشرف',
          timestamp: 'منذ 30 دقيقة',
          read: true,
          createdAt: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: 4,
          type: NOTIFICATION_TYPES.ERROR,
          title: 'خطأ في النظام',
          message: 'فشل في تحديث أسعار بعض المنتجات',
          timestamp: 'منذ ساعة',
          read: true,
          createdAt: new Date(Date.now() - 60 * 60 * 1000)
        }
      ];

      setNotifications(mockNotifications);
    };

    loadNotifications();

    // تحديث الإشعارات كل 30 ثانية
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // تحميل الإعدادات من localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // حفظ الإعدادات في localStorage
  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  // طلب إذن الإشعارات من المتصفح
  useEffect(() => {
    if (settings.desktop && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.desktop]);

  // إضافة إشعار جديد
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: 'الآن',
      read: false,
      createdAt: new Date(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // تشغيل الصوت إذا كان مفعلاً
    if (settings.sound) {
      // يمكن إضافة ملف صوتي هنا
      // new Audio('/notification-sound.mp3').play();
    }

    // إظهار إشعار سطح المكتب
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }

    // إظهار toast notification
    toast(notification.title, {
      description: notification.message,
      duration: 5000
    });
  }, [settings.sound, settings.desktop]);

  // تحديد إشعار كمقروء
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // حذف إشعار
  const deleteNotification = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // مسح جميع الإشعارات
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // تحديث الإعدادات
  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  // حساب عدد الإشعارات غير المقروءة
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // الإشعارات الحديثة (آخر 5)
  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 5);
  }, [notifications]);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className={`w-96 p-0 ${isRTL ? 'ml-4' : 'mr-4'}`}
          align={isRTL ? 'start' : 'end'}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{texts.notifications}</h3>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="left" className="p-0">
                    <NotificationSettings
                      settings={settings}
                      onUpdateSettings={updateSettings}
                      isRTL={isRTL}
                    />
                  </PopoverContent>
                </Popover>
                
                {settings.sound ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
            
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  {texts.markAllAsRead}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                  className="text-xs"
                >
                  {texts.clearAll}
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="h-96">
            <div className="p-4">
              {recentNotifications.length > 0 ? (
                <div className="space-y-3">
                  {recentNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      isRTL={isRTL}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">{texts.noNotifications}</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {notifications.length > 5 && (
            <div className="p-4 border-t">
              <Button variant="outline" className="w-full" size="sm">
                {texts.viewAll} ({notifications.length})
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NotificationSystem;

