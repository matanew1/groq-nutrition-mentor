
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FancyButton } from '@/components/ui/FancyButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Trash2, Globe2, Zap } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { useMessages } from '@/hooks/useMessages';

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
  const { toast } = useToast();
  const { clearMessages } = useMessages();

  const [tempUserName, setTempUserName] = useState(userName);
  const [open, setOpen] = useState(false);
  const dir = language === 'he' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  // Animate pulse for toggles
  const [actionPulse, setActionPulse] = useState(false);

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

  // Animated pulse trigger
  const triggerPulse = () => {
    setActionPulse(true);
    setTimeout(() => setActionPulse(false), 500);
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'he' ? 'en' : 'he');
    triggerPulse();
    toast({
      title: t('success'),
      description: t(language === 'he' ? 'englishEnabled' : 'hebrewEnabled') || (language === 'he' ? 'English enabled' : 'Hebrew enabled'),
    });
  };

  const handleClearChat = async () => {
    await clearMessages();
    triggerPulse();
    toast({
      title: t('success'),
      description: t('chatCleared') || "Your chat has been cleared.",
    });
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    triggerPulse();
    toast({
      title: t('success'),
      description: notifications ? t('notificationsOff') || "Notifications off" : t('notificationsOn') || "Notifications on",
    });
  };

  const handleSave = () => {
    setUserName(tempUserName);
    setOpen(false);
    toast({
      title: t('success'),
      description: t('settingsSaved') || "Settings saved successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <FancyButton
          variant="ghost"
          size="sm"
          className="p-2 rounded-full hover:bg-muted"
          aria-label={t('settings')}
        >
          <Settings className="h-4 w-4 text-primary" />
        </FancyButton>
      </DialogTrigger>
      <DialogContent
        className="glass-card-dialog bg-gradient-to-br from-white/60 via-white/45 to-blue-200/30 rounded-2xl shadow-2xl border border-white/20 animate-fade-in"
        dir={dir}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold px-6 pt-6 flex items-center gap-2 bg-gradient-to-r from-green-400/30 to-blue-100/40 rounded-t-2xl">
            <Settings className="h-6 w-6 text-primary animate-spin-slow" />
            {t('settings')}
          </DialogTitle>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-between items-center px-6 py-3 border-b border-muted/40 bg-white/10 rounded-2xl animate-fade-in">
          <span className="font-semibold text-muted-foreground text-xs sm:text-sm">{t('quickActions') || "Quick Actions"}</span>
          <div className="flex gap-2">
            <FancyButton
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('toggleLanguage') || "Toggle language"}
              onClick={handleLanguageToggle}
              className="rounded-full from-green-400/60 to-blue-200/60 glow-action bg-gradient-to-tr"
            >
              <Globe2 className="h-5 w-5" />
            </FancyButton>
            <FancyButton
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('clearChat') || "Clear chat"}
              onClick={handleClearChat}
              className="rounded-full from-pink-200/60 to-red-200/60 glow-action bg-gradient-to-tr"
            >
              <Trash2 className="h-5 w-5" />
            </FancyButton>
            <FancyButton
              type="button"
              variant="ghost"
              size="icon"
              aria-label={notifications ? (t('disableNotifications') || "Disable notifications") : (t('enableNotifications') || "Enable notifications")}
              onClick={handleNotificationsToggle}
              className="rounded-full from-purple-100/70 to-purple-300/60 glow-action bg-gradient-to-tr"
            >
              <Zap className={`h-5 w-5 ${notifications ? "text-emerald-400" : "text-gray-400"}`} />
            </FancyButton>
          </div>
        </div>

        <div className="space-y-7 py-6 px-6 glass-card-body animate-fade-in-up">
          {/* User Info */}
          <GlassCard className="p-5 shadow-inner border border-white/20">
            <Label htmlFor="username" className="text-lg font-bold text-primary">{t('userName')}</Label>
            <Input
              id="username"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              placeholder={t('enterUserName') || "Enter your name"}
              className="mt-3 glass-input bg-white/60 border border-white/40 text-primary placeholder:text-primary/50 transition"
              dir={dir}
              style={{ textAlign: isRTL ? 'right' : 'left'}}
            />
            <p className="text-xs text-muted-foreground mt-2">{t('userNameDesc') || t('settingsUserNameHint') || ''}</p>
          </GlassCard>

          {/* Language & Notifications */}
          <div className="flex flex-col sm:flex-row gap-6">
            <GlassCard className="flex-1 p-5">
              <Label htmlFor="language" className="text-lg font-semibold text-primary">{t('language')}</Label>
              <div className="flex items-center gap-3 mt-2">
                <span className={language === 'en' ? 'font-bold' : 'opacity-60'}>EN</span>
                <Switch
                  id="language"
                  checked={language === 'he'}
                  onCheckedChange={(checked) => setLanguage(checked ? 'he' : 'en')}
                  className={`glass-switch ${language === 'he' ? 'animate-pulse' : ''}`}
                />
                <span className={language === 'he' ? 'font-bold' : 'opacity-60'}>עברית</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t('settingsLanguageHint') || ''}</p>
            </GlassCard>
            <GlassCard className="flex-1 p-5">
              <Label htmlFor="notifications" className="text-lg font-semibold text-primary">{t('notifications')}</Label>
              <div className="flex items-center mt-2 gap-4">
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                  className={`glass-switch ${notifications ? 'animate-pulse' : ''}`}
                />
                <span className="text-base font-medium">{notifications ? t('on') || 'On' : t('off') || 'Off'}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t('settingsNotificationsHint') || ''}</p>
            </GlassCard>
          </div>

          {/* Save Button */}
          <FancyButton
            onClick={handleSave}
            className="w-full mt-4 font-bold text-lg bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 shadow-2xl hover:scale-105"
            dir={dir}
          >
            {t('save')}
          </FancyButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
