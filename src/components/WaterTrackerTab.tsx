
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Droplets, Plus, Minus, Target, Award, Zap, RotateCcw } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const WaterTrackerTab = () => {
  const { t, language } = useSettings();
  const { user } = useAuth();
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000); // Default 2L in ml
  const [selectedAmount, setSelectedAmount] = useState(250); // Default 250ml
  const [todayDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const isRTL = language === 'he';
  const progressPercentage = Math.min((waterIntake / dailyGoal) * 100, 100);
  const remainingWater = Math.max(dailyGoal - waterIntake, 0);
  const isGoalReached = waterIntake >= dailyGoal;

  // Quick add amounts in ml
  const quickAmounts = [125, 250, 500, 750, 1000];

  // Load data from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem(`waterTracker_${user.id}_${todayDate}`);
      if (savedData) {
        const { intake, goal } = JSON.parse(savedData);
        setWaterIntake(intake || 0);
        setDailyGoal(goal || 2000);
      }
    }
  }, [user, todayDate]);

  // Save data to localStorage whenever waterIntake or dailyGoal changes
  useEffect(() => {
    if (user) {
      const dataToSave = {
        intake: waterIntake,
        goal: dailyGoal,
        date: todayDate
      };
      localStorage.setItem(`waterTracker_${user.id}_${todayDate}`, JSON.stringify(dataToSave));
    }
  }, [user, waterIntake, dailyGoal, todayDate]);

  const addWater = (amount: number) => {
    setWaterIntake(prev => prev + amount);
  };

  const removeWater = (amount: number) => {
    setWaterIntake(prev => Math.max(0, prev - amount));
  };

  const resetDaily = () => {
    setWaterIntake(0);
  };

  const adjustGoal = (amount: number) => {
    setDailyGoal(prev => Math.max(500, prev + amount));
  };

  const formatAmount = (ml: number) => {
    if (ml >= 1000) {
      return `${(ml / 1000).toFixed(1)}L`;
    }
    return `${ml}ml`;
  };

  const getMotivationalMessage = () => {
    if (isGoalReached) {
      return language === 'he' 
        ? '🎉 מעולה! השגת את יעד המים היומי שלך!' 
        : '🎉 Excellent! You\'ve reached your daily water goal!';
    } else if (progressPercentage >= 75) {
      return language === 'he' 
        ? '💪 כמעט שם! עוד קצת ותגיע ליעד!' 
        : '💪 Almost there! Just a bit more to reach your goal!';
    } else if (progressPercentage >= 50) {
      return language === 'he' 
        ? '🌊 אתה באמצע הדרך! המשך כך!' 
        : '🌊 You\'re halfway there! Keep it up!';
    } else if (progressPercentage >= 25) {
      return language === 'he' 
        ? '💧 התחלה טובה! המשך לשתות!' 
        : '💧 Good start! Keep drinking!';
    } else {
      return language === 'he' 
        ? '🚰 בואו נתחיל לשתות מים!' 
        : '🚰 Let\'s start hydrating!';
    }
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full mb-4 sm:mb-6">
          <Droplets className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">
          {t('signInRequired')}
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm">
          {language === 'he' ? 'התחבר כדי לעקוב אחר צריכת המים שלך' : 'Sign in to track your water intake'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6" style={{ minHeight: 'calc(100vh - 120px)' }}>
        
        {/* Header Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className={`flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl text-blue-600 dark:text-blue-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Droplets className="h-5 w-5 sm:h-8 sm:w-8" />
              <span>{language === 'he' ? 'מעקב צריכת מים' : 'Water Tracker'}</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {format(new Date(), language === 'he' ? 'dd/MM/yyyy' : 'MMM dd, yyyy')}
            </p>
          </CardHeader>
        </Card>

        {/* Progress Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="text-center space-y-3 sm:space-y-4">
              {/* Main Progress Circle */}
              <div className="relative mx-auto w-32 h-32 sm:w-48 sm:h-48">
                <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div 
                  className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-400 to-cyan-400 transition-all duration-500 ease-out"
                  style={{ 
                    clipPath: `inset(${100 - progressPercentage}% 0 0 0)`,
                  }}
                ></div>
                <div className="absolute inset-2 sm:inset-4 rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
                  <Droplets className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-1 sm:mb-2" />
                  <span className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(progressPercentage)}%
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {formatAmount(waterIntake)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className={`flex justify-between text-xs sm:text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'he' ? 'צריכה נוכחית' : 'Current intake'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {language === 'he' ? 'יעד יומי' : 'Daily goal'}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2 sm:h-3" />
                <div className={`flex justify-between text-xs sm:text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-blue-600 dark:text-blue-400">{formatAmount(waterIntake)}</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatAmount(dailyGoal)}</span>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 font-medium">
                  {getMotivationalMessage()}
                </p>
                {!isGoalReached && (
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {language === 'he' 
                      ? `עוד ${formatAmount(remainingWater)} עד היעד`
                      : `${formatAmount(remainingWater)} remaining to goal`
                    }
                  </p>
                )}
              </div>

              {/* Achievement Badge */}
              {isGoalReached && (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {language === 'he' ? 'יעד הושג!' : 'Goal Achieved!'}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Add Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className={`text-base sm:text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <span>{language === 'he' ? 'הוסף מים' : 'Add Water'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAmount(amount);
                    addWater(amount);
                  }}
                  className="h-10 sm:h-12 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                >
                  {formatAmount(amount)}
                </Button>
              ))}
            </div>

            {/* Custom Amount Controls */}
            <div className={`flex items-center justify-center gap-3 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeWater(selectedAmount)}
                disabled={waterIntake === 0}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {formatAmount(selectedAmount)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'he' ? 'כמות נבחרת' : 'Selected amount'}
                </div>
              </div>
              
              <Button
                size="sm"
                onClick={() => addWater(selectedAmount)}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className={`text-base sm:text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <span>{language === 'he' ? 'הגדרות' : 'Settings'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* Daily Goal Adjustment */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'he' ? 'יעד יומי' : 'Daily Goal'}
              </label>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustGoal(-250)}
                  disabled={dailyGoal <= 500}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 text-center">
                  <div className="text-lg sm:text-xl font-semibold text-purple-600 dark:text-purple-400">
                    {formatAmount(dailyGoal)}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustGoal(250)}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetDaily}
              disabled={waterIntake === 0}
              className={`w-full ${isRTL ? 'flex-row-reverse' : ''} gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20`}
            >
              <RotateCcw className="h-4 w-4" />
              <span>{language === 'he' ? 'איפוס יומי' : 'Reset Daily'}</span>
            </Button>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <h4 className={`font-semibold text-cyan-700 dark:text-cyan-300 mb-2 sm:mb-3 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{language === 'he' ? 'טיפים להידרציה' : 'Hydration Tips'}</span>
            </h4>
            <ul className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 space-y-1 sm:space-y-2">
              <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>💧</span>
                <span>{language === 'he' ? 'שתה כוס מים מיד כשאתה מתעורר' : 'Drink a glass of water as soon as you wake up'}</span>
              </li>
              <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>🍽️</span>
                <span>{language === 'he' ? 'שתה מים לפני כל ארוחה' : 'Drink water before each meal'}</span>
              </li>
              <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>📱</span>
                <span>{language === 'he' ? 'הגדר תזכורות לשתות מים' : 'Set reminders to drink water regularly'}</span>
              </li>
              <li className={`flex items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>🏃‍♂️</span>
                <span>{language === 'he' ? 'שתה יותר מים במהלך פעילות גופנית' : 'Increase intake during physical activity'}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaterTrackerTab;
