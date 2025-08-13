import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Bot, User, Loader, Volume2, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const AIChatbot = ({ isOpen, onToggle, language = 'ar' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // رسالة ترحيبية أولية
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        type: 'ai',
        content: language === 'ar' 
          ? 'مرحباً بك في CopRRA! 👋 أنا مساعدك الذكي لمقارنة الأسعار. كيف يمكنني مساعدتك اليوم؟'
          : 'Welcome to CopRRA! 👋 I\'m your smart price comparison assistant. How can I help you today?',
        timestamp: new Date(),
        suggestions: language === 'ar' ? [
          'البحث عن منتج',
          'مقارنة المنتجات', 
          'أفضل العروض',
          'مساعدة في الاختيار'
        ] : [
          'Search for product',
          'Compare products',
          'Best deals',
          'Help me choose'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, language]);

  // التمرير إلى آخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // التركيز على حقل الإدخال عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // إرسال رسالة
  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai_chatbot.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          language: language,
          context: {
            sessionId: sessionId,
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        // محاكاة تأخير الكتابة للذكاء الاصطناعي
        setTimeout(() => {
          const aiMessage = {
            type: 'ai',
            content: data.message,
            intent: data.intent,
            confidence: data.confidence,
            suggestions: data.suggestions || [],
            actions: data.actions || [],
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiMessage]);
          setIsTyping(false);
          
          if (data.session_id) {
            setSessionId(data.session_id);
          }
        }, 1000 + Math.random() * 1000); // تأخير عشوائي للواقعية
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        type: 'ai',
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  // استخدام اقتراح سريع
  const useSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  // نسخ النص
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // قراءة النص بالصوت
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  // مكون الرسالة
  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        {/* أيقونة المرسل */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.type === 'user' 
            ? 'bg-blue-600 text-white' 
            : message.isError 
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-blue-600'
        }`}>
          {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* محتوى الرسالة */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
          message.type === 'user'
            ? 'bg-blue-600 text-white'
            : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-white text-gray-800 border border-gray-200'
        }`}>
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          
          {/* معلومات إضافية للذكاء الاصطناعي */}
          {message.type === 'ai' && !message.isError && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              {message.confidence && (
                <Badge variant="secondary" className="text-xs">
                  {language === 'ar' ? 'الثقة' : 'Confidence'}: {Math.round(message.confidence * 100)}%
                </Badge>
              )}
              {message.intent && (
                <Badge variant="outline" className="text-xs">
                  {message.intent}
                </Badge>
              )}
            </div>
          )}

          {/* أدوات الرسالة */}
          {message.type === 'ai' && !message.isError && (
            <div className="mt-2 flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <Copy size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {language === 'ar' ? 'نسخ' : 'Copy'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(message.content)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    >
                      <Volume2 size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {language === 'ar' ? 'استماع' : 'Listen'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* الاقتراحات السريعة */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => useSuggestion(suggestion)}
                  className="text-xs h-7 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // مؤشر الكتابة
  const TypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="flex items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 text-blue-600 flex items-center justify-center">
          <Bot size={16} />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {language === 'ar' ? 'يكتب...' : 'Typing...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* زر فتح المحادثة */}
      {!isOpen && (
        <Button
          onClick={onToggle}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-50 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle size={24} />
        </Button>
      )}

      {/* نافذة المحادثة */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] z-50 shadow-2xl border-0 bg-white rounded-xl overflow-hidden">
          {/* رأس النافذة */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    {language === 'ar' ? 'مساعد CopRRA الذكي' : 'CopRRA AI Assistant'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    {language === 'ar' ? 'متصل الآن' : 'Online now'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>
          </CardHeader>

          {/* منطقة المحادثة */}
          <CardContent className="flex flex-col h-[calc(100%-140px)] p-0">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message, index) => (
                <MessageBubble key={index} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* منطقة الإدخال */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message...'}
                  className="flex-1 border-gray-300 focus:border-blue-500"
                  disabled={isLoading}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                >
                  {isLoading ? <Loader className="animate-spin" size={16} /> : <Send size={16} />}
                </Button>
              </div>
              
              {/* نص مساعد */}
              <p className="text-xs text-gray-500 mt-2 text-center">
                {language === 'ar' 
                  ? 'مدعوم بالذكاء الاصطناعي - احترف في مقارنة الأسعار'
                  : 'Powered by AI - Your smart price comparison expert'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AIChatbot;