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
import { useScreenSize } from '@/hooks/use-screen-size';
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
  const { isMobile, isTablet } = useScreenSize();

  // Check if current language is Hebrew for RTL layout
  const isRTL = language === 'he';
  
  // Simplified screen size check for component adjustments
  const isSmallScreen = isMobile || isTablet;

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
      setIsLoading(prev => {
        setTimeout(() => setIsLoading(prev), 0);
        return prev;
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

  const onNavigateToAuth = () => {
    navigate('/auth');
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
        /(?:קלוריות|תזונה|חלבון|פחמימות|שומן)\s+(?:של|ב|מ)\s+(.+?)(?:$|\?|\.)/i,
        /(?:כמה קלוריות|כמה חלבון|כמה פחמימות|ערך תזונתי)\s+(?:יש ב|יש ל|ב|של)\s+(.+?)(?:$|\?|\.)/i,
        /(?:מה|איך)\s+(?:הקלוריות|התזונה|החלבון|הפחמימות)\s+(?:של|ב)\s+(.+?)(?:$|\?|\.)/i,
        /(?:אכלתי|שתיתי|אכלתם)\s+(.+?)(?:$|\?|\.|,)/i,
      ];

      let foodItem = null;
      let nutritionData = null;

      // Check English patterns first
      for (const pattern of englishFoodPhrasePatterns) {
        const match = currentInput.match(pattern);
        if (match && match[1]) {
          foodItem = match[1].trim();
          console.log('English food item detected:', foodItem);
          break;
        }
      }

      // Check Hebrew patterns if no English match
      if (!foodItem) {
        for (const pattern of hebrewFoodPhrasePatterns) {
          const match = currentInput.match(pattern);
          if (match && match[1]) {
            foodItem = match[1].trim();
            console.log('Hebrew food item detected:', foodItem);
            break;
          }
        }
      }

      // If we found a food item or it's a nutrition-related query, try to get nutrition data
      if (foodItem || isNutritionQuery) {
        try {
          const searchTerm = foodItem || currentInput;
          console.log('Searching nutrition for:', searchTerm);
          nutritionData = await searchNutrition(searchTerm);
          console.log('Nutrition data received:', nutritionData);
        } catch (nutritionError) {
          console.log('Nutrition API failed, will use general AI response:', nutritionError);
        }
      }

      // Prepare context for the AI
      let contextualPrompt = currentInput;
      if (nutritionData && nutritionData.foods && nutritionData.foods.length > 0) {
        const food = nutritionData.foods[0];
        contextualPrompt = `User asked: "${currentInput}"\n\nNutrition data for ${food.food_name}:\n- Calories: ${food.nf_calories}\n- Protein: ${food.nf_protein}g\n- Carbs: ${food.nf_total_carbohydrate}g\n- Fat: ${food.nf_total_fat}g\n- Fiber: ${food.nf_dietary_fiber}g\n- Sugar: ${food.nf_sugars}g\n- Sodium: ${food.nf_sodium}mg\n\nPlease provide a helpful response about this food's nutrition in the same language the user used.`;
      }

      console.log('Sending to Groq API:', contextualPrompt);
      const response = await callGroqAPI(contextualPrompt);
      
      // Add emojis to the response
      const formattedResponse = addEmojisToMessage(response);
      
      await addMessage({
        content: formattedResponse,
        sender: 'bot'
      });

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      await addMessage({
        content: language === 'he' 
          ? "מצטער, אירעה שגיאה. אנא נסה שוב." 
          : "Sorry, there was an error. Please try again.",
        sender: 'bot'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || messagesLoading) {
    return <LoadingSpinner text={t('loading')} />;
  }

  return (
    <div className={`min-h-screen max-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col ${isRTL ? 'font-hebrew' : ''} overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
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
        onNavigateToAuth={onNavigateToAuth}
        t={t}
      />

      <main className="flex-1 flex flex-col overflow-hidden mx-auto w-full max-w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 ">
          <TabsList className="grid w-full grid-cols-2 max-w-[280px] sm:max-w-sm md:max-w-md mx-auto mt-5 sm:mt-2 md:mt-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg">
            <TabsTrigger value="chat" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-1.5 sm:py-2">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t('chat')}</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm py-1.5 sm:py-2">
              <Utensils className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t('mealPlanner')}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-col overflow-hidden mt-7 sm:mt-2 md:mt-4 px-1 sm:px-2 md:px-4">
            <div className="flex-1 flex flex-col min-h-0">
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
            </div>
          </TabsContent>
          
          <TabsContent value="planner" className="flex-1 mt-7 sm:mt-0 md:mt-0 px-1 sm:px-2 md:px-4">
            <MealPlannerTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
