
import React from 'react';
import { EnhancedCard, EnhancedCardContent } from '@/components/ui/EnhancedCard';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Message } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface ChatTabProps {
  messages: Message[];
  isLoading: boolean;
  isRTL: boolean;
  getDirection: (text: string) => 'rtl' | 'ltr';
  getAlignment: (text: string, sender: 'user' | 'bot') => string;
  formatTime: (date: Date) => string;
  t: (key: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
}

export const ChatTab = (props: ChatTabProps) => {
  const { user } = useAuth();
  
  return (
    <div className="flex-1 flex flex-col space-y-4 sm:space-y-6">
      <EnhancedCard className="flex-1">
        <MessageList
          messages={props.messages}
          isLoading={props.isLoading}
          isRTL={props.isRTL}
          getDirection={props.getDirection}
          getAlignment={props.getAlignment}
          formatTime={props.formatTime}
          t={props.t}
          messagesEndRef={props.messagesEndRef}
        />
      </EnhancedCard>

      <EnhancedCard>
        <EnhancedCardContent className="p-4 sm:p-6">
          <ChatInput
            inputValue={props.inputValue}
            setInputValue={props.setInputValue}
            handleSendMessage={props.handleSendMessage}
            isLoading={props.isLoading}
            isRTL={props.isRTL}
            t={props.t}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
            {user ? 'Your messages are automatically saved to your account' : 'Sign in to save your chat history'}
          </p>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};
