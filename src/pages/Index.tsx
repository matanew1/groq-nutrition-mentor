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

  // Check if current language is Hebrew for RTL layout
  const isRTL = language === 'he';

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
      setIsLoading(isLoading => {
        setTimeout(() => setIsLoading(isLoading), 0);
        return isLoading;
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
        /(?:קלוריות|
