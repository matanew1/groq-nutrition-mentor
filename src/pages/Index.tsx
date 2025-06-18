
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Utensils } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { callGroqAPI } from '@/utils/groqApi';
import { searchNutrition } from '@/utils/nutritionixApi';
import { addEmojisToMessage, isHebrew } from '@/utils/messageFormatter';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useSettings } from '@/hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import MealPlannerTab from '@/components/MealPlannerTab';
import AppHeader from '@/components/AppHeader';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  
  // Listen for language change events to force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      // This just forces a state change to trigger re-render
      setIsLoading(isLoading => {
        setTimeout(() => setIsLoading(isLoading), 0);
        return isLoading;
      });
    };
    
    document.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

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
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
    } catch (error: unknown) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
      // More comprehensive list of nutrition-related keywords in multiple languages
      const foodKeywords = [
        // English keywords
        'nutrition', 'calories', 'protein', 'carbs', 'fat', 'nutrients', 'food', 'diet', 
        'meal', 'eating', 'weight', 'healthy', 'vitamin', 'mineral', 'fiber', 'sugar',
        'breakfast', 'lunch', 'dinner', 'snack', 'portion', 'serving',
        // Hebrew keywords
        'קלוריות', 'תזונה', 'חלבון', 'פחמימות', 'שומן', 'אוכל', 'דיאטה', 'ארוחה', 'משקל',
        'בריאות', 'ויטמין', 'מינרל', 'סיבים', 'סוכר', 'ארוחת בוקר', 'ארוחת צהריים', 
        'ארוחת ערב', 'נתרן', 'מלח', 'כולסטרול', 'ערך תזונתי', 'רכיבים תזונתיים',
        'אכלתי', 'אוכל', 'ירקות', 'פירות', 'מנה', 'כמות', 'גרם', 'קילו'
      ];
      
      // Check if query contains nutrition-related words
      const wordsInQuery = currentInput.toLowerCase().split(/\s+/);
      const queryWords = new Set(wordsInQuery);
      const isNutritionQuery = foodKeywords.some(keyword => 
        currentInput.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Check if query is specifically asking about food
      const englishFoodPhrasePatterns = [
        /(?:calories|nutrition|nutrients|macros|protein|carbs|fat)\s+(?:in|of|for)\s+(.+?)(?:$|\?|\.)/i,
        /(?:how many calories|how much protein|how many carbs|nutritional value)\s+(?:in|of|for)\s+(.+?)(?:$|\?|\.)/i,
        /(?:what is|tell me about)\s+(?:the nutrition|the calories|the protein|the carbs)\s+(?:in|of|for)\s+(.+?)(?:$|\?|\.)/i,
        /(?:what are|how many)\s+(?:the nutrition facts|calories)\s+(?:in|of)\s+(.+?)(?:$|\?|\.)/i,
        /(?:i ate|i had|i consumed)\s+(.+?)(?:$|\?|\.|,)/i,
      ];
      
      // Hebrew patterns for food queries - expanded
      const hebrewFoodPhrasePatterns = [
        /(?:קלוריות|תזונה|חלבון|פחמימות|שומן)\s+(?:של|ב|עבור)\s+(.+?)(?:$|\?|\.)/i,
        /(?:כמה קלוריות|כמה חלבון|כמה פחמימות|ערך תזונתי)\s+(?:יש ב|של|עבור)\s+(.+?)(?:$|\?|\.)/i,
        /(?:מה הן|ספר לי על)\s+(?:הקלוריות|התזונה|החלבון|הפחמימות)\s+(?:של|ב)\s+(.+?)(?:$|\?|\.)/i,
        /(?:אכלתי|אני אוכל|צרכתי)\s+(.+?)(?:$|\?|\.|,)/i,
      ];

      let extractedFood = null;
      let nutritionData = null;

      // Try to extract food from English patterns
      for (const pattern of englishFoodPhrasePatterns) {
        const match = currentInput.match(pattern);
        if (match && match[1]) {
          extractedFood = match[1].trim();
          break;
        }
      }

      // If no English match, try Hebrew patterns
      if (!extractedFood) {
        for (const pattern of hebrewFoodPhrasePatterns) {
          const match = currentInput.match(pattern);
          if (match && match[1]) {
            extractedFood = match[1].trim();
            break;
          }
        }
      }

      // If we found a food item or it's a nutrition query, search for nutrition data
      if (extractedFood || isNutritionQuery) {
        const searchTerm = extractedFood || currentInput;
        console.log('Searching nutrition for:', searchTerm);
        
        try {
          nutritionData = await searchNutrition(searchTerm);
          console.log('Nutrition data found:', nutritionData);
        } catch (nutritionError) {
          console.error('Nutrition search failed:', nutritionError);
        }
      }

      // Get AI response with context about nutrition data
      let contextPrompt = currentInput;
      if (nutritionData?.foods?.length > 0) {
        const foodInfo = nutritionData.foods[0];
        contextPrompt += `\n\nNutrition data found: ${foodInfo.food_name} contains ${Math.round(foodInfo.nf_calories)} calories, ${Math.round(foodInfo.nf_protein)}g protein, ${Math.round(foodInfo.nf_total_carbohydrate)}g carbs, ${Math.round(foodInfo.nf_total_fat)}g fat per serving.`;
      }

      const response = await callGroqAPI(contextPrompt, language, userName);
      const formattedResponse = addEmojisToMessage(response);

      await addMessage({
        content: formattedResponse,
        sender: 'bot',
        nutritionData: nutritionData
      });

    } catch (error: unknown) {
      console.error('Error in handleSendMessage:', error);
      await addMessage({
        content: language === 'he' 
          ? 'סליחה, אירעה שגיאה. אנא נסה שוב מאוחר יותר.' 
          : 'Sorry, there was an error. Please try again later.',
        sender: 'bot'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || messagesLoading) {
    return <LoadingSpinner text={language === 'he' ? 'טוען...' : 'Loading...'} />;
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col overflow-hidden">
      <AppHeader
        language={language}
        isRTL={isRTL}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={user}
        userName={userName}
        activeTab={activeTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleClearMessages={handleClearMessages}
        handleSignOut={handleSignOut}
        onNavigateToAuth={() => navigate('/auth')}
        t={t}
      />

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-2 sm:mx-3 md:mx-4 lg:mx-6 mt-2 sm:mt-3 md:mt-4 grid w-auto grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm shrink-0">
            <TabsTrigger 
              value="chat" 
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <Bot className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span>{t('chatTab')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="meal-planner" 
              className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              <Utensils className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              <span>{t('mealPlannerTab')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0 p-0">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              t={t}
            />
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isRTL={isRTL}
              t={t}
            />
          </TabsContent>

          <TabsContent value="meal-planner" className="flex-1 overflow-hidden mt-0 p-0">
            <MealPlannerTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
