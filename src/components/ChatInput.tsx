import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { isHebrew } from '@/utils/messageFormatter';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  isRTL: boolean;
  t: (key: string) => string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  isLoading,
  isRTL,
  t
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Card className="border-0 rounded-none shadow-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shrink-0 border-t border-gray-200 dark:border-gray-700">
      <div className="p-1.5 xs:p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-[95%] xs:max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1 xs:space-x-1.5 sm:space-x-2 md:space-x-3`}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('typeMessage')}
            className="flex-1 border-gray-200 dark:border-gray-600 focus:border-green-400 focus:ring-green-400 dark:bg-gray-700 dark:text-white h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 text-xs sm:text-sm md:text-base rounded-xl"
            disabled={isLoading}
            dir={isHebrew(inputValue) ? 'rtl' : 'ltr'}
          />
          <Button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[32px] xs:min-w-[36px] sm:min-w-[40px] md:min-w-[44px] lg:min-w-[48px] h-8 xs:h-9 sm:h-10 md:h-11 lg:h-12 px-1.5 xs:px-2 sm:px-3 md:px-4 rounded-xl"
          >
            <Send className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInput;
