
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const LanguageToggle = () => {
  const { language, setLanguage } = useSettings();

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'he' : 'en';
    setLanguage(newLanguage);
    
    // Force a redraw of the DOM by setting a small timeout
    setTimeout(() => {
      // This causes a slight DOM update which helps refresh components
      const event = new CustomEvent('languageChanged', { detail: { language: newLanguage } });
      document.dispatchEvent(event);
    }, 0);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Globe className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      <span className="ml-1 text-xs">{language.toUpperCase()}</span>
    </Button>
  );
};

export default LanguageToggle;
