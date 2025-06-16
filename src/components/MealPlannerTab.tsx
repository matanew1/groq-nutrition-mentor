import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Utensils, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMealPlans } from '@/hooks/useMealPlans';
import { format } from 'date-fns';

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
    <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Mobile-first layout: Stack vertically on small screens */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 xl:gap-8 lg:gap-6 p-1 sm:p-6 ">
        {/* Calendar Section - Collapsible on mobile */}
        <Card className="lg:col-span-1 mb-4 lg:mb-0 shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex flex-col">
          <CardHeader className="pb-2 sm:pb-3 shrink-0">
            <CardTitle className={`text-base sm:text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              {t('selectDate')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-4 py-1 sm:py-4 flex-grow">
            <div className="flex justify-center items-center h-full">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl border-0 w-full max-w-[400px] scale-100 sm:scale-105 md:scale-110"
              />
            </div>
          </CardContent>
        </Card>

        {/* Meal Planning Section */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-3 sm:pb-4 shrink-0">
              <div className="flex flex-col gap-2 sm:gap-3">
                <CardTitle className="text-base sm:text-lg md:text-xl">
                  {selectedDate ? formatDateInHebrew(selectedDate) : t('selectDate')}
                </CardTitle>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(loading || addingMeal) && (
                    <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span>{t('loading')}</span>
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

            <CardContent className="overflow-hidden">
              <div 
                className="h-full max-h-[calc(100vh-280px)] overflow-y-auto transparent-scrollbar" 
                style={{
                  padding: '0 1rem',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(200, 200, 200, 0.3) transparent',
                  msOverflowStyle: 'none' // For IE/Edge
                }}>
                <div className="flex flex-col space-y-4 sm:space-y-6">
                  {/* Add Meal Form - More compact on mobile */}
                  <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
                    <h4 className="font-medium mb-2 sm:mb-3 text-gray-800 dark:text-gray-200 text-sm sm:text-base">{t('addNewMeal')}</h4>
                    <div className={`flex flex-col gap-2 sm:gap-3 ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                      <select
                        value={newMeal.type}
                        onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as typeof newMeal.type }))}
                        className="px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent h-9 sm:h-10"
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
                        className="flex-1 focus:ring-2 focus:ring-green-500 focus:border-transparent h-9 sm:h-10 text-xs sm:text-sm"
                        disabled={addingMeal}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                      <Button 
                        onClick={handleAddMeal} 
                        disabled={loading || addingMeal || !newMeal.name.trim()}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-3 sm:px-6 h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        {addingMeal ? (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            <span className="hidden sm:inline">{t('addMeal')}</span>
                            <span className="sm:hidden">Add</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Meals by Type - Scrollable with mobile optimization */}
                  <div className="space-y-3 sm:space-y-4">
                    {mealTypes.map(mealType => {
                      const typeMeals = getMealsByType(mealType.key as 'breakfast' | 'lunch' | 'dinner' | 'snack');
                      return (
                        <div key={mealType.key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <div className={`p-3 sm:p-4 ${mealType.color} border-b border-gray-200 dark:border-gray-600`}>
                            <div className="flex items-center justify-between">
                              <h4 className={`font-semibold flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="text-base sm:text-xl">{mealType.icon}</span>
                                <span>{mealType.label}</span>
                              </h4>
                              <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 text-xs">
                                {typeMeals.length} {typeMeals.length === 1 ? t('item') : t('items')}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800">
                            {typeMeals.length === 0 ? (
                              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm italic text-center py-3 sm:py-4">
                                {t('noMealsPlanned')} {mealType.label.toLowerCase()}
                              </p>
                            ) : (
                              <div className="space-y-2 sm:space-y-3">
                                {typeMeals.map(meal => (
                                  <div key={meal.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-gray-800 dark:text-gray-200 truncate text-sm sm:text-base">
                                          {meal.meal_name}
                                        </h5>
                                        {meal.time && (
                                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {t('addedAt')} {meal.time}
                                          </p>
                                        )}
                                      </div>
                                      <div className={`flex items-center gap-1 sm:gap-2 ${isRTL ? 'ml-0 mr-2 sm:mr-3' : 'ml-2 sm:ml-3'}`}>
                                        {meal.calories && (
                                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                                            {meal.calories} {t('calories')}
                                          </Badge>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteMeal(meal.id)}
                                          className="p-1.5 sm:p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                        >
                                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Enhanced Nutrition Data Card - Mobile optimized */}
                                    {meal.nutrition_data && meal.nutrition_data.foods && meal.nutrition_data.foods.length > 0 && (
                                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                                        <h6 className={`text-xs sm:text-sm font-semibold text-green-800 dark:text-green-300 mb-1 sm:mb-2 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                          🍎 {t('nutritionFacts')}
                                        </h6>
                                        {meal.nutrition_data.foods.slice(0, 1).map((food: FoodItem, index: number) => (
                                          <div key={index} className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                                            <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                <span>💪</span>
                                                <span className="text-xs">{Math.round(food.nf_protein || 0)}g {t('protein')}</span>
                                              </div>
                                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                <span>🌾</span>
                                                <span className="text-xs">{Math.round(food.nf_total_carbohydrate || 0)}g {t('carbs')}</span>
                                              </div>
                                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                <span>🧈</span>
                                                <span className="text-xs">{Math.round(food.nf_total_fat || 0)}g {t('fat')}</span>
                                              </div>
                                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                <span>🌿</span>
                                                <span className="text-xs">{Math.round(food.nf_dietary_fiber || 0)}g {t('fiber')}</span>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerTab;
