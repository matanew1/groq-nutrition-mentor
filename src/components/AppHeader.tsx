
import React from 'react';
import { Heart, Zap, LogOut, Trash2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { translations } from '@/utils/translations';
import DarkModeToggle from '@/components/DarkModeToggle';
import LanguageToggle from '@/components/LanguageToggle';

interface AppHeaderProps {
  language: string;
  isRTL: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  user: any;
  userName?: string;
  activeTab: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  handleClearMessages: () => void;
  handleSignOut: () => void;
  onNavigateToAuth: () => void;
  t: (key: string) => string;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  language,
  isRTL,
  isDarkMode,
  setIsDarkMode,
  user,
  userName,
  activeTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  handleClearMessages,
  handleSignOut,
  onNavigateToAuth,
  t
}) => {
  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-green-100 dark:border-gray-700 shrink-0 shadow-sm">
      <div className="h-12 sm:h-14 md:h-16 px-2 sm:px-3 md:px-4 lg:px-6 flex items-center">
        <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1 sm:space-x-2 md:space-x-3 flex-1 min-w-0`} key={`header-${language}`}>
          <div className="p-1 sm:p-1.5 md:p-2 rounded-full shadow-lg overflow-hidden shrink-0">
            <img src="/logo.png" alt="NutriMentor Logo" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent truncate">
              {language === 'he' ? translations.he.nutrimentor : translations.en.nutrimentor}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden md:block truncate">
              {language === 'he' ? translations.he.subtitle : translations.en.subtitle}
            </p>
          </div>
          
          {/* Desktop controls - Hidden on smaller screens */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2" key={`desktop-header-${language}`}>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 text-xs hidden xl:flex">
              <Heart className="h-3 w-3 mr-1" />
              Health
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs hidden xl:flex">
              <Zap className="h-3 w-3 mr-1" />
              AI
            </Badge>
            
            <LanguageToggle />
            <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            
            {user ? (
              <div className="flex items-center space-x-1 xl:space-x-2">
                {userName && (
                  <span className="text-xs xl:text-sm text-gray-600 dark:text-gray-300 max-w-16 xl:max-w-24 truncate hidden xl:block">
                    {t('welcome')}, {userName}
                  </span>
                )}
                {activeTab === 'chat' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearMessages}
                    className="p-1.5 xl:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Trash2 className="h-3 w-3 xl:h-4 xl:w-4 text-gray-600 dark:text-gray-300" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="p-1.5 xl:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-3 w-3 xl:h-4 xl:w-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToAuth}
                className="text-xs px-2 xl:px-3 py-1 h-7 xl:h-8"
              >
                {t('signIn')}
              </Button>
            )}
          </div>
          
          {/* Mobile menu trigger */}
          <div className="lg:hidden shrink-0">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "left" : "right"} className="w-64 sm:w-72 p-3 sm:p-4">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 sm:p-2 rounded-full overflow-hidden">
                      <img src="/logo.png" alt="NutriMentor Logo" className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    <span className="font-semibold text-sm sm:text-lg">{t('nutrimentor')}</span>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs">
                        <Heart className="h-3 w-3 mr-1" />
                        Health
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <LanguageToggle />
                      <DarkModeToggle isDark={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
                    </div>
                    
                    {user && (
                      <div className="space-y-2">
                        {userName && (
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">
                            {t('welcome')}, {userName}
                          </p>
                        )}
                        {activeTab === 'chat' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleClearMessages();
                              setMobileMenuOpen(false);
                            }}
                            className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            {t('clearChat')}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          {t('signOut')}
                        </Button>
                      </div>
                    )}
                    
                    {!user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onNavigateToAuth();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-xs sm:text-sm h-8 sm:h-9"
                      >
                        {t('signIn')}
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
