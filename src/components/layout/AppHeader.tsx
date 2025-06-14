
import React from 'react';
import { Apple, Heart, Zap, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import LanguageToggle from '@/components/LanguageToggle';
import DarkModeToggle from '@/components/DarkModeToggle';
import SettingsDialog from '@/components/SettingsDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AppHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onClearMessages: () => void;
  activeTab: string;
}

export const AppHeader = ({ isDarkMode, onToggleDarkMode, onClearMessages, activeTab }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const { t, language, userName } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isRTL = language === 'he';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('success'),
        description: "You have been signed out successfully.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass-card-enhanced backdrop-blur-xl border-0 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <Apple className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="heading-enhanced text-2xl sm:text-3xl font-bold truncate">
              {t('nutrimentor')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              {t('subtitle')}
            </p>
          </div>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
            <EnhancedBadge variant="success">
              <Heart className="h-3 w-3" />
              <span className="hidden sm:inline">Health</span>
            </EnhancedBadge>
            <EnhancedBadge variant="default">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">AI</span>
            </EnhancedBadge>
            
            <LanguageToggle />
            <DarkModeToggle isDark={isDarkMode} onToggle={onToggleDarkMode} />
            <SettingsDialog />
            
            {user ? (
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                {userName && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                    {t('welcome')}, {userName}
                  </span>
                )}
                {activeTab === 'chat' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearMessages}
                    className="p-2 rounded-xl hover:bg-white/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-2 rounded-xl hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <EnhancedButton
                size="sm"
                onClick={() => navigate('/auth')}
              >
                {t('signIn')}
              </EnhancedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
