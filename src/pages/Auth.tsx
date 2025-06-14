import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Apple, Mail, Eye, EyeOff, Github } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInWithGitHub, signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const { t, language } = useSettings();
  const navigate = useNavigate();

  // Check if current language is Hebrew for RTL layout
  const isRTL = language === 'he';

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await signUpWithEmail(email, password, fullName);
      } else {
        result = await signInWithEmail(email, password);
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: isSignUp ? t('createAccount') + "!" : t('welcomeBack') + "!",
          description: isSignUp 
            ? "Please check your email to verify your account." 
            : "You have been signed in successfully.",
        });
        if (!isSignUp) {
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGitHubAuth = async () => {
    setLoading(true);
    try {
      await signInWithGitHub();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center p-4 ${isRTL ? 'font-hebrew' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md p-6 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-r from-slate-400 to-gray-500 rounded-full">
              <Apple className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-gray-700 bg-clip-text text-transparent">
            {isSignUp ? t('createAccount') : t('welcomeBack')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isSignUp ? t('joinNutriMentor') : t('signInToNutrition')}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
            variant="outline"
          >
            <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('continueWithGoogle')}
          </Button>

          <Button
            onClick={handleGitHubAuth}
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white"
          >
            <Github className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('continueWithGitHub')}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-400">{t('continueWithEmail')}</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <Input
                type="text"
                placeholder={t('fullName')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-gray-200 dark:border-gray-600 focus:border-slate-400 focus:ring-slate-400"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
          )}
          
          <div>
            <Input
              type="email"
              placeholder={t('email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-gray-200 dark:border-gray-600 focus:border-slate-400 focus:ring-slate-400"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t('password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pr-10 border-gray-200 dark:border-gray-600 focus:border-slate-400 focus:ring-slate-400"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center`}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700"
          >
            <Mail className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {loading ? t('pleaseWait') : (isSignUp ? t('createAccount') : t('signIn'))}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-slate-600 hover:text-slate-500"
          >
            {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
