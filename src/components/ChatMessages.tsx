import React from 'react';
import { Bot, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isHebrew } from '@/utils/messageFormatter';

interface FoodItem {
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
  nf_dietary_fiber: number;
  nf_calories: number;
  food_name: string;
  nf_sugars?: number;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  nutritionData?: {
    foods: FoodItem[];
  };
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  t: (key: string) => string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  messagesEndRef,
  t
}) => {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      <Card className="flex-1 border-0 rounded-none shadow-none bg-transparent overflow-hidden">
        <ScrollArea className="h-[calc(100vh-180px)] xs:h-[calc(100vh-190px)] sm:h-[calc(100vh-200px)] md:h-[calc(100vh-210px)] lg:h-[calc(100vh-220px)] w-full">
          <div className="p-1 sm:p-2 md:p-3 lg:p-4">
            <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 max-w-[95%] xs:max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
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
                      className={`flex items-start space-x-1 xs:space-x-1.5 sm:space-x-2 md:space-x-3 max-w-[95%] xs:max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] ${
                        message.sender === 'user'
                          ? (direction === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'flex-row')
                          : (direction === 'rtl' ? 'flex-row' : 'flex-row-reverse space-x-reverse')
                      }`}
                    >
                      <div
                        className={`p-1 xs:p-1.5 sm:p-2 rounded-full shadow-lg flex-shrink-0 ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                            : 'bg-gradient-to-r from-green-500 to-blue-500'
                        }`}
                      >
                        {message.sender === 'user' ? (
                          <User className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                        ) : (
                          <Bot className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                        )}
                      </div>
                      <div
                        className={`p-1.5 xs:p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100'
                        } ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                        dir={direction}
                      >
                        <p className="text-xs xs:text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        {message.nutritionData && message.nutritionData.foods && (
                          <div className="mt-1.5 xs:mt-2 sm:mt-2.5 md:mt-3 lg:mt-4 p-1.5 xs:p-2 sm:p-2.5 md:p-3 lg:p-4 bg-green-50 dark:bg-green-900/30 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-700" dir={direction}>
                            <h4 className={`font-semibold text-green-800 dark:text-green-300 mb-1 xs:mb-1.5 sm:mb-2 md:mb-3 flex items-center text-xs sm:text-sm md:text-base ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                              🍎 {t('nutritionFacts')}
                            </h4>
                            {message.nutritionData.foods.slice(0, 1).map((food: FoodItem, index: number) => (
                              <div key={index} className="text-xs sm:text-sm md:text-base text-green-700 dark:text-green-300">
                                <p className="font-medium mb-1 xs:mb-1.5 sm:mb-2 truncate">{food.food_name}</p>
                                <div className="grid grid-cols-2 gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 text-xs sm:text-sm">
                                  <span className="flex items-center truncate">🔥 {Math.round(food.nf_calories)} {t('calories')}</span>
                                  <span className="flex items-center truncate">💪 {Math.round(food.nf_protein)}g {t('protein')}</span>
                                  <span className="flex items-center truncate">🌾 {Math.round(food.nf_total_carbohydrate)}g {t('carbs')}</span>
                                  <span className="flex items-center truncate">🧈 {Math.round(food.nf_total_fat)}g {t('fat')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] xs:text-xs opacity-70 mt-1 xs:mt-1.5 sm:mt-2 md:mt-3">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-1 xs:space-x-1.5 sm:space-x-2 md:space-x-3">
                    <div className="p-1 xs:p-1.5 sm:p-2 md:p-2.5 rounded-full bg-gradient-to-r from-green-500 to-blue-500 shadow-lg">
                      <Bot className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-1.5 xs:p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ChatMessages;
