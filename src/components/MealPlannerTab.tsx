import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Utensils, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/EnhancedCard';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <EnhancedCard className="p-8 max-w-md">
          <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl mb-6 mx-auto w-fit">
            <Utensils className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="heading-enhanced text-xl mb-3">
            {t('signInRequired')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('signInToSaveMeals')}
          </p>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Calendar Section */}
        <EnhancedCard variant="glass" className="lg:col-span-1">
          <EnhancedCardHeader>
            <EnhancedCardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              {t('selectDate')}
            </EnhancedCardTitle>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="calendar-enhanced">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl border-0 w-full"
              />
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Enhanced Meal Planning Section */}
        <div className="lg:col-span-2 space-y-6">
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <EnhancedCardTitle>
                  {selectedDate ? formatDateInHebrew(selectedDate) : t('selectDate')}
                </EnhancedCardTitle>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(loading || addingMeal) && (
                    <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">{t('loading')}</span>
                    </div>
                  )}
                  {totalCalories > 0 && (
                    <EnhancedBadge variant="success">
                      🔥 {totalCalories} {t('calories')}
                    </EnhancedBadge>
                  )}
                </div>
              </div>
            </EnhancedCardHeader>

            <EnhancedCardContent className="space-y-6">
              {/* Enhanced Add Meal Form */}
              <div className="glass-card-enhanced p-5">
                <h4 className="heading-enhanced text-lg mb-4">{t('addNewMeal')}</h4>
                <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as typeof newMeal.type }))}
                    className="input-enhanced min-w-[140px]"
                    disabled={addingMeal}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {mealTypes.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  <EnhancedInput
                    placeholder={addingMeal ? t('addingMealWithNutrition') : t('enterMealName')}
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && !addingMeal && handleAddMeal()}
                    className="flex-1"
                    disabled={addingMeal}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <EnhancedButton 
                    onClick={handleAddMeal} 
                    disabled={loading || addingMeal || !newMeal.name.trim()}
                    loading={addingMeal}
                  >
                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    <span className="hidden sm:inline">{t('addMeal')}</span>
                  </EnhancedButton>
                </div>
              </div>

              {/* Enhanced Meals by Type */}
              <div className="space-y-5">
                {mealTypes.map(mealType => {
                  const typeMeals = getMealsByType(mealType.key as 'breakfast' | 'lunch' | 'dinner' | 'snack');
                  return (
                    <EnhancedCard
                      key={mealType.key}
                      variant="meal"
                      className={typeMeals.length === 0 ? 'opacity-90' : ''}
                    >
                      <div className={`p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 ${mealType.style}`}>
                        <h4 className="heading-enhanced text-lg flex items-center gap-3">
                          <span className="text-2xl" aria-hidden>{mealType.icon}</span>
                          <span>{mealType.label}</span>
                        </h4>
                        <EnhancedBadge 
                          variant={typeMeals.length > 0 ? 'success' : 'default'}
                        >
                          {typeMeals.length} {typeMeals.length === 1 ? t('item') : t('items')}
                        </EnhancedBadge>
                      </div>

                      <div className="p-5">
                        {typeMeals.length === 0 ? (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8 italic">
                            {t('noMealsPlanned')} {mealType.label.toLowerCase()}
                          </p>
                        ) : (
                          <ul className="space-y-4">
                            {typeMeals.map(meal => (
                              <li
                                key={meal.id}
                                className="glass-card-enhanced p-4 flex flex-col gap-3"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <span className="heading-enhanced text-lg">{meal.meal_name}</span>
                                    {meal.time && (
                                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {t('addedAt')} {meal.time}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {meal.calories && (
                                      <EnhancedBadge variant="warning">
                                        {meal.calories} {t('calories')}
                                      </EnhancedBadge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteMeal(meal.id)}
                                      className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 p-2 rounded-xl"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {meal.nutrition_data && meal.nutrition_data.foods && meal.nutrition_data.foods.length > 0 && (
                                  <div className="glass-card-enhanced p-4 border border-emerald-200 dark:border-emerald-700">
                                    <h6 className="heading-enhanced text-sm mb-3 flex items-center gap-2">
                                      🍎 {t('nutritionFacts')}
                                    </h6>
                                    {meal.nutrition_data.foods.slice(0, 1).map((food: any, index: number) => (
                                      <div key={index} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <EnhancedBadge variant="default">💪 {Math.round(food.nf_protein)}g {t('protein')}</EnhancedBadge>
                                        <EnhancedBadge variant="default">🌾 {Math.round(food.nf_total_carbohydrate)}g {t('carbs')}</EnhancedBadge>
                                        <EnhancedBadge variant="default">🧈 {Math.round(food.nf_total_fat)}g {t('fat')}</EnhancedBadge>
                                        <EnhancedBadge variant="default">🌿 {Math.round(food.nf_dietary_fiber)}g {t('fiber')}</EnhancedBadge>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </EnhancedCard>
                  );
                })}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerTab;
