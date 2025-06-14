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
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #f0f9ff, #e0e7ff, #faf5ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <EnhancedCard style={{ padding: '32px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div className="loading-enhanced" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
          <p className="heading-enhanced" style={{ fontSize: '18px' }}>{t('loading')}</p>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f0f9ff, #e0e7ff, #faf5ff)',
      transition: 'all 0.5s ease',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <AppHeader
        onClearMessages={handleClearMessages}
        activeTab={activeTab}
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 0%',
        minHeight: 0,
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        overflow: 'hidden'
      }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%', minHeight: 0 }}>
          <TabsList className="glass-card-enhanced" style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            width: '100%',
            height: 'auto'
          }}>
            <TabsTrigger 
              value="chat" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                flexDirection: isRTL ? 'row-reverse' : 'row'
              }}
            >
              <Bot style={{ height: '20px', width: '20px' }} />
              <span>{t('chat')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meals" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                flexDirection: isRTL ? 'row-reverse' : 'row'
              }}
            >
              <Utensils style={{ height: '20px', width: '20px' }} />
              <span>{t('meals')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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

          <TabsContent value="meals" style={{ flex: '1 1 0%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 0%', minHeight: 0 }}>
              <MealPlannerTab />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
