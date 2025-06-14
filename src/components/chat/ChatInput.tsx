
import React from 'react';
import { Send } from 'lucide-react';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { isHebrew } from '@/utils/messageFormatter';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  isRTL: boolean;
  t: (key: string) => string;
}

export const ChatInput = ({ inputValue, setInputValue, handleSendMessage, isLoading, isRTL, t }: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
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
  );
};
