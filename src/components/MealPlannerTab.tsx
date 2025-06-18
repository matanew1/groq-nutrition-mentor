
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
      <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-6 lg:p-8">
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800 rounded-full mb-4 md:mb-6">
          <Utensils className="h-8 w-8 md:h-12 md:w-12 lg:h-16 lg:w-16 text-gray-400" />
        </div>
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2 md:mb-3">
          {t('signInRequired')}
        </h3>
        <p className="text-sm md:text-base lg:text-lg text-gray-500 dark:text-gray-400 max-w-sm md:max-w-md lg:max-w-lg">
          {t('signInToSaveMeals')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Responsive layout: stack on mobile, side-by-side on larger screens */}
      <div className="flex flex-col xl:grid xl:grid-cols-3 2xl:grid-cols-4 h-full overflow-hidden gap-2 md:gap-4 lg:gap-6">
        
        {/* Date Selection Section - Responsive width */}
        <Card className="xl:col-span-1 2xl:col-span-1 shrink-0 shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-2 md:pb-3 lg:pb-4 shrink-0 py-2 md:py-3 lg:py-4 px-3 md:px-4 lg:px-6">
            <CardTitle className={`text-sm md:text-base lg:text-lg xl:text-xl flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-green-600" />
              <span className="hidden sm:inline">{t('selectDate')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-4 lg:px-6 py-1 md:py-2 lg:py-4 flex-grow">
            {/* Mobile/Tablet: Compact date navigation */}
            <div className="block xl:hidden">
              <div className="flex items-center justify-between p-2 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                  className="p-1 md:p-2 h-8 w-8 md:h-10 md:w-10"
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <div className="text-center flex-1">
                  <div className="text-sm md:text-base lg:text-lg font-medium">
                    {format(selectedDate, 'MMM dd')}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {format(selectedDate, 'EEE')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                  className="p-1 md:p-2 h-8 w-8 md:h-10 md:w-10"
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </div>
            </div>

            {/* Desktop/Large screens: Full calendar */}
            <div className="hidden xl:flex justify-center items-center h-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl border-0 w-full scale-90 xl:scale-95 2xl:scale-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Meal Planning Section - Responsive width */}
        <div className="xl:col-span-2 2xl:col-span-3 flex flex-col h-full min-h-0 overflow-hidden">
          <Card className="shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-2 md:pb-3 lg:pb-4 shrink-0 py-2 md:py-3 lg:py-4 px-3 md:px-4 lg:px-6">
              <div className="flex flex-col gap-1 md:gap-2">
                <CardTitle className="text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
                  {selectedDate ? formatDateInHebrew(selectedDate) : t('selectDate')}
                </CardTitle>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(loading || addingMeal) && (
                    <div className={`flex items-center gap-1 text-xs md:text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                      <span className="hidden sm:inline">{t('loading')}</span>
                    </div>
                  )}
                  {totalCalories > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs md:text-sm">
                      🔥 {totalCalories} {t('calories')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 min-h-0 flex flex-col p-2 md:p-4 lg:p-6 pt-0">
              {/* Add Meal Form - Responsive layout */}
              <div className="p-2 md:p-3 lg:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0 mb-2 md:mb-3 lg:mb-4">
                <h4 className="font-medium mb-2 md:mb-3 text-gray-800 dark:text-gray-200 text-sm md:text-base lg:text-lg hidden sm:block">
                  {t('addNewMeal')}
                </h4>
                <div className={`flex flex-col sm:flex-row gap-2 md:gap-3 lg:gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as typeof newMeal.type }))}
                    className="px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs md:text-sm lg:text-base bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent h-8 md:h-10 lg:h-11 sm:w-auto w-full"
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
                    className="flex-1 focus:ring-2 focus:ring-green-500 focus:border-transparent h-8 md:h-10 lg:h-11 text-xs md:text-sm lg:text-base"
                    disabled={addingMeal}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <Button 
                    onClick={handleAddMeal} 
                    disabled={loading || addingMeal || !newMeal.name.trim()}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-3 md:px-4 lg:px-6 h-8 md:h-10 lg:h-11 text-xs md:text-sm lg:text-base sm:w-auto w-full"
                  >
                    {addingMeal ? (
                      <Loader2 className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className={`h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 ${isRTL ? 'ml-1 md:ml-2' : 'mr-1 md:mr-2'}`} />
                        <span className="hidden sm:inline">{t('addMeal')}</span>
                        <span className="sm:hidden">+</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Meals by Type - Responsive scrollable area */}
              <div 
                className="flex-1 overflow-y-auto min-h-0"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(200, 200, 200, 0.3) transparent'
                }}
              >
                <div className="space-y-1 md:space-y-2 lg:space-y-3 pr-1">
                  {mealTypes.map(mealType => {
                    const typeMeals = getMealsByType(mealType.key as 'breakfast' | 'lunch' | 'dinner' | 'snack');
                    return (
                      <div key={mealType.key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className={`p-2 md:p-3 lg:p-4 ${mealType.color} border-b border-gray-200 dark:border-gray-600`}>
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold flex items-center gap-1 md:gap-2 lg:gap-3 text-xs md:text-sm lg:text-base xl:text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <span className="text-sm md:text-lg lg:text-xl">{mealType.icon}</span>
                              <span>{mealType.label}</span>
                            </h4>
                            <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 text-xs md:text-sm">
                              {typeMeals.length}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-2 md:p-3 lg:p-4 bg-white dark:bg-gray-800">
                          {typeMeals.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm lg:text-base italic text-center py-2 md:py-3 lg:py-4">
                              {t('noMealsPlanned')} {mealType.label.toLowerCase()}
                            </p>
                          ) : (
                            <div className="space-y-2 md:space-y-3 lg:space-y-4">
                              {typeMeals.map(meal => (
                                <div key={meal.id} className="bg-gray-50 dark:bg-gray-700/50 p-2 md:p-3 lg:p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                  <div className="flex items-start justify-between mb-1 md:mb-2 lg:mb-3">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-gray-800 dark:text-gray-200 truncate text-xs md:text-sm lg:text-base xl:text-lg">
                                        {meal.meal_name}
                                      </h5>
                                      {meal.time && (
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                          {meal.time}
                                        </p>
                                      )}
                                    </div>
                                    <div className={`flex items-center gap-1 md:gap-2 lg:gap-3 ${isRTL ? 'ml-0 mr-2 md:mr-3' : 'ml-2 md:ml-3'}`}>
                                      {meal.calories && (
                                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 text-xs md:text-sm">
                                          {meal.calories}
                                        </Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteMeal(meal.id)}
                                        className="p-1 md:p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 h-6 w-6 md:h-8 md:w-8 lg:h-9 lg:w-9"
                                      >
                                        <Trash2 className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {/* Enhanced Nutrition Data Card - Fully responsive */}
                                  {meal.nutrition_data && meal.nutrition_data.foods && meal.nutrition_data.foods.length > 0 && (
                                    <div className="mt-2 md:mt-3 lg:mt-4 p-2 md:p-3 lg:p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                                      <h6 className={`text-xs md:text-sm lg:text-base font-semibold text-green-800 dark:text-green-300 mb-1 md:mb-2 flex items-center gap-1 md:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        🍎 {t('nutritionFacts')}
                                      </h6>
                                      {meal.nutrition_data.foods.slice(0, 1).map((food: FoodItem, index: number) => (
                                        <div key={index} className="text-xs md:text-sm lg:text-base text-green-700 dark:text-green-300">
                                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-2 lg:gap-3">
                                            <div className={`flex items-center gap-1 md:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>💪</span>
                                              <span className="text-xs md:text-sm">{Math.round(food.nf_protein || 0)}g</span>
                                            </div>
                                            <div className={`flex items-center gap-1 md:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>🌾</span>
                                              <span className="text-xs md:text-sm">{Math.round(food.nf_total_carbohydrate || 0)}g</span>
                                            </div>
                                            <div className={`flex items-center gap-1 md:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>🧈</span>
                                              <span className="text-xs md:text-sm">{Math.round(food.nf_total_fat || 0)}g</span>
                                            </div>
                                            <div className={`flex items-center gap-1 md:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                              <span>🌿</span>
                                              <span className="text-xs md:text-sm">{Math.round(food.nf_dietary_fiber || 0)}g</span>
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
