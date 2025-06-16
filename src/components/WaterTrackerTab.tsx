import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Droplet, Plus, Minus, Trash2, Calendar as CalendarIcon, Award, 
  Sparkles, Gift, Zap, TrendingUp, Medal, Crown 
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define cup sizes in ml
const CUP_SIZES = {
  SMALL: 200,   // Small cup (200ml)
  MEDIUM: 250,  // Standard cup (250ml)
  LARGE: 350,   // Large cup (350ml)
  GLASS: 300,   // Standard glass (300ml)
  BOTTLE: 500,  // Small bottle (500ml)
  LARGE_BOTTLE: 1000 // Large bottle (1000ml/1L)
};

// Define water tracker entry interface
interface WaterEntry {
  id: string;
  user_id: string;
  amount: number; // in ml
  date: string;
  timestamp: string;
}

const WaterTrackerTab: React.FC = () => {
  const { t, language } = useSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [waterAmount, setWaterAmount] = useState<number>(250); // Default amount in ml
  const [dailyWaterGoal, setDailyWaterGoal] = useState<number>(2000); // Default goal in ml
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [historicalData, setHistoricalData] = useState<{date: string, amount: number}[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [selectedTab, setSelectedTab] = useState<string>("today");
  const [today] = useState(new Date());
  const [quickAddAmounts] = useState([100, 250, 500, 750]);
  const [drinkingAnimation, setDrinkingAnimation] = useState(false);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [achievements, setAchievements] = useState<{id: number, title: string, description: string, earned: boolean}[]>([
    { id: 1, title: 'First Sip', description: 'Add your first water entry', earned: false },
    { id: 2, title: 'Hydration Beginner', description: 'Reach 50% of your daily goal', earned: false },
    { id: 3, title: 'Hydration Expert', description: 'Complete your daily goal', earned: false },
    { id: 4, title: 'Hydration Streak', description: '3 days streak of meeting your goal', earned: false },
    { id: 5, title: 'Water Champion', description: 'Complete 150% of your goal', earned: false },
  ]);
  const animationRef = useRef<HTMLDivElement>(null);
  
  const todayFormatted = format(today, 'yyyy-MM-dd');
  const isRTL = language === 'he';

  // Calculate total water intake for today
  const totalWaterIntake = waterEntries
    .filter(entry => entry.date === todayFormatted)
    .reduce((total, entry) => total + entry.amount, 0);

  // Calculate percentage towards goal
  const goalPercentage = Math.min(Math.round((totalWaterIntake / dailyWaterGoal) * 100), 100);
  useEffect(() => {
    if (user) {
      loadWaterEntries();
      loadWaterSettings();
      loadHistoricalData();
      checkAchievements();
      calculateStreak();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Effect to check achievements when water entries change
  useEffect(() => {
    if (waterEntries.length > 0) {
      checkAchievements();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waterEntries, dailyWaterGoal]);

  // Effect to handle celebration animation
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Load today's water entries
  const loadWaterEntries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('water_tracker')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayFormatted)
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setWaterEntries(data);
      }
    } catch (error) {
      console.error('Error loading water entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load historical data for the past week
  const loadHistoricalData = async () => {
    if (!user) return;
    
    try {
      // Get data from the past 7 days
      const pastWeek = Array.from({length: 7}, (_, i) => {
        const date = subDays(today, i);
        return format(date, 'yyyy-MM-dd');
      });

      const { data, error } = await supabase
        .from('water_tracker')
        .select('*')
        .eq('user_id', user.id)
        .in('date', pastWeek);
        
      if (error) throw error;
      
      if (data) {
        // Aggregate data by date
        const aggregatedData = pastWeek.map(date => {
          const entriesForDay = data.filter(entry => entry.date === date);
          const totalAmount = entriesForDay.reduce((sum, entry) => sum + entry.amount, 0);
          return { date, amount: totalAmount };
        });
        
        setHistoricalData(aggregatedData.reverse()); // Newest first
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  // Calculate user's streak
  const calculateStreak = async () => {
    if (!user) return;
    
    try {
      // Get the last 30 days of data to check streak
      const pastMonth = Array.from({length: 30}, (_, i) => {
        const date = subDays(today, i);
        return format(date, 'yyyy-MM-dd');
      });
      
      const { data, error } = await supabase
        .from('water_tracker')
        .select('date')
        .eq('user_id', user.id)
        .in('date', pastMonth);
        
      if (error) throw error;
      
      if (data) {
        // Group entries by date and check if each day met the goal
        const dateGroups = data.reduce((groups: {[key: string]: number}, entry) => {
          if (!groups[entry.date]) groups[entry.date] = 0;
          groups[entry.date] += 1;
          return groups;
        }, {});
        
        // Calculate streak (consecutive days with entries)
        let streak = 0;
        for (let i = 0; i < pastMonth.length; i++) {
          if (dateGroups[pastMonth[i]]) {
            streak++;
          } else if (i === 0) {
            // If today doesn't have entries yet, check yesterday
            continue;
          } else {
            // Break on first day without entries
            break;
          }
        }
        
        setUserStreak(streak);
      }
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  // Load user settings including water goal
  const loadWaterSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading water settings:', error);
        return;
      }
      
      if (data?.settings) {
        if (data.settings.waterGoal) {
          setDailyWaterGoal(data.settings.waterGoal);
        }
        if (data.settings.waterXp) {
          setXp(data.settings.waterXp);
        }
        if (data.settings.waterLevel) {
          setLevel(data.settings.waterLevel);
        }
        if (data.settings.waterAchievements) {
          setAchievements(prev => 
            prev.map(achievement => ({
              ...achievement,
              earned: data.settings.waterAchievements.includes(achievement.id)
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading water settings:', error);
    }
  };
  // Check and update user achievements
  const checkAchievements = () => {
    if (!user) return;
    
    const newAchievements = [...achievements];
    let achievementsEarned = false;
    let xpGained = 0;
    
    // First water entry
    if (waterEntries.length > 0 && !newAchievements[0].earned) {
      newAchievements[0].earned = true;
      achievementsEarned = true;
      xpGained += 10;
    }
    
    // 50% of daily goal
    if (totalWaterIntake >= dailyWaterGoal * 0.5 && !newAchievements[1].earned) {
      newAchievements[1].earned = true;
      achievementsEarned = true;
      xpGained += 25;
    }
    
    // 100% of daily goal
    if (totalWaterIntake >= dailyWaterGoal && !newAchievements[2].earned) {
      newAchievements[2].earned = true;
      achievementsEarned = true;
      xpGained += 50;
      setShowCelebration(true);
    }
    
    // Streak of 3 days
    if (userStreak >= 3 && !newAchievements[3].earned) {
      newAchievements[3].earned = true;
      achievementsEarned = true;
      xpGained += 100;
    }
    
    // 150% of daily goal
    if (totalWaterIntake >= dailyWaterGoal * 1.5 && !newAchievements[4].earned) {
      newAchievements[4].earned = true;
      achievementsEarned = true;
      xpGained += 75;
    }
    
    if (achievementsEarned) {
      setAchievements(newAchievements);
      addXp(xpGained);
      saveAchievements(newAchievements);
      
      // Show notification
      toast({
        title: "Achievement Unlocked! 🎉",
        description: `You've earned ${xpGained} XP points!`,
        variant: "default",
      });
    }
  };
  
  // Add XP points and level up if needed
  const addXp = (points: number) => {
    const newXp = xp + points;
    setXp(newXp);
    
    // Level up every 100 XP
    const newLevel = Math.floor(newXp / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      toast({
        title: "Level Up! 🌟",
        description: `You've reached level ${newLevel}!`,
        variant: "default",
      });
    }
    
    // Save XP and level to profile
    saveUserSettings({ waterXp: newXp, waterLevel: newLevel });
  };
  
  // Save achievements to profile
  const saveAchievements = async (achievementsList: typeof achievements) => {
    const earnedIds = achievementsList
      .filter(achievement => achievement.earned)
      .map(achievement => achievement.id);
      
    saveUserSettings({ waterAchievements: earnedIds });
  };
  
  // Generic function to save user settings
  const saveUserSettings = async (settings: Record<string, any>) => {
    if (!user) return;
    
    try {
      const { data: existingData, error: fetchError } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing settings:', fetchError);
        return;
      }
      
      const existingSettings = existingData?.settings || {};
      const updatedSettings = { ...existingSettings, ...settings };
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          settings: updatedSettings,
        });
        
      if (error) {
        console.error('Error saving user settings:', error);
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  };
  
  // Save water goal
  const saveWaterGoal = async (goal: number) => {
    saveUserSettings({ waterGoal: goal });
  };

  // Start water drinking animation
  const startDrinkingAnimation = () => {
    setDrinkingAnimation(true);
    setTimeout(() => setDrinkingAnimation(false), 1500);
  };
  
  // Enhanced water entry addition with animation
  const addWaterEntryWithAnimation = async () => {
    startDrinkingAnimation();
    setTimeout(() => {
      addWaterEntry();
    }, 500);
  };
  
  // Add water entry with animation
  const addWaterEntry = async () => {
    if (!user || waterAmount <= 0) return;
    
    setLoading(true);
    startDrinkingAnimation();
    
    try {
      const newEntry = {
        user_id: user.id,
        amount: waterAmount,
        date: todayFormatted,
        timestamp: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('water_tracker')
        .insert([newEntry])
        .select();
        
      if (error) throw error;
      
      if (data) {
        // Add entry to state
        setWaterEntries([...data, ...waterEntries]);
        
        // Reset amount to default after adding
        setWaterAmount(250);
        
        // Refresh historical data
        loadHistoricalData();
        
        // Show success message
        toast({
          title: "Water added! 💧",
          description: `Added ${formatWaterAmount(waterAmount)} to your daily intake.`,
          variant: "default",
        });
        
        // Add XP for drinking water (1 XP per 100ml)
        addXp(Math.floor(waterAmount / 100));
      }
    } catch (error) {
      console.error('Error adding water entry:', error);
      toast({
        title: "Error",
        description: "Could not add water entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Quick add preset amount
  const quickAddWater = (amount: number) => {
    setWaterAmount(amount);
    setTimeout(() => addWaterEntry(), 100);
  };

  // Delete water entry with confirmation
  const deleteWaterEntry = async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('water_tracker')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setWaterEntries(waterEntries.filter(entry => entry.id !== id));
      
      // Refresh historical data
      loadHistoricalData();
      
      toast({
        title: "Entry removed",
        description: "Water entry has been deleted",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting water entry:', error);
      toast({
        title: "Error",
        description: "Could not delete water entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Adjust water amount with buttons
  const adjustWaterAmount = (delta: number) => {
    const newAmount = Math.max(50, waterAmount + delta);
    setWaterAmount(newAmount);
  };
  
  // Format water amount display  // This function is now redefined above with the new cup formatting

  // Convert ml to cups (based on 250ml standard cup)
  const mlToCups = (ml: number): number => {
    return +(ml / CUP_SIZES.MEDIUM).toFixed(1);
  };

  // Format water as cups display
  const formatWaterAsCups = (ml: number): string => {
    const cups = mlToCups(ml);
    return cups === 1 ? `${cups} ${t('cup')}` : `${cups} ${t('cups')}`;
  };
  
  // Convert ml to UI-friendly format showing both cups and ml
  const formatWaterFriendly = (ml: number): string => {
    const cups = mlToCups(ml);
    if (cups < 0.1) {
      return `${ml} ml`;
    } else if (ml % CUP_SIZES.MEDIUM === 0) {
      return cups === 1 ? `${cups} ${t('cup')} (${ml} ml)` : `${cups} ${t('cups')} (${ml} ml)`;
    } else {
      return `${cups} ${t('cups')} (${ml} ml)`;
    }
  };

  // Calculate how many cups left to reach goal
  const getCupsRemaining = (): number => {
    const remaining = Math.max(0, dailyWaterGoal - totalWaterIntake);
    return Math.ceil(remaining / CUP_SIZES.MEDIUM);
  };

  // Get motivation message based on progress
  const getMotivationMessage = () => {
    const percentage = goalPercentage;
    
    if (percentage === 0) return t('startDrinking');
    if (percentage < 25) return t('keepGoing');
    if (percentage < 50) return t('quarterWay');
    if (percentage < 75) return t('halfwayThere');
    if (percentage < 100) return t('almostThere');
    return t('goalReached');
  };
  
  // Format time for display
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <Droplet className="h-16 w-16 text-blue-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">{t('signInRequired')}</h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">
          {t('signInToTrackWater')}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white/50 dark:bg-gray-800/50 p-4 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center">
                <Droplet className="h-5 w-5 text-blue-500 mr-2" />
                {t('waterTracker')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {format(today, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* Drinking Animation Overlay */}
        {drinkingAnimation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10 dark:bg-black/20 pointer-events-none">
            <div className="relative">
              <div className="relative w-24 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-b-xl rounded-t-lg border-4 border-blue-200 dark:border-blue-700 overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full bg-blue-400 dark:bg-blue-600 transition-all duration-1000"
                  style={{ 
                    height: '100%',
                    animation: 'drinkingWater 1.5s ease-in-out forwards'
                  }}
                ></div>
                <style jsx>{`
                  @keyframes drinkingWater {
                    0% { height: 90%; }
                    50% { height: 10%; }
                    100% { height: 0%; }
                  }
                `}</style>
              </div>
              <div className="text-center mt-4 text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatWaterFriendly(waterAmount)}
              </div>
              <div className="text-center mt-2 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Droplet className="h-5 w-5 mr-1 animate-bounce" />
                <span>{t('drinking')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('todaysProgress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">                {/* Progress bar with cups visualization */}
                <div className="space-y-4">
                  {/* Cups visualization */}
                  <div className="flex flex-wrap justify-center gap-2 my-2">
                    {Array.from({ length: Math.ceil(dailyWaterGoal / CUP_SIZES.MEDIUM) }).map((_, idx) => {
                      // Calculate how many cups are filled
                      const totalCups = Math.ceil(totalWaterIntake / CUP_SIZES.MEDIUM);
                      const isFilled = idx < totalCups;
                      
                      return (
                        <div 
                          key={idx} 
                          className={`relative w-8 h-10 rounded-b-lg rounded-t-sm border-2 transition-all duration-300 ${
                            isFilled 
                              ? 'border-blue-400 dark:border-blue-500 shadow-md' 
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div 
                            className={`absolute bottom-0 left-0 right-0 h-7 rounded-b-md transition-all duration-500 ${
                              isFilled 
                                ? 'bg-blue-400 dark:bg-blue-500' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          ></div>
                          <div 
                            className={`absolute top-0 left-0 right-0 h-full flex items-center justify-center text-[10px] font-bold ${
                              isFilled 
                                ? 'text-white' 
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Standard progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{formatWaterFriendly(totalWaterIntake)}</span>
                      <span>{formatWaterFriendly(dailyWaterGoal)}</span>
                    </div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${goalPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {goalPercentage}% {t('completed')}
                      </span>
                      {getCupsRemaining() > 0 && (
                        <div className="mt-1 text-blue-500 font-medium">
                          {t('cupsRemaining', { count: getCupsRemaining() })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Goal setting */}                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-3">{t('waterGoal')}</h3>
                  
                  {/* Quick goal options */}
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {[1000, 1500, 2000, 2500, 3000].map(goal => (
                      <Button
                        key={goal}
                        variant={dailyWaterGoal === goal ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setDailyWaterGoal(goal);
                          saveWaterGoal(goal);
                        }}
                        className="transition-all hover:scale-105"
                      >
                        <div className="flex flex-col items-center">
                          <span>{mlToCups(goal)} {t('cups')}</span>
                          <span className="text-xs opacity-70">{goal >= 1000 ? `${goal/1000}L` : `${goal}ml`}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Fine tuning */}
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newGoal = Math.max(500, dailyWaterGoal - 250);
                        setDailyWaterGoal(newGoal);
                        saveWaterGoal(newGoal);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 text-center font-medium">
                      {formatWaterFriendly(dailyWaterGoal)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newGoal = dailyWaterGoal + 250;
                        setDailyWaterGoal(newGoal);
                        saveWaterGoal(newGoal);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>          {/* Add Water Entry - Cup-based UI */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('addWater')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cup visualization selector */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={() => setWaterAmount(CUP_SIZES.SMALL)}
                    variant={waterAmount === CUP_SIZES.SMALL ? "default" : "outline"}
                    className="flex flex-col items-center p-4 h-auto transition-all hover:scale-105"
                  >
                    <div className="relative w-12 h-14 mb-1">
                      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-b-lg rounded-t-sm border-2 border-blue-200 dark:border-blue-700 transform-gpu"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-10 bg-blue-400/70 dark:bg-blue-600/70 rounded-b-lg transform-gpu transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium mt-1">{t('smallCup')}</span>
                    <span className="text-xs text-gray-500">200 ml</span>
                  </Button>
                  
                  <Button
                    onClick={() => setWaterAmount(CUP_SIZES.MEDIUM)}
                    variant={waterAmount === CUP_SIZES.MEDIUM ? "default" : "outline"}
                    className="flex flex-col items-center p-4 h-auto transition-all hover:scale-105"
                  >
                    <div className="relative w-12 h-16 mb-1">
                      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-b-lg rounded-t-sm border-2 border-blue-200 dark:border-blue-700 transform-gpu"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-blue-400/70 dark:bg-blue-600/70 rounded-b-lg transform-gpu transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium mt-1">{t('standardCup')}</span>
                    <span className="text-xs text-gray-500">250 ml</span>
                  </Button>
                  
                  <Button
                    onClick={() => setWaterAmount(CUP_SIZES.GLASS)}
                    variant={waterAmount === CUP_SIZES.GLASS ? "default" : "outline"}
                    className="flex flex-col items-center p-4 h-auto transition-all hover:scale-105"
                  >
                    <div className="relative w-10 h-18 mb-1">
                      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700 transform-gpu"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-blue-400/70 dark:bg-blue-600/70 rounded-b-lg transform-gpu transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium mt-1">{t('glass')}</span>
                    <span className="text-xs text-gray-500">300 ml</span>
                  </Button>
                  
                  <Button
                    onClick={() => setWaterAmount(CUP_SIZES.BOTTLE)}
                    variant={waterAmount === CUP_SIZES.BOTTLE ? "default" : "outline"}
                    className="flex flex-col items-center p-4 h-auto transition-all hover:scale-105"
                  >
                    <div className="relative w-10 h-20 mb-1">
                      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-700 transform-gpu"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-blue-400/70 dark:bg-blue-600/70 rounded-b-lg transform-gpu transition-all duration-300"></div>
                    </div>
                    <span className="text-xs font-medium mt-1">{t('bottle')}</span>
                    <span className="text-xs text-gray-500">500 ml</span>
                  </Button>
                </div>
                
                {/* Custom adjustment */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-4 mb-3">
                    <Button 
                      variant="outline" 
                      onClick={() => adjustWaterAmount(-50)}
                      className="flex-shrink-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <Slider 
                        value={[waterAmount]} 
                        min={50} 
                        max={1000} 
                        step={50} 
                        onValueChange={(values) => setWaterAmount(values[0])}
                      />
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => adjustWaterAmount(50)}
                      className="flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-blue-500">
                      {formatWaterFriendly(waterAmount)}
                    </div>                    <Button 
                      onClick={addWaterEntryWithAnimation} 
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600 transition-transform active:scale-95"
                    >
                      <Droplet className={`h-4 w-4 mr-2 ${drinkingAnimation ? 'animate-bounce' : ''}`} />
                      {t('addWater')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Entry History */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('waterHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">{t('loading')}</p>
                </div>
              ) : waterEntries.length > 0 ? (
                <div className="space-y-2">                  {waterEntries.map((entry) => (
                    <div 
                      key={entry.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="relative w-8 h-10 mr-3">
                          <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-b-lg rounded-t-sm border-2 border-blue-200 dark:border-blue-700"></div>
                          <div className="absolute bottom-0 left-0 right-0 h-7 bg-blue-400/70 dark:bg-blue-600/70 rounded-b-lg"></div>
                        </div>
                        <div>
                          <span className="font-medium block">{formatWaterFriendly(entry.amount)}</span>
                          <span className="text-xs text-gray-500 block">{formatTime(entry.timestamp)}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWaterEntry(entry.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>{t('noWaterEntries')}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tips Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-700 dark:text-blue-300">{t('hydrationTips')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc list-inside text-blue-700 dark:text-blue-300">
                <li>{t('waterTip1')}</li>
                <li>{t('waterTip2')}</li>
                <li>{t('waterTip3')}</li>
                <li>{t('waterTip4')}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default WaterTrackerTab;
