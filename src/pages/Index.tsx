
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Apple, Heart, Zap, LogOut, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { callGroqAPI } from '@/utils/groqApi';
import { searchNutrition } from '@/utils/nutritionixApi';
import { addEmojisToMessage, isHebrew } from '@/utils/messageFormatter';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from '@/components/DarkModeToggle';

const Index = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { messages, loading: messagesLoading, addMessage, clearMessages } = useMessages();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleClearMessages = async () => {
    try {
      await clearMessages();
      toast({
        title: "Messages cleared",
        description: "All your chat history has been cleared.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
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
      // Check if the message is asking about specific food nutrition
      const foodKeywords = ['nutrition', 'calories', 'protein', 'carbs', 'fat', 'nutrients', 'food'];
      const isNutritionQuery = foodKeywords.some(keyword => 
        currentInput.toLowerCase().includes(keyword)
      );

      let nutritionData = null;
      let contextualInfo = '';

      // If it's a nutrition query, try to get nutrition data
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

      // Detect if user message is in Hebrew
      const isHebrewMessage = isHebrew(currentInput);
      
      // Get AI response with context
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
        title: "Error",
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
  if (messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header - Mobile Optimized */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-green-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
              <Apple className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent truncate">
                NutriMentor AI
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">Your Personal Nutrition Assistant</p>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Health</span>
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">AI</span>
              </Badge>
              <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
              
              {user ? (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearMessages}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
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
                  className="text-xs px-2 py-1"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container - Mobile Optimized */}
      <div className="max-w-4xl mx-auto p-2 sm:p-4 h-[calc(100vh-80px)] sm:h-[calc(100vh-120px)] flex flex-col">
        {/* Messages */}
        <Card className="flex-1 mb-2 sm:mb-4 border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-colors duration-300">
          <ScrollArea className="h-full p-2 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[85%] sm:max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`p-1.5 sm:p-2 rounded-full shadow-lg flex-shrink-0 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gradient-to-r from-green-500 to-blue-500'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      ) : (
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`p-3 sm:p-4 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100'
                      } ${isHebrew(message.content) ? 'text-right' : 'text-left'}`}
                      dir={isHebrew(message.content) ? 'rtl' : 'ltr'}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium break-words">
                        {message.content}
                      </p>
                      {message.nutritionData && message.nutritionData.foods && (
                        <div className="mt-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center text-sm">
                            🍎 Nutrition Facts
                          </h4>
                          {message.nutritionData.foods.slice(0, 1).map((food: any, index: number) => (
                            <div key={index} className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                              <p className="font-medium">{food.food_name}</p>
                              <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1">
                                <span>🔥 {Math.round(food.nf_calories)} cal</span>
                                <span>💪 {Math.round(food.nf_protein)}g protein</span>
                                <span>🌾 {Math.round(food.nf_total_carbohydrate)}g carbs</span>
                                <span>🧈 {Math.round(food.nf_total_fat)}g fat</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs opacity-60 mt-2">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="p-1.5 sm:p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 shadow-lg">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-xl shadow-md">
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

        {/* Input - Mobile Optimized */}
        <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm transition-colors duration-300">
          <div className="p-2 sm:p-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about nutrition, calories, meal planning..."
                className="flex-1 border-gray-200 dark:border-gray-600 focus:border-green-400 focus:ring-green-400 dark:bg-gray-700 dark:text-white transition-colors duration-200 text-sm sm:text-base"
                disabled={isLoading}
                dir={isHebrew(inputValue) ? 'rtl' : 'ltr'}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 px-3 sm:px-4 min-w-[44px] h-10 sm:h-11"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
              <span className="sm:hidden">Ask about nutrition, calories, or healthy recipes</span>
              <span className="hidden sm:inline">
                {user ? 'Your messages are automatically saved to your account' : 'Sign in to save your chat history'} | 
                Try asking: "What's the nutrition in 1 cup of rice?" or "Give me a healthy breakfast idea" | נסה לשאול: "מה התזונה בכוס אורז?" או "תן לי רעיון לארוחת בוקר בריאה"
              </span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
