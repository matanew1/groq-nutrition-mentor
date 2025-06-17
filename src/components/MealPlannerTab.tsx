
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Utensils, Trash2, Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useMealPlans } from '@/hooks/useMealPlans';
import { format, addDays, subDays } from 'date-fns';

// Define interface for the food object
interface FoodItem {
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
  nf_dietary_fiber: number;
  nf_calories: number;
  food_name: string;
  nf_sugars?: number;
}

const MealPlannerTab = () => {
  const { t, language } = useSettings();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newMeal, setNewMeal] = useState({ name: '', type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack' });
  const { mealPlans, loading, addingMeal, loadMealPlans, addMealPlan, deleteMealPlan } = useMealPlans();

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const dayMeals = mealPlans[dateKey] || [];
  const isRTL = language === 'he';

  const mealTypes = [
    { key: 'breakfast', icon: '🌅', color: 'bg-gray-50 dark:bg-gray-800', label: t('breakfast') },
    { key: 'lunch', icon: '☀️', color: 'bg-gray-50 dark:bg-gray-800', label: t('lunch') },
    { key: 'dinner', icon: '🌙', color: 'bg-gray-50 dark:bg-gray-800', label: t('dinner') },
    { key: 'snack', icon: '🍎', color: 'bg-gray-50 dark:bg-gray-800', label: t('snack') }
  ];

  useEffect(() => {
    if (user && selectedDate) {
      loadMealPlans(dateKey);
    }
  //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateKey]);

  const formatDateInHebrew = (date: Date): string => {
    if (language === 'he') {
      const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
      const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
      
      const dayOfWeek = dayNames[date.getDay()];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      return `יום ${dayOfWeek}, ${day} ב${month} ${year}`;
    }
    return format(date, 'PPPP');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(prev => subDays(prev, 1));
    } else {
      setSelectedDate(prev => addDays(prev, 1));
    }
  };

  const handleAddMeal = async () => {
    if (!newMeal.name.trim() || !selectedDate || !user) return;

    await addMealPlan({
      date: dateKey,
      meal_type: newMeal.type,
      meal_name: newMeal.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setNewMeal({ name: '', type: 'breakfast' });
  };

  const handleDeleteMeal = async (mealId: string) => {
    await deleteMealPlan(mealId, dateKey);
  };

  const getMealsByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return dayMeals.filter(meal => meal.meal_type === type);
  };

  const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4 sm:mb-6">
          <Utensils className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 sm:mb-3">
          {t('signInRequired')}
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-sm">
          {t('signInToSaveMeals')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Remove top padding and optimize spacing */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 xl:gap-6 lg:gap-4 h-full overflow-hidden">
        
        {/* Date Selection Section - More compact */}
        <Card className="lg:col-span-1 mb-2 lg:mb-0 shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shrink-0">
          <CardHeader className="pb-2 sm:pb-3 shrink-0 py-2 px-3 sm:px-6">
            <CardTitle className={`text-sm sm:text-lg flex items-center gap-1 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
              <span className="hidden sm:inline">{t('selectDate')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 py-1 sm:py-4 flex-grow">
            {/* Mobile: Ultra compact date navigation */}
            <div className="block lg:hidden">
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="p-1 h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center flex-1">
                  <div className="text-sm font-medium">
                    {format(selectedDate, 'MMM dd')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(selectedDate, 'EEE')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="p-1 h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Desktop: Full calendar */}
            <div className="hidden lg:flex justify-center items-center h-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl border-0 w-full sm:scale-1 md:scale-90 lg:scale-100 xl:scale-110"
              />
            </div>
          </CardContent>
        </Card>

        {/* Meal Planning Section - Remove top spacing */}
        <div className="lg:col-span-2 flex flex-col h-full min-h-0 overflow-hidden">
          <Card className="shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-2 sm:pb-4 shrink-0 py-3 sm:py-4 px-3 sm:px-6">
              <div className="flex flex-col gap-1 sm:gap-2">
                <CardTitle className="text-sm sm:text-lg md:text-xl">
                  {selectedDate ? formatDateInHebrew(selectedDate) : t('selectDate')}
                </CardTitle>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(loading || addingMeal) && (
                    <div className={`flex items-center gap-1 text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="hidden sm:inline">{t('loading')}</span>
                    </div>
                  )}
                  {totalCalories > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                      🔥 {totalCalories} {t('calories')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col p-2 sm:p-6 pt-0" 
                         style={{ maxHeight: 'calc(100vh - 240px)' }}>
              {/* Add Meal Form - More compact */}
              <div className="p-2 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0 mb-2 sm:mb-3">
                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200 text-sm sm:text-base hidden sm:block">
                  {t('addNewMeal')}
                </h4>
                <div className={`flex flex-col gap-2 sm:gap-3 ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as typeof newMeal.type }))}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent h-8 sm:h-10"
                    disabled={addingMeal}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {mealTypes.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder={addingMeal ? t('addingMealWithNutrition') : t('enterMealName')}
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && !addingMeal && handleAddMeal()}
                    className="flex-1 focus:ring-2 focus:ring-green-500 focus:border-transparent h-8 sm:h-10 text-xs sm:text-sm"
                    disabled={addingMeal}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <Button 
                    onClick={handleAddMeal} 
                    disabled={loading || addingMeal || !newMeal.name.trim()}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-3 sm:px-6 h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    {addingMeal ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        <span className="hidden sm:inline">{t('addMeal')}</span>
                        <span className="sm:hidden">+</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Meals by Type - Optimized scrollable area */}
              <div 
                className="flex-1 overflow-y-auto min-h-0"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(200, 200, 200, 0.3) transparent',
                  maxHeight: 'calc(100vh - 320px)'
                }}
              >
                <div className="space-y-1 sm:space-y-2 pr-1">
                  {mealTypes.map(mealType => {
                    const typeMeals = getMealsByType(mealType.key as 'breakfast' | 'lunch' | 'dinner' | 'snack');
                    return (
                      <div key={mealType.key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className={`p-1.5 sm:p-4 ${mealType.color} border-b border-gray-200 dark:border-gray-600`}>
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold flex items-center gap-1 sm:gap-2 text-xs sm:text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="text-xs sm:text-xl">{mealType.icon}</span>
                              <span>{mealType.label}</span>
                            </h4>
                            <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 text-xs">
                              {typeMeals.length}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-1.5 sm:p-4 bg-white dark:bg-gray-800">
                          {typeMeals.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm italic text-center py-1 sm:py-4">
                              {t('noMealsPlanned')} {mealType.label.toLowerCase()}
                            </p>
                          ) : (
                            <div className="space-y-1 sm:space-y-3">
                              {typeMeals.map(meal => (
                                <div key={meal.id} className="bg-gray-50 dark:bg-gray-700/50 p-1.5 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-start justify-between mb-1 sm:mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-gray-800 dark:text-gray-200 truncate text-xs sm:text-base">
                                        {meal.meal_name}
                                      </h5>
                                      {meal.time && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {meal.time}
                                        </p>
                                      )}
                                    </div>
                                    <div className={`flex items-center gap-1 sm:gap-2 ${isRTL ? 'ml-0 mr-2 sm:mr-3' : 'ml-2 sm:ml-3'}`}>
                                      {meal.calories && (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                                          {meal.calories}
                                        </Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteMeal(meal.id)}
                                        className="p-1 sm:p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 h-6 w-6 sm:h-8 sm:w-8"
                                      >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Enhanced Nutrition Data Card - Mobile optimized */}
                                  {meal.nutrition_data && meal.nutrition_data.foods && meal.nutrition_data.foods.length > 0 && (
                                    <div className="mt-1 sm:mt-3 p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                                      <h6 className={`text-xs font-semibold text-green-800 dark:text-green-300 mb-1 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        🍎 {t('nutritionFacts')}
                                      </h6>
                                      {meal.nutrition_data.foods.slice(0, 1).map((food: FoodItem, index: number) => (
                                        <div key={index} className="text-xs text-green-700 dark:text-green-300">
                                          <div className="grid grid-cols-2 gap-1">
                                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>💪</span>
                                              <span className="text-xs">{Math.round(food.nf_protein || 0)}g</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>🌾</span>
                                              <span className="text-xs">{Math.round(food.nf_total_carbohydrate || 0)}g</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>🧈</span>
                                              <span className="text-xs">{Math.round(food.nf_total_fat || 0)}g</span>
                                            </div>
                                            <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>🌿</span>
                                              <span className="text-xs">{Math.round(food.nf_dietary_fiber || 0)}g</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerTab;
