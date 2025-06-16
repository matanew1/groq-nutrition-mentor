
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  nutritionData?: any;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useSettings();

  // Load messages from database
  useEffect(() => {
    if (user) {
      loadMessages();
    } else {
      // Set default welcome message for non-authenticated users
      setMessages([{
        id: '1',
        content: t('chatWelcomeMessage'),
        sender: 'bot',
        timestamp: new Date()
      }]);
      setLoading(false);
    }
  }, [user, t]);

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.created_at),
          nutritionData: msg.nutrition_data
        }));
        setMessages(formattedMessages);
      } else {
        // Add welcome message for new users
        const welcomeMessage = {
          id: '1',
          content: t('chatWelcomeMessage'),
          sender: 'bot' as const,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        await saveMessage(welcomeMessage);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error loading messages",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async (message: Message) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          content: message.content,
          sender: message.sender,
          nutrition_data: message.nutritionData || null
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving message:', error);
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    if (user) {
      await saveMessage(newMessage);
    }

    return newMessage;
  };

  const clearMessages = async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } catch (error: any) {
        console.error('Error clearing messages:', error);
        toast({
          title: "Error clearing messages",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
    }

    setMessages([]);
  };

  return {
    messages,
    loading,
    addMessage,
    clearMessages
  };
};
