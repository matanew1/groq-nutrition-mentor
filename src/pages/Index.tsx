import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Apple, Heart, Zap, LogOut, Trash2, Utensils, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { callGroqAPI } from '@/utils/groqApi';
import { searchNutrition } from '@/utils/nutritionixApi';
import { addEmojisToMessage, isHebrew } from '@/utils/messageFormatter';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import SettingsDialog from '@/components/SettingsDialog';
import MealPlannerTab from '@/components/MealPlannerTab';

const Index = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut, loading: authLoading } = useAuth();
  const { messages, loading: messagesLoading, addMessage, clearMessages } = useMessages();
  const { t, language, userName } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if current language is Hebrew for RTL layout
  const isRTL = language === 'he';

  // Helper to determine direction per message
  const getDirection = (text: string) => (isHebrew(text) ? 'rtl' : 'ltr');
  const getAlignment = (text: string, sender: 'user' | 'bot') => {
    const isHebrewMsg = isHebrew(text);
    if (sender === 'user') {
      return isHebrewMsg ? 'justify-end' : 'justify-start';
    } else {
      return isHebrewMsg ? 'justify-start' : 'justify-end';
    }
  };

  // Apply dark mode and RTL direction to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    if (isRTL) {
      document.documentElement.classList.add('font-hebrew');
    } else {
      document.documentElement.classList.remove('font-hebrew');
    }
  }, [isDarkMode, isRTL]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('success'),
        description: "You have been signed out successfully.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClearMessages = async () => {
    try {
      await clearMessages();
      toast({
        title: t('success'),
        description: "All your chat history has been cleared.",
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    await addMessage({
      content: inputValue,
      sender: 'user'
    });

    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const foodKeywords = ['nutrition', 'calories', 'protein', 'carbs', 'fat', 'nutrients', 'food'];
      const isNutritionQuery = foodKeywords.some(keyword => 
        currentInput.toLowerCase().includes(keyword)
      );

      let nutritionData = null;
      let contextualInfo = '';

      if (isNutritionQuery) {
        try {
          nutritionData = await searchNutrition(currentInput);
          if (nutritionData && nutritionData.foods && nutritionData.foods.length > 0) {
            const food = nutritionData.foods[0];
            contextualInfo = `\n\nNutrition data found for ${food.food_name}:
            - Calories: ${food.nf_calories}
            - Protein: ${food.nf_protein}g
            - Carbs: ${food.nf_total_carbohydrate}g
            - Fat: ${food.nf_total_fat}g
            - Fiber: ${food.nf_dietary_fiber}g
            - Sugar: ${food.nf_sugars}g`;
          }
        } catch (error) {
          console.log('Nutritionix API call failed, continuing with AI response only');
        }
      }

      const isHebrewMessage = isHebrew(currentInput);
      
      const aiPrompt = `You are a professional nutrition mentor and health coach. Please provide helpful, accurate nutrition advice. 
      ${isHebrewMessage ? 'Please respond in Hebrew as the user wrote in Hebrew.' : ''}
      User question: "${currentInput}"
      ${contextualInfo ? `Additional nutrition data context: ${contextualInfo}` : ''}
      
      Please provide a helpful, professional response about nutrition, health, or wellness.`;

      const aiResponse = await callGroqAPI(aiPrompt);
      const enhancedResponse = addEmojisToMessage(aiResponse);

      await addMessage({
        content: enhancedResponse,
        sender: 'bot',
        nutritionData: nutritionData
      });

    } catch (error) {
      console.error('Error getting response:', error);
      toast({
        title: t('error'),
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      await addMessage({
        content: "❌ I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show loading state while checking authentication
  if (authLoading || messagesLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Mobile menu component
  const MobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side={isRTL ? "left" : "right"} className="w-64 p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
              <Apple className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg">{t('nutrimentor')}</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                <Heart className="h-3 w-3 mr-1" />
                Health
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                <Zap className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <LanguageToggle />
              <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
              <SettingsDialog />
            </div>
            
            {user && (
              <div className="space-y-2">
                {userName && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t('welcome')}, {userName}
                  </p>
                )}
                {activeTab === 'chat' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleClearMessages();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('clearChat')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('signOut')}
                </Button>
              </div>
            )}
            
            {!user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate('/auth');
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                {t('signIn')}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className={`h-screen w-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col ${isRTL ? 'hebrew-text' : ''}`}>
      {/* Enhanced Header - Mobile optimized */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-green-100 dark:border-gray-700 shrink-0 shadow-sm">
        <div className="h-14 sm:h-16 px-3 sm:px-4 flex items-center">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 sm:space-x-3 flex-1 min-w-0`}>
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg">
              <Apple className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent truncate">
                {t('nutrimentor')}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {t('subtitle')}
              </p>
            </div>
            
            {/* Desktop controls */}
            <div className="hidden lg:flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs">
                <Heart className="h-3 w-3 mr-1" />
                Health
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs">
                <Zap className="h-3 w-3 mr-1" />
                AI
              </Badge>
              
              <LanguageToggle />
              <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
              <SettingsDialog />
              
              {user ? (
                <div className="flex items-center space-x-2">
                  {userName && (
                    <span className="text-sm text-gray-600 dark:text-gray-300 max-w-24 truncate">
                      {t('welcome')}, {userName}
                    </span>
                  )}
                  {activeTab === 'chat' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearMessages}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="text-xs px-3 py-1"
                >
                  {t('signIn')}
                </Button>
              )}
            </div>
            
            {/* Mobile menu trigger */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "left" : "right"} className="w-72 p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
                        <Apple className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-lg">{t('nutrimentor')}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          <Heart className="h-3 w-3 mr-1" />
                          Health
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          <Zap className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <LanguageToggle />
                        <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
                        <SettingsDialog />
                      </div>
                      
                      {user && (
                        <div className="space-y-2">
                          {userName && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {t('welcome')}, {userName}
                            </p>
                          )}
                          {activeTab === 'chat' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                handleClearMessages();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full justify-start"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('clearChat')}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleSignOut();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            {t('signOut')}
                          </Button>
                        </div>
                      )}
                      
                      {!user && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate('/auth');
                            setMobileMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          {t('signIn')}
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Enhanced Tabs */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b h-12 sm:h-auto bg-white/50 dark:bg-gray-800/50">
            <TabsTrigger value="chat" className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-3`}>
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('chat')}</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1 sm:space-x-2 text-xs sm:text-sm py-2 sm:py-3`}>
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('meals')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
            {/* Enhanced Chat Messages */}
            <Card className="flex-1 border-0 rounded-none shadow-none bg-transparent overflow-hidden">
              <ScrollArea className="h-full p-3 sm:p-4">
                <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                  {messages.map((message) => {
                    const direction = getDirection(message.content);
                    const alignment = getAlignment(message.content, message.sender);
                    return (
                      <div
                        key={message.id}
                        className={`flex ${alignment}`}
                        dir={direction}
                      >
                        <div
                          className={`flex items-start space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-[80%] ${
                            message.sender === 'user'
                              ? (direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'flex-row')
                              : (direction === 'rtl' ? 'flex-row' : 'flex-row-reverse space-x-reverse')
                          }`}
                        >
                          <div
                            className={`p-2 sm:p-2.5 rounded-full shadow-lg flex-shrink-0 ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                : 'bg-gradient-to-r from-green-500 to-blue-500'
                            }`}
                          >
                            {message.sender === 'user' ? (
                              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            ) : (
                              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            )}
                          </div>
                          <div
                            className={`p-3 sm:p-4 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100'
                            } ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                            dir={direction}
                          >
                            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                            {message.nutritionData && message.nutritionData.foods && (
                              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700" dir={direction}>
                                <h4 className={`font-semibold text-green-800 dark:text-green-300 mb-2 sm:mb-3 flex items-center text-sm sm:text-base ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                                  🍎 {t('nutritionFacts')}
                                </h4>
                                {message.nutritionData.foods.slice(0, 1).map((food: any, index: number) => (
                                  <div key={index} className="text-sm sm:text-base text-green-700 dark:text-green-300">
                                    <p className="font-medium mb-2">{food.food_name}</p>
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                      <span className="flex items-center">🔥 {Math.round(food.nf_calories)} {t('calories')}</span>
                                      <span className="flex items-center">💪 {Math.round(food.nf_protein)}g {t('protein')}</span>
                                      <span className="flex items-center">🌾 {Math.round(food.nf_total_carbohydrate)}g {t('carbs')}</span>
                                      <span className="flex items-center">🧈 {Math.round(food.nf_total_fat)}g {t('fat')}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs opacity-70 mt-2 sm:mt-3">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-2 sm:space-x-3`}>
                        <div className="p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 shadow-lg">
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 sm:p-4 rounded-2xl shadow-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </Card>

            {/* Enhanced Chat Input */}
            <Card className="border-0 rounded-none shadow-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shrink-0 border-t border-gray-200 dark:border-gray-700">
              <div className="p-3 sm:p-4 max-w-4xl mx-auto">
                <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2 sm:space-x-3`}>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('typeMessage')}
                    className="flex-1 border-gray-200 dark:border-gray-600 focus:border-green-400 focus:ring-green-400 dark:bg-gray-700 dark:text-white h-11 sm:h-12 text-sm sm:text-base rounded-xl"
                    disabled={isLoading}
                    dir={isHebrew(inputValue) ? 'rtl' : 'ltr'}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[44px] sm:min-w-[48px] h-11 sm:h-12 px-3 sm:px-4 rounded-xl"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="flex-1 m-0 p-0 overflow-hidden">
            <Card className="h-full border-0 rounded-none shadow-none bg-transparent overflow-hidden">
              <MealPlannerTab />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;