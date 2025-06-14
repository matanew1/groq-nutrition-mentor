
import React, { useState } from 'react';
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
import { Settings } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/hooks/use-toast';

const SettingsDialog = () => {
  const { t, language, setLanguage, notifications, setNotifications, userName, setUserName } = useSettings();
  const [tempUserName, setTempUserName] = useState(userName);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setUserName(tempUserName);
    setOpen(false);
    toast({
      title: t('success'),
      description: "Settings saved successfully",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('settings')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t('userName')}</Label>
            <Input
              id="username"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="language">{t('language')}</Label>
            <div className="flex items-center space-x-2">
              <span className={language === 'en' ? 'font-bold' : ''}>EN</span>
              <Switch
                id="language"
                checked={language === 'he'}
                onCheckedChange={(checked) => setLanguage(checked ? 'he' : 'en')}
              />
              <span className={language === 'he' ? 'font-bold' : ''}>עברית</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">{t('notifications')}</Label>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          
          <Button onClick={handleSave} className="w-full">
            {t('save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
