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
    'continueWithGoogle': 'Continue with Google',
    'continueWithGitHub': 'Continue with GitHub',
    'continueWithEmail': 'Or continue with',
    'fullName': 'Full Name',
    'email': 'Email',
    'password': 'Password',
    'pleaseWait': 'Please wait...',
    'alreadyHaveAccount': 'Already have an account? Sign in',
    'dontHaveAccount': "Don't have an account? Sign up",
    'joinNutriMentor': 'Join NutriMentor AI today',
    'signInToNutrition': 'Sign in to your nutrition assistant',
    'enterUserName': 'Enter your name',
    
    // Chat
    'typeMessage': 'Ask about nutrition, calories, meal planning...',
    'nutritionFacts': 'Nutrition Facts',
    'calories': 'cal',
    'protein': 'protein',
    'carbs': 'carbs',
    'fat': 'fat',
    'clearChat': 'Clear Chat',
    'chatWelcomeMessage': "Hello! I'm your personal nutrition mentor. I can help you with meal planning, nutritional analysis, calorie counting, and healthy eating advice. Try asking me about the nutrition facts of any food or for meal suggestions!",
    
    // Settings
    'language': 'Language',
    'notifications': 'Notifications',
    'userName': 'User Name',
    'save': 'Save',
    'darkMode': 'Dark Mode',
    'on': 'On',
    'off': 'Off',
    'settingsSaved': 'Settings saved successfully',
    
    // Meal Planner
    'mealPlanner': 'Meal Planner',
    'breakfast': 'Breakfast',
    'lunch': 'Lunch',
    'dinner': 'Dinner',
    'snack': 'Snack',
    'addMeal': 'Add Meal',
    'selectDate': 'Select Date',
    'addNewMeal': 'Add New Meal',
    'enterMealName': 'Enter meal name (e.g., \'Grilled chicken breast\')',
    'addingMealWithNutrition': 'Adding meal with nutrition data...',
    'noMealsPlanned': 'No meals planned for',
    'addedAt': 'Added at',
    'item': 'item',
    'items': 'items',
    'signInRequired': 'Sign In Required',
    'signInToSaveMeals': 'Please sign in to save and manage your personalized meal plans.',
    'fiber': 'fiber',
    
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    
    // Date formatting
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday',
    'january': 'January',
    'february': 'February',
    'march': 'March',
    'april': 'April',
    'may': 'May',
    'june': 'June',
    'july': 'July',
    'august': 'August',
    'september': 'September',
    'october': 'October',
    'november': 'November',
    'december': 'December'
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
    'continueWithGoogle': 'המשך עם גוגל',
    'continueWithGitHub': 'המשך עם גיטהאב',
    'continueWithEmail': 'או המשך עם',
    'fullName': 'שם מלא',
    'email': 'אימייל',
    'password': 'סיסמה',
    'pleaseWait': 'אנא המתן...',
    'alreadyHaveAccount': 'יש לך חשבון? התחבר',
    'dontHaveAccount': 'אין לך חשבון? הירשם',
    'joinNutriMentor': 'הצטרף לנוטרי מנטור AI היום',
    'signInToNutrition': 'התחבר לעוזר התזונה שלך',
    'enterUserName': 'הכנס את שמך',
    
    // Chat
    'typeMessage': 'שאל על תזונה, קלוריות, תכנון ארוחות...',
    'nutritionFacts': 'נתוני תזונה',
    'calories': 'קלוריות',
    'protein': 'חלבון',
    'carbs': 'פחמימות',
    'fat': 'שומן',
    'clearChat': 'נקה צ\'אט',
    'chatWelcomeMessage': 'שלום! אני המנטור התזונתי האישי שלך. אני יכול לעזור לך עם תכנון ארוחות, ניתוח תזונתי, ספירת קלוריות ועצות תזונה בריאה. נסה לשאול אותי על נתוני התזונה של כל מזון או להמלצות ארוחות!',
    
    // Settings
    'language': 'שפה',
    'notifications': 'התראות',
    'userName': 'שם משתמש',
    'save': 'שמור',
    'darkMode': 'מצב כהה',
    'on': 'פועל',
    'off': 'כבוי',
    'settingsSaved': 'ההגדרות נשמרו בהצלחה',
    
    // Meal Planner
    'mealPlanner': 'מתכנן ארוחות',
    'breakfast': 'ארוחת בוקר',
    'lunch': 'ארוחת צהריים',
    'dinner': 'ארוחת ערב',
    'snack': 'חטיף',
    'addMeal': 'הוסף ארוחה',
    'selectDate': 'בחר תאריך',
    'addNewMeal': 'הוסף ארוחה חדשה',
    'enterMealName': 'הכנס שם ארוחה (למשל, \'חזה עוף צלוי\')',
    'addingMealWithNutrition': 'מוסיף ארוחה עם נתוני תזונה...',
    'noMealsPlanned': 'לא מתוכננות ארוחות עבור',
    'addedAt': 'נוסף ב',
    'item': 'פריט',
    'items': 'פריטים',
    'signInRequired': 'נדרשת התחברות',
    'signInToSaveMeals': 'אנא התחבר כדי לשמור ולנהל את תוכניות הארוחות האישיות שלך.',
    'fiber': 'סיבים',
    
    // Common
    'loading': 'טוען...',
    'error': 'שגיאה',
    'success': 'הצלחה',
    'cancel': 'ביטול',
    'confirm': 'אישור',
    
    // Date formatting
    'monday': 'יום שני',
    'tuesday': 'יום שלישי',
    'wednesday': 'יום רביעי',
    'thursday': 'יום חמישי',
    'friday': 'יום שישי',
    'saturday': 'יום שבת',
    'sunday': 'יום ראשון',
    'january': 'ינואר',
    'february': 'פברואר',
    'march': 'מרץ',
    'april': 'אפריל',
    'may': 'מאי',
    'june': 'יוני',
    'july': 'יולי',
    'august': 'אוגוסט',
    'september': 'ספטמבר',
    'october': 'אוקטובר',
    'november': 'נובמבר',
    'december': 'דצמבר'
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