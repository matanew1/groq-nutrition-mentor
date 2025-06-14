
import React from 'react';
import { Bot, User } from 'lucide-react';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
import { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  getDirection: (text: string) => 'rtl' | 'ltr';
  getAlignment: (text: string, sender: 'user' | 'bot') => string;
  formatTime: (date: Date) => string;
  t: (key: string) => string;
}

export const MessageBubble = ({ message, getDirection, getAlignment, formatTime, t }: MessageBubbleProps) => {
  const direction = getDirection(message.content);
  const alignment = getAlignment(message.content, message.sender);

  return (
    <div
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
};
