
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Apple, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { callGroqAPI } from '@/utils/groqApi';
import { searchNutrition } from '@/utils/nutritionixApi';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  nutritionData?: any;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your personal nutrition mentor. I can help you with meal planning, nutritional analysis, calorie counting, and healthy eating advice. Try asking me about the nutrition facts of any food or for meal suggestions!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if the message is asking about specific food nutrition
      const foodKeywords = ['nutrition', 'calories', 'protein', 'carbs', 'fat', 'nutrients', 'food'];
      const isNutritionQuery = foodKeywords.some(keyword => 
        inputValue.toLowerCase().includes(keyword)
      );

      let nutritionData = null;
      let contextualInfo = '';

      // If it's a nutrition query, try to get nutrition data
      if (isNutritionQuery) {
        try {
          nutritionData = await searchNutrition(inputValue);
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

      // Get AI response with context
      const aiPrompt = `You are a professional nutrition mentor and health coach. Please provide helpful, accurate nutrition advice. 
      User question: "${inputValue}"
      ${contextualInfo ? `Additional nutrition data context: ${contextualInfo}` : ''}
      
      Please provide a helpful, professional response about nutrition, health, or wellness.`;

      const aiResponse = await callGroqAPI(aiPrompt);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        nutritionData: nutritionData
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full">
              <Apple className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                NutriMentor AI
              </h1>
              <p className="text-sm text-gray-600">Your Personal Nutrition Assistant</p>
            </div>
            <div className="flex-1" />
            <div className="flex space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <Heart className="h-3 w-3 mr-1" />
                Health
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                <Zap className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-120px)] flex flex-col">
        {/* Messages */}
        <Card className="flex-1 mb-4 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gradient-to-r from-green-500 to-blue-500'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.nutritionData && message.nutritionData.foods && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-2">Nutrition Facts</h4>
                          {message.nutritionData.foods.slice(0, 1).map((food: any, index: number) => (
                            <div key={index} className="text-sm text-green-700">
                              <p className="font-medium">{food.food_name}</p>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <span>Calories: {Math.round(food.nf_calories)}</span>
                                <span>Protein: {Math.round(food.nf_protein)}g</span>
                                <span>Carbs: {Math.round(food.nf_total_carbohydrate)}g</span>
                                <span>Fat: {Math.round(food.nf_total_fat)}g</span>
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
                    <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </Card>

        {/* Input */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about nutrition, calories, meal planning, or healthy recipes..."
                className="flex-1 border-gray-200 focus:border-green-400 focus:ring-green-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Try asking: "What's the nutrition in 1 cup of rice?" or "Give me a healthy breakfast idea"
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
