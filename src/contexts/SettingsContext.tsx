
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsContextType {
  language: 'en' | 'he';
  notifications: boolean;
  userName: string;
  setLanguage: (lang: 'en' | 'he') => void;
  setNotifications: (enabled: boolean) => void;
  setUserName: (name: string) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nutrimentor': 'NutriMentor AI',
    'subtitle': 'Your Personal Nutrition Assistant',
    'chat': 'Chat',
    'calendar': 'Calendar',
    'meals': 'Meal Planner',
    'settings': 'Settings',
    
    // Authentication
    'signIn': 'Sign In',
    'signOut': 'Sign Out',
    'welcome': 'Welcome',
    'welcomeBack': 'Welcome Back',
    'createAccount': 'Create Account',
    
    // Chat
    'typeMessage': 'Ask about nutrition, calories, meal planning...',
    'nutritionFacts': 'Nutrition Facts',
    'calories': 'cal',
    'protein': 'protein',
    'carbs': 'carbs',
    'fat': 'fat',
    'clearChat': 'Clear Chat',
    
    // Settings
    'language': 'Language',
    'notifications': 'Notifications',
    'userName': 'User Name',
    'save': 'Save',
    
    // Meal Planner
    'mealPlanner': 'Meal Planner',
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'snack': 'Snack',
    'addMeal': 'Add Meal',
    'selectDate': 'Select Date',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'confirm': 'Confirm'
  },
  he: {
    // Navigation
    'nutrimentor': 'נוטרי מנטור AI',
    'subtitle': 'העוזר התזונתי האישי שלך',
    'chat': 'צ\'אט',
    'calendar': 'לוח שנה',
    'meals': 'מתכנן ארוחות',
    'settings': 'הגדרות',
    
    // Authentication
    'signIn': 'התחבר',
    'signOut': 'התנתק',
    'welcome': 'ברוך הבא',
    'welcomeBack': 'ברוך השב',
    'createAccount': 'צור חשבון',
    
    // Chat
    'typeMessage': 'שאל על תזונה, קלוריות, תכנון ארוחות...',
    'nutritionFacts': 'נתוני תזונה',
    'calories': 'קלוריות',
    'protein': 'חלבון',
    'carbs': 'פחמימות',
    'fat': 'שומן',
    'clearChat': 'נקה צ\'אט',
    
    // Settings
    'language': 'שפה',
    'notifications': 'התראות',
    'userName': 'שם משתמש',
    'save': 'שמור',
    
    // Meal Planner
    'mealPlanner': 'מתכנן ארוחות',
    'breakfast': 'ארוחת בוקר',
    'lunch': 'ארוחת צהריים',
    'dinner': 'ארוחת ערב',
    'snack': 'חטיף',
    'addMeal': 'הוסף ארוחה',
    'selectDate': 'בחר תאריך',
    
    // Common
    'loading': 'טוען...',
    'error': 'שגיאה',
    'success': 'הצלחה',
    'cancel': 'ביטול',
    'confirm': 'אישור'
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'he'>('en');
  const [notifications, setNotificationsState] = useState(false);
  const [userName, setUserNameState] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, settings')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setUserNameState(data.full_name || '');
        if (data.settings) {
          const settings = data.settings as { language?: 'en' | 'he'; notifications?: boolean };
          setLanguageState(settings.language || 'en');
          setNotificationsState(settings.notifications || false);
        }
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const saveUserSettings = async (newSettings: { language: 'en' | 'he'; notifications: boolean }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userName,
          settings: newSettings
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving settings:', error);
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  };

  const setLanguage = (lang: 'en' | 'he') => {
    setLanguageState(lang);
    const newSettings = { language: lang, notifications };
    saveUserSettings(newSettings);
  };

  const setNotifications = (enabled: boolean) => {
    setNotificationsState(enabled);
    const newSettings = { language, notifications: enabled };
    saveUserSettings(newSettings);
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    saveUserSettings({ language, notifications });
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    notifications,
    userName,
    setLanguage,
    setNotifications,
    setUserName,
    t,
  };

  return (
    <SettingsContext.Provider value={value}>
      <div dir={language === 'he' ? 'rtl' : 'ltr'} className={language === 'he' ? 'font-hebrew' : ''}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
};
