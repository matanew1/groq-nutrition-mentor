import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Sun, Moon } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

const getInitialDarkMode = () => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return document.documentElement.classList.contains('dark');
  }
  return false;
};

const SettingsDialog = () => {
  const {
    t,
    language,
    setLanguage,
    notifications,
    setNotifications,
    userName,
    setUserName,
  } = useSettings();
  const [tempUserName, setTempUserName] = useState(userName);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode());

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (language === 'he') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.classList.add('font-hebrew');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.classList.remove('font-hebrew');
    }
  }, [language]);

  useEffect(() => {
    setTempUserName(userName);
  }, [userName]);

  useEffect(() => {
    if (open) {
      setIsDarkMode(getInitialDarkMode());
    }
  }, [open]);

  const handleDarkModeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSave = () => {
    setUserName(tempUserName);
    setOpen(false);
    toast({
      title: t('success'),
      description: t('settingsSaved') || "Settings saved successfully",
    });
  };

  const dir = language === 'he' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label={t('settings')}
        >
          <Settings className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`sm:max-w-[425px] bg-card dark:bg-gray-900 rounded-xl shadow-2xl border border-border py-0 px-0`}
        dir={dir}
      >
        <DialogHeader>
          <DialogTitle className="pb-2 border-b border-accent text-xl px-6 pt-6">
            {t('settings')}
          </DialogTitle>
        </DialogHeader>
        <div className={`space-y-6 py-4 px-6 ${isRTL ? "text-right" : "text-left"}`}>
          {/* User Info */}
          <section className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4 shadow-inner border border-border">
            <Label htmlFor="username" className="text-sm font-medium">{t('userName')}</Label>
            <Input
              id="username"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              placeholder={t('enterUserName') || "Enter your name"}
              className="mt-2"
              dir={dir}
              style={{ textAlign: isRTL ? 'right' : 'left'}}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('userNameDesc') || t('settingsUserNameHint') || ''}</p>
          </section>

          {/* Language & Notifications */}
          <section className={`flex flex-col sm:flex-row gap-4`}>
            {/* Language Switcher */}
            <div className="flex-1 bg-muted/30 dark:bg-muted/30 rounded-lg p-4 shadow-inner border border-border flex flex-col gap-1">
              <Label htmlFor="language" className="text-sm font-medium">{t('language')}</Label>
              <div className={`flex items-center space-x-2 mt-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <span className={language === 'en' ? 'font-bold' : ''}>EN</span>
                <Switch
                  id="language"
                  checked={language === 'he'}
                  onCheckedChange={(checked) => setLanguage(checked ? 'he' : 'en')}
                />
                <span className={language === 'he' ? 'font-bold' : ''}>עברית</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('settingsLanguageHint') || ''}</p>
            </div>

            {/* Notifications Toggle */}
            <div className="flex-1 bg-muted/30 dark:bg-muted/30 rounded-lg p-4 shadow-inner border border-border flex flex-col gap-1">
              <Label htmlFor="notifications" className="text-sm font-medium">{t('notifications')}</Label>
              <div className={`flex items-center mt-2 ${isRTL ? 'justify-end' : ''}`}>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
                <span className={`ml-3 text-sm${isRTL ? " mr-0 ml-3" : ""}`}>{notifications ? t('on') || 'On' : t('off') || 'Off'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('settingsNotificationsHint') || ''}</p>
            </div>
          </section>

          {/* Dark Mode Toggle */}
          <section className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4 shadow-inner border border-border flex flex-col gap-2">
            <Label className={`text-sm font-medium mb-1 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {t('darkMode') || 'Dark Mode'}
            </Label>
            <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                type="button"
                variant={isDarkMode ? "secondary" : "outline"}
                size="icon"
                className={`mr-2 ${isDarkMode ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                onClick={handleDarkModeToggle}
                aria-label={isDarkMode ? t('switchToLightMode') || 'Switch to light mode' : t('switchToDarkMode') || 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-500" />
                )}
              </Button>
              <span className="text-sm">{isDarkMode ? t('on') || 'On' : t('off') || 'Off'}</span>
            </div>
          </section>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className={`w-full mt-2 font-semibold bg-gradient-to-r from-green-400 to-blue-500 dark:from-green-700 dark:to-blue-800 text-white shadow-lg hover:brightness-110 transition`}
            dir={dir}
          >
            {t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;