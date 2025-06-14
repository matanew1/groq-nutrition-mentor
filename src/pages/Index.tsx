import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Apple, Heart, Zap, LogOut, Trash2, Calendar, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCard, EnhancedCardContent } from '@/components/ui/EnhancedCard';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { messages, loading: messagesLoading, addMessage, clearMessages } = useMessages();
  const { t, language, userName } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isRTL = language === 'he';

  const getDirection = (text: string) => (isHebrew(text) ? 'rtl' : 'ltr');
  const getAlignment = (text: string, sender: 'user' | 'bot') => {
    const isHebrewMsg = isHebrew(text);
    if (sender === 'user') {
      return isHebrewMsg ? 'justify-end' : 'justify-start';
    } else {
      return isHebrewMsg ? 'justify-start' : 'justify-end';
    }
  };

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

  if (messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center">
        <EnhancedCard className="p-8 text-center">
          <div className="loading-enhanced mb-4">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <p className="heading-enhanced text-lg">{t('loading')}</p>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500 ${isRTL ? 'hebrew-text' : ''}`}>
      {/* Enhanced Header */}
      <div className="glass-card-enhanced backdrop-blur-xl border-0 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Apple className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="heading-enhanced text-2xl sm:text-3xl font-bold truncate">
                {t('nutrimentor')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                {t('subtitle')}
              </p>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
              <EnhancedBadge variant="success">
                <Heart className="h-3 w-3" />
                <span className="hidden sm:inline">Health</span>
              </EnhancedBadge>
              <EnhancedBadge variant="default">
                <Zap className="h-3 w-3" />
                <span className="hidden sm:inline">AI</span>
              </EnhancedBadge>
              
              <LanguageToggle />
              <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
              <SettingsDialog />
              
              {user ? (
                <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                  {userName && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                      {t('welcome')}, {userName}
                    </span>
                  )}
                  {activeTab === 'chat' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearMessages}
                      className="p-2 rounded-xl hover:bg-white/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="p-2 rounded-xl hover:bg-white/20"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <EnhancedButton
                  size="sm"
                  onClick={() => navigate('/auth')}
                >
                  {t('signIn')}
                </EnhancedButton>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-7xl mx-auto p-4 h-[calc(100vh-100px)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-6 glass-card-enhanced p-2 h-auto">
            <TabsTrigger 
              value="chat" 
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 py-3 px-6 rounded-xl font-semibold transition-all`}
            >
              <Bot className="h-5 w-5" />
              <span>{t('chat')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meals" 
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 py-3 px-6 rounded-xl font-semibold transition-all`}
            >
              <Utensils className="h-5 w-5" />
              <span>{t('meals')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col space-y-6">
            {/* Enhanced Chat Messages */}
            <EnhancedCard className="flex-1">
              <ScrollArea className="h-full p-6 scroll-enhanced">
                <div className="space-y-6">
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
                          className={`flex items-start space-x-3 max-w-[80%] ${
                            message.sender === 'user'
                              ? (direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3')
                              : (direction === 'rtl' ? 'flex-row space-x-3' : 'flex-row-reverse space-x-reverse')
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full shadow-lg flex-shrink-0 ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                : 'bg-gradient-to-br from-emerald-500 to-blue-500'
                            }`}
                          >
                            {message.sender === 'user' ? (
                              <User className="h-4 w-4 text-white" />
                            ) : (
                              <Bot className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div
                            className={`${
                              message.sender === 'user'
                                ? 'message-bubble-user'
                                : 'message-bubble-bot'
                            }`}
                            dir={direction}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium break-words">
                              {message.content}
                            </p>
                            {message.nutritionData && message.nutritionData.foods && (
                              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-700" dir={direction}>
                                <h4 className={`font-semibold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                                  🍎 {t('nutritionFacts')}
                                </h4>
                                {message.nutritionData.foods.slice(0, 1).map((food: any, index: number) => (
                                  <div key={index} className="text-sm text-emerald-700 dark:text-emerald-300">
                                    <p className="font-medium mb-2">{food.food_name}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <EnhancedBadge variant="default">🔥 {Math.round(food.nf_calories)} {t('calories')}</EnhancedBadge>
                                      <EnhancedBadge variant="default">💪 {Math.round(food.nf_protein)}g {t('protein')}</EnhancedBadge>
                                      <EnhancedBadge variant="default">🌾 {Math.round(food.nf_total_carbohydrate)}g {t('carbs')}</EnhancedBadge>
                                      <EnhancedBadge variant="default">🧈 {Math.round(food.nf_total_fat)}g {t('fat')}</EnhancedBadge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className={`text-xs opacity-60 mt-3 ${direction === 'rtl' ? 'text-left' : 'text-right'}`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                      <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                        <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="message-bubble-bot">
                          <div className="loading-enhanced">
                            <div className="loading-dot" />
                            <div className="loading-dot" />
                            <div className="loading-dot" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </EnhancedCard>

            {/* Enhanced Chat Input */}
            <EnhancedCard>
              <EnhancedCardContent className="p-6">
                <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
                  <EnhancedInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('typeMessage')}
                    className="flex-1"
                    disabled={isLoading}
                    dir={isHebrew(inputValue) ? 'rtl' : 'ltr'}
                  />
                  <EnhancedButton
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    loading={isLoading}
                    className="px-6"
                  >
                    <Send className="h-4 w-4" />
                  </EnhancedButton>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  {user ? 'Your messages are automatically saved to your account' : 'Sign in to save your chat history'}
                </p>
              </EnhancedCardContent>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="meals" className="flex-1">
            <EnhancedCard className="h-full overflow-auto">
              <EnhancedCardContent className="p-6">
                <MealPlannerTab />
              </EnhancedCardContent>
            </EnhancedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
