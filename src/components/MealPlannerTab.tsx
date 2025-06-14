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

const accessibleMealTypeStyles = {
  breakfast: 'bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-700',
  lunch: 'bg-yellow-50 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-200 border-yellow-100 dark:border-yellow-700',
  dinner: 'bg-violet-50 dark:bg-violet-900/50 text-violet-700 dark:text-violet-200 border-violet-100 dark:border-violet-800',
  snack: 'bg-green-50 dark:bg-green-900/60 text-green-700 dark:text-green-200 border-green-100 dark:border-green-800',
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
    { key: 'breakfast', icon: '🍳', style: accessibleMealTypeStyles.breakfast, label: t('breakfast') },
    { key: 'lunch', icon: '🌞', style: accessibleMealTypeStyles.lunch, label: t('lunch') },
    { key: 'dinner', icon: '🌙', style: accessibleMealTypeStyles.dinner, label: t('dinner') },
    { key: 'snack', icon: '🍎', style: accessibleMealTypeStyles.snack, label: t('snack') }
  ];

  useEffect(() => {
    if (user && selectedDate) {
      loadMealPlans(dateKey);
    }
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 aria-hidden">
          <Utensils className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          {t('signInRequired')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          {t('signInToSaveMeals')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-1 shadow-sm border-0 bg-card dark:bg-card backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CalendarIcon className="h-5 w-5 text-green-600" />
              {t('selectDate')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-lg border-0 w-full"
            />
          </CardContent>
        </Card>

        {/* Meal Planning Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-sm border-0 bg-card dark:bg-card backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl">
                  {selectedDate ? formatDateInHebrew(selectedDate) : t('selectDate')}
                </CardTitle>
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(loading || addingMeal) && (
                    <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">{t('loading')}</span>
                    </div>
                  )}
                  {totalCalories > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      🔥 {totalCalories} {t('calories')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Add Meal Form */}
              <div className="p-4 bg-muted dark:bg-muted/60 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">{t('addNewMeal')}</h4>
                <div className={`flex flex-col sm:flex-row gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as typeof newMeal.type }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="flex-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={addingMeal}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <Button 
                    onClick={handleAddMeal} 
                    disabled={loading || addingMeal || !newMeal.name.trim()}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 sm:px-6"
                  >
                    {addingMeal ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        <span className="hidden sm:inline">{t('addMeal')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Meals by Type */}
              <div className="space-y-4">
                {mealTypes.map(mealType => {
                  const typeMeals = getMealsByType(mealType.key as 'breakfast' | 'lunch' | 'dinner' | 'snack');
                  return (
                    <section
                      key={mealType.key}
                      className={`rounded-2xl mb-2 ring-1 ring-inset ring-border ${
                        typeMeals.length === 0
                          ? 'opacity-90'
                          : ''
                      }`}
                      aria-labelledby={`mealtype-${mealType.key}`}
                      tabIndex={0}
                    >
                      <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${mealType.style}`}>
                        <h4
                          id={`mealtype-${mealType.key}`}
                          className={`font-bold flex items-center gap-2 text-lg`}
                        >
                          <span aria-hidden>{mealType.icon}</span>
                          <span>{mealType.label}</span>
                        </h4>
                        <Badge
                          variant="outline"
                          className={`${typeMeals.length > 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'} px-3 py-1 rounded-full font-medium`}
                          aria-label={`${typeMeals.length} ${typeMeals.length === 1 ? t('item') : t('items')}`}
                        >
                          {typeMeals.length} {typeMeals.length === 1 ? t('item') : t('items')}
                        </Badge>
                      </div>

                      <div className="p-4 bg-popover dark:bg-popover w-full transition">
                        {typeMeals.length === 0 ? (
                          <p className="text-muted-foreground text-sm italic text-center py-4" aria-live="polite">
                            {t('noMealsPlanned')} {mealType.label.toLowerCase()}
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {typeMeals.map(meal => (
                              <li
                                key={meal.id}
                                className="bg-secondary dark:bg-secondary/60 p-4 rounded-lg border border-border flex flex-col gap-1 relative transition"
                                tabIndex={0}
                                aria-live="polite"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-lg text-foreground">{meal.meal_name}</span>
                                    {meal.time && (
                                      <span className="block text-xs text-muted-foreground mt-1">
                                        {t('addedAt')} {meal.time}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1 min-w-[65px]">
                                    {meal.calories && (
                                      <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-medium py-0.5 px-2 rounded">
                                        {meal.calories} {t('calories')}
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      aria-label={t('removeMeal')}
                                      onClick={() => handleDeleteMeal(meal.id)}
                                      className="hover:bg-destructive/10 hover:text-destructive p-2 rounded transition"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {/* Nutrition Data */}
                                {meal.nutrition_data && meal.nutrition_data.foods && meal.nutrition_data.foods.length > 0 && (
                                  <div className="mt-3 p-3 bg-accent dark:bg-accent/40 rounded-lg border border-accent/40">
                                    <h6 className="text-xs font-bold text-accent-foreground mb-2 flex items-center gap-1">
                                      🍎 {t('nutritionFacts')}
                                    </h6>
                                    {meal.nutrition_data.foods.slice(0, 1).map((food: any, index: number) => (
                                      <div key={index} className="text-xs text-accent-foreground grid grid-cols-2 sm:grid-cols-4 gap-1">
                                        <span>💪 {Math.round(food.nf_protein)}g {t('protein')}</span>
                                        <span>🌾 {Math.round(food.nf_total_carbohydrate)}g {t('carbs')}</span>
                                        <span>🧈 {Math.round(food.nf_total_fat)}g {t('fat')}</span>
                                        <span>🌿 {Math.round(food.nf_dietary_fiber)}g {t('fiber')}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerTab;
