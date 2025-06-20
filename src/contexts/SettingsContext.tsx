import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { translations, TranslationKey } from '@/utils/translations';

// Re-export useSettings to fix import issues

interface SettingsContextType {
  language: 'en' | 'he';
  notifications: boolean;
  userName: string;
  setLanguage: (lang: 'en' | 'he') => void;
  setNotifications: (enabled: boolean) => void;
  setUserName: (name: string) => void;
  t: (key: string) => string;
}

// Export the context so it can be consumed by our custom hook
export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'he'>('en');
  const [notifications, setNotificationsState] = useState(false);
  const [userName, setUserNameState] = useState('');
  const { user } = useAuth();

  const loadUserSettings = useCallback(async () => {
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
  }, [user, setUserNameState, setLanguageState, setNotificationsState]);
  
  // Add useEffect to call loadUserSettings when user is available
  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user, loadUserSettings]);

  const saveUserSettings = async (newSettings: { language: 'en' | 'he'; notifications: boolean }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: userName,
          settings: newSettings,
          email: user.email
        });

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
    return translations[language][key as TranslationKey] || key;
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
