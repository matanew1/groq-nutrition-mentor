
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '@/types';
import { MessageBubble } from './MessageBubble';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isRTL: boolean;
  getDirection: (text: string) => 'rtl' | 'ltr';
  getAlignment: (text: string, sender: 'user' | 'bot') => string;
  formatTime: (date: Date) => string;
  t: (key: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList = ({
  messages,
  isLoading,
  isRTL,
  getDirection,
  getAlignment,
  formatTime,
  t,
  messagesEndRef
}: MessageListProps) => {
  return (
    <ScrollArea className="h-full p-6 scroll-enhanced">
      <div className="space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            getDirection={getDirection}
            getAlignment={getAlignment}
            formatTime={formatTime}
            t={t}
          />
        ))}
        {isLoading && (
          <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
              <div className="p-2 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="message-bubble-bot">
                <div className="loading-enhanced">
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};
