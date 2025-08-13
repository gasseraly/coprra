import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Bot, User, Loader2, Settings, Globe, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const AIChatbot = ({ currentLanguage = 'ar', isOpen, onToggle, className = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMode, setChatMode] = useState('general'); // general, shopping, support
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // الترجمات
  const translations = {
    ar: {
      title: 'المساعد الذكي',
      placeholder: 'اكتب رسالتك هنا...',
      send: 'إرسال',
      clear: 'مسح المحادثة',
      settings: 'الإعدادات',
      mute: 'كتم الصوت',
      unmute: 'تشغيل الصوت',
      general: 'عام',
      shopping: 'تسوق',
      support: 'دعم فني',
      welcome: 'مرحباً! أنا المساعد الذكي لموقع CopRRA. كيف يمكنني مساعدتك اليوم؟',
      thinking: 'أفكر...',
      error: 'حدث خطأ، يرجى المحاولة مرة أخرى',
      suggestions: [
        'كيف أبحث عن منتج؟',
        'ما هي أفضل العروض؟',
        'كيف أقارن بين المنتجات؟',
        'أحتاج مساعدة في التسوق'
      ]
    },
    en: {
      title: 'AI Assistant',
      placeholder: 'Type your message here...',
      send: 'Send',
      clear: 'Clear Chat',
      settings: 'Settings',
      mute: 'Mute',
      unmute: 'Unmute',
      general: 'General',
      shopping: 'Shopping',
      support: 'Support',
      welcome: 'Hello! I\'m the AI assistant for CopRRA. How can I help you today?',
      thinking: 'Thinking...',
      error: 'An error occurred, please try again',
      suggestions: [
        'How do I search for a product?',
        'What are the best deals?',
        'How do I compare products?',
        'I need help with shopping'
      ]
    }
  };

  const t = translations[currentLanguage] || translations.ar;

  // التمرير التلقائي للأسفل
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // إضافة رسالة ترحيب عند فتح المحادثة
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: t.welcome,
          timestamp: new Date(),
          suggestions: t.suggestions
        }
      ]);
    }
  }, [isOpen, currentLanguage]);

  // إرسال رسالة
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // محاكاة استجابة الذكاء الاصطناعي
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const botResponse = await generateAIResponse(inputValue);
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse.content,
        timestamp: new Date(),
        suggestions: botResponse.suggestions || []
      }]);

      // حفظ في التاريخ
      setChatHistory(prev => [...prev, userMessage, {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse.content,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: t.error,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // توليد استجابة الذكاء الاصطناعي
  const generateAIResponse = async (userInput) => {
    try {
      const response = await fetch('/api/ai_chatbot.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          language: currentLanguage,
          mode: chatMode,
          context: messages.slice(-5) // آخر 5 رسائل للسياق
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        // استجابة افتراضية في حالة فشل API
        return generateDefaultResponse(userInput);
      }
    } catch (error) {
      console.error('API Error:', error);
      return generateDefaultResponse(userInput);
    }
  };

  // استجابة افتراضية ذكية
  const generateDefaultResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('بحث') || input.includes('search') || input.includes('product')) {
      return {
        content: 'يمكنك البحث عن المنتجات باستخدام شريط البحث في أعلى الصفحة. يمكنني أيضاً مساعدتك في العثور على منتجات محددة. ما الذي تبحث عنه؟',
        suggestions: ['أبحث عن هاتف ذكي', 'أريد لابتوب', 'أحتاج سماعات']
      };
    } else if (input.includes('مقارنة') || input.includes('compare')) {
      return {
        content: 'لمقارنة المنتجات، يمكنك إضافة المنتجات إلى قائمة المقارنة. سأوضح لك كيفية القيام بذلك خطوة بخطوة.',
        suggestions: ['كيف أضيف منتج للمقارنة؟', 'أريد مقارنة 3 منتجات', 'كيف أرى الفروق؟']
      };
    } else if (input.includes('سعر') || input.includes('price') || input.includes('عرض')) {
      return {
        content: 'أرى أنك مهتم بالأسعار! موقعنا يتتبع الأسعار من مختلف المتاجر ويوفر لك أفضل العروض. هل تريد أن أريك أحدث التخفيضات؟',
        suggestions: ['أرني التخفيضات', 'أفضل الأسعار', 'تتبع السعر']
      };
    } else {
      return {
        content: 'أفهم طلبك. يمكنني مساعدتك في البحث عن المنتجات، مقارنة الأسعار، العثور على أفضل العروض، وأكثر من ذلك. ما الذي تحتاجه تحديداً؟',
        suggestions: ['أريد مساعدة في التسوق', 'كيف أستخدم الموقع؟', 'أحتاج دعم فني']
      };
    }
  };

  // معالجة الاقتراحات
  const handleSuggestion = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  // مسح المحادثة
  const clearChat = () => {
    setMessages([]);
    setChatHistory([]);
  };

  // معالجة مفتاح Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // تبديل الوضع
  const toggleMode = (mode) => {
    setChatMode(mode);
    setMessages([{
      id: Date.now(),
      type: 'bot',
      content: mode === 'shopping' ? 
        'أهلاً بك في وضع التسوق! سأساعدك في العثور على أفضل المنتجات والعروض.' :
        mode === 'support' ?
        'أهلاً بك في وضع الدعم الفني! كيف يمكنني مساعدتك في حل مشكلتك؟' :
        'أهلاً بك في الوضع العام! كيف يمكنني مساعدتك؟',
      timestamp: new Date()
    }]);
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggle}
              className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 z-50"
              size="icon"
            >
              <MessageCircle className="w-8 h-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-semibold text-lg">{t.title}</h3>
            <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
              {chatMode === 'shopping' ? '🛍️' : chatMode === 'support' ? '🔧' : '💬'} {t[chatMode]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-blue-600"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-white hover:bg-blue-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">وضع المحادثة</span>
          </div>
          <div className="flex space-x-2 rtl:space-x-reverse">
            {['general', 'shopping', 'support'].map((mode) => (
              <Button
                key={mode}
                variant={chatMode === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleMode(mode)}
                className="text-xs"
              >
                {t[mode]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestion(suggestion)}
                        className={`w-full text-xs ${
                          message.type === 'user' 
                            ? 'border-white text-white hover:bg-white hover:text-blue-600' 
                            : 'border-gray-300 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString('ar-SA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">{t.thinking}</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.placeholder}
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            {t.clear}
          </Button>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Badge variant="outline" className="text-xs">
              {currentLanguage === 'ar' ? 'العربية' : 'English'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;