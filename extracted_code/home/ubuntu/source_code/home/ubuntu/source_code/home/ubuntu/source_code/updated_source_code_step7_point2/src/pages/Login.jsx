import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import SEOHead from '../components/SEOHead';

const Login = ({ language, currency, darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: ''
  });
  
  const [resetPasswordData, setResetPasswordData] = useState({
    token: '',
    password: '',
    confirmPassword: ''
  });

  const isRTL = language === 'ar';

  // Check for reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetPasswordData(prev => ({ ...prev, token }));
      setActiveTab('reset-password');
    }
  }, [location]);

  const texts = {
    ar: {
      welcome: 'مرحباً بك في CopRRA',
      subtitle: 'سجل دخولك للوصول إلى حسابك والاستفادة من جميع المميزات',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب جديد',
      forgotPassword: 'نسيت كلمة المرور',
      resetPassword: 'إعادة تعيين كلمة المرور',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      newPassword: 'كلمة المرور الجديدة',
      confirmPassword: 'تأكيد كلمة المرور',
      firstName: 'الاسم الأول',
      lastName: 'الاسم الأخير',
      rememberMe: 'تذكرني',
      forgotPasswordLink: 'نسيت كلمة المرور؟',
      loginButton: 'تسجيل الدخول',
      registerButton: 'إنشاء حساب',
      sendResetButton: 'إرسال رابط الإعادة',
      resetPasswordButton: 'إعادة تعيين كلمة المرور',
      noAccount: 'ليس لديك حساب؟',
      haveAccount: 'لديك حساب بالفعل؟',
      backToLogin: 'العودة لتسجيل الدخول',
      signUp: 'سجل الآن',
      signIn: 'سجل دخولك',
      agreeToTerms: 'أوافق على',
      termsLink: 'شروط الاستخدام',
      and: 'و',
      privacyLink: 'سياسة الخصوصية',
      benefits: {
        title: 'مميزات الحساب',
        compare: 'حفظ المقارنات',
        wishlist: 'قائمة الأمنيات',
        alerts: 'تنبيهات الأسعار',
        history: 'تاريخ البحث'
      },
      validation: {
        emailRequired: 'البريد الإلكتروني مطلوب',
        emailInvalid: 'البريد الإلكتروني غير صحيح',
        passwordRequired: 'كلمة المرور مطلوبة',
        passwordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
        passwordsNotMatch: 'كلمات المرور غير متطابقة',
        firstNameRequired: 'الاسم الأول مطلوب',
        lastNameRequired: 'الاسم الأخير مطلوب',
        termsRequired: 'يجب الموافقة على الشروط والأحكام'
      },
      messages: {
        loginSuccess: 'تم تسجيل الدخول بنجاح',
        registerSuccess: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني',
        resetEmailSent: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
        passwordResetSuccess: 'تم إعادة تعيين كلمة المرور بنجاح',
        genericError: 'حدث خطأ. يرجى المحاولة مرة أخرى'
      }
    },
    en: {
      welcome: 'Welcome to CopRRA',
      subtitle: 'Sign in to your account to access all features',
      login: 'Sign In',
      register: 'Create Account',
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      email: 'Email Address',
      password: 'Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      rememberMe: 'Remember me',
      forgotPasswordLink: 'Forgot password?',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      sendResetButton: 'Send Reset Link',
      resetPasswordButton: 'Reset Password',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      backToLogin: 'Back to Sign In',
      signUp: 'Sign up',
      signIn: 'Sign in',
      agreeToTerms: 'I agree to the',
      termsLink: 'Terms of Service',
      and: 'and',
      privacyLink: 'Privacy Policy',
      benefits: {
        title: 'Account Benefits',
        compare: 'Save Comparisons',
        wishlist: 'Wishlist',
        alerts: 'Price Alerts',
        history: 'Search History'
      },
      validation: {
        emailRequired: 'Email is required',
        emailInvalid: 'Invalid email address',
        passwordRequired: 'Password is required',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordsNotMatch: 'Passwords do not match',
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
        termsRequired: 'You must agree to the terms and conditions'
      },
      messages: {
        loginSuccess: 'Login successful',
        registerSuccess: 'Account created successfully. Please check your email',
        resetEmailSent: 'Password reset link sent to your email',
        passwordResetSuccess: 'Password reset successfully',
        genericError: 'An error occurred. Please try again'
      }
    }
  };

  const t = texts[language] || texts.en;

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Validation
    if (!loginData.email) {
      setMessage({ type: 'error', text: t.validation.emailRequired });
      return;
    }
    if (!validateEmail(loginData.email)) {
      setMessage({ type: 'error', text: t.validation.emailInvalid });
      return;
    }
    if (!loginData.password) {
      setMessage({ type: 'error', text: t.validation.passwordRequired });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store session token
        localStorage.setItem('session_token', data.session_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setMessage({ type: 'success', text: t.messages.loginSuccess });
        
        // Redirect to intended page or home
        const redirectTo = location.state?.from?.pathname || '/';
        setTimeout(() => navigate(redirectTo), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || t.messages.genericError });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.messages.genericError });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Validation
    if (!registerData.firstName) {
      setMessage({ type: 'error', text: t.validation.firstNameRequired });
      return;
    }
    if (!registerData.lastName) {
      setMessage({ type: 'error', text: t.validation.lastNameRequired });
      return;
    }
    if (!registerData.email) {
      setMessage({ type: 'error', text: t.validation.emailRequired });
      return;
    }
    if (!validateEmail(registerData.email)) {
      setMessage({ type: 'error', text: t.validation.emailInvalid });
      return;
    }
    if (!registerData.password) {
      setMessage({ type: 'error', text: t.validation.passwordRequired });
      return;
    }
    if (!validatePassword(registerData.password)) {
      setMessage({ type: 'error', text: t.validation.passwordTooShort });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setMessage({ type: 'error', text: t.validation.passwordsNotMatch });
      return;
    }
    if (!registerData.agreeToTerms) {
      setMessage({ type: 'error', text: t.validation.termsRequired });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth.php?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: registerData.firstName,
          last_name: registerData.lastName,
          email: registerData.email,
          password: registerData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.messages.registerSuccess });
        // Switch to login tab after successful registration
        setTimeout(() => setActiveTab('login'), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || t.messages.genericError });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.messages.genericError });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!forgotPasswordData.email) {
      setMessage({ type: 'error', text: t.validation.emailRequired });
      return;
    }
    if (!validateEmail(forgotPasswordData.email)) {
      setMessage({ type: 'error', text: t.validation.emailInvalid });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth.php?action=forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordData.email
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.messages.resetEmailSent });
      } else {
        setMessage({ type: 'error', text: data.error || t.messages.genericError });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.messages.genericError });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!resetPasswordData.password) {
      setMessage({ type: 'error', text: t.validation.passwordRequired });
      return;
    }
    if (!validatePassword(resetPasswordData.password)) {
      setMessage({ type: 'error', text: t.validation.passwordTooShort });
      return;
    }
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setMessage({ type: 'error', text: t.validation.passwordsNotMatch });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth.php?action=reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetPasswordData.token,
          password: resetPasswordData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: t.messages.passwordResetSuccess });
        setTimeout(() => {
          setActiveTab('login');
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || t.messages.genericError });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t.messages.genericError });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead 
        title={language === 'ar' ? 'تسجيل الدخول - CopRRA' : 'Login - CopRRA'}
        description={language === 'ar' ? 'سجل دخولك إلى CopRRA للوصول إلى حسابك والاستفادة من جميع المميزات مثل حفظ المقارنات وقائمة الأمنيات وتنبيهات الأسعار.' : 'Sign in to your CopRRA account to access all features including saved comparisons, wishlist, and price alerts.'}
        keywords={language === 'ar' ? 'تسجيل دخول, حساب, مستخدم, CopRRA' : 'login, sign in, account, user, CopRRA'}
        type="website"
        language={language}
        currency={currency}
        breadcrumbs={[
          { name: language === 'ar' ? 'الرئيسية' : 'Home', url: 'https://coprra.com/' },
          { name: language === 'ar' ? 'تسجيل الدخول' : 'Login', url: 'https://coprra.com/login' }
        ]}
      />
      
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t.welcome}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {message.text && (
          <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-green-500 bg-green-50 dark:bg-green-900/20'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
            <AlertDescription className={message.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-green-800 dark:text-green-200'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t.login}</TabsTrigger>
                <TabsTrigger value="register">{t.register}</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t.email}
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t.password}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={loginData.rememberMe}
                        onCheckedChange={(checked) => setLoginData({...loginData, rememberMe: checked})}
                        disabled={isLoading}
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        {t.rememberMe}
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot-password')}
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      disabled={isLoading}
                    >
                      {t.forgotPasswordLink}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.loginButton}
                      </>
                    ) : (
                      t.loginButton
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.noAccount}{' '}
                    <button
                      onClick={() => setActiveTab('register')}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      disabled={isLoading}
                    >
                      {t.signUp}
                    </button>
                  </p>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-firstname">{t.firstName}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-firstname"
                          type="text"
                          placeholder={t.firstName}
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-lastname">{t.lastName}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-lastname"
                          type="text"
                          placeholder={t.lastName}
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t.email}
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t.password}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">{t.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t.confirmPassword}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agree-terms"
                      checked={registerData.agreeToTerms}
                      onCheckedChange={(checked) => setRegisterData({...registerData, agreeToTerms: checked})}
                      disabled={isLoading}
                    />
                    <Label htmlFor="agree-terms" className="text-sm">
                      {t.agreeToTerms}{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        {t.termsLink}
                      </Link>
                      {' '}{t.and}{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        {t.privacyLink}
                      </Link>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.registerButton}
                      </>
                    ) : (
                      t.registerButton
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t.haveAccount}{' '}
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                      disabled={isLoading}
                    >
                      {t.signIn}
                    </button>
                  </p>
                </div>
              </TabsContent>

              {/* Forgot Password Tab */}
              <TabsContent value="forgot-password" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t.forgotPassword}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {language === 'ar' 
                      ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور'
                      : 'Enter your email address and we\'ll send you a password reset link'
                    }
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder={t.email}
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.sendResetButton}
                      </>
                    ) : (
                      t.sendResetButton
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    disabled={isLoading}
                  >
                    {t.backToLogin}
                  </button>
                </div>
              </TabsContent>

              {/* Reset Password Tab */}
              <TabsContent value="reset-password" className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t.resetPassword}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {language === 'ar' 
                      ? 'أدخل كلمة المرور الجديدة'
                      : 'Enter your new password'
                    }
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-password">{t.newPassword}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t.newPassword}
                        value={resetPasswordData.password}
                        onChange={(e) => setResetPasswordData({...resetPasswordData, password: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-confirm-password">{t.confirmPassword}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t.confirmPassword}
                        value={resetPasswordData.confirmPassword}
                        onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                        className="pl-10 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.resetPasswordButton}
                      </>
                    ) : (
                      t.resetPasswordButton
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    disabled={isLoading}
                  >
                    {t.backToLogin}
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold text-gray-900 dark:text-white">
              {t.benefits.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.benefits.compare}</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.benefits.wishlist}</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.benefits.alerts}</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.benefits.history}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

