
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCard, EnhancedCardContent } from '@/components/ui/EnhancedCard';
import { useToast } from '@/hooks/use-toast';
import { callGroqAPI } from '@/utils/groqApi';
import { searchNutrition } from '@/utils/nutritionixApi';
import { addEmojisToMessage, isHebrew } from '@/utils/messageFormatter';
import { useMessages } from '@/hooks/useMessages';
import { useSettings } from '@/contexts/SettingsContext';
import MealPlannerTab from '@/components/MealPlannerTab';
import { AppHeader } from '@/components/layout/AppHeader';
import { ChatTab } from '@/components/chat/ChatTab';

const Index = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading: messagesLoading, addMessage, clearMessages } = useMessages();
  const { t, language } = useSettings();
  const { toast } = useToast();

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
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    if (isRTL) {
      document.documentElement.classList.add('font-hebrew');
    } else {
      document.documentElement.classList.remove('font-hebrew');
    }
  }, [isRTL]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <EnhancedCard className="p-6 sm:p-8 text-center max-w-sm w-full">
          <div className="loading-enhanced mb-4 flex-center">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <p className="heading-enhanced text-base sm:text-lg">{t('loading')}</p>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-all duration-500 ${isRTL ? 'hebrew-text' : ''}`}>
      <AppHeader
        onClearMessages={handleClearMessages}
        activeTab={activeTab}
      />

      <div className="flex-1 max-w-7xl mx-auto p-2 sm:p-4 w-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 glass-card-enhanced p-1 sm:p-2 h-auto">
            <TabsTrigger 
              value="chat" 
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all text-sm sm:text-base`}
            >
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('chat')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meals" 
              className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-all text-sm sm:text-base`}
            >
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('meals')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col min-h-0">
            <ChatTab
              messages={messages}
              isLoading={isLoading}
              isRTL={isRTL}
              getDirection={getDirection}
              getAlignment={getAlignment}
              formatTime={formatTime}
              t={t}
              messagesEndRef={messagesEndRef}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSendMessage={handleSendMessage}
            />
          </TabsContent>

          <TabsContent value="meals" className="flex-1 min-h-0">
            <EnhancedCard className="h-full overflow-y-auto">
              <EnhancedCardContent className="p-2 sm:p-6">
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
