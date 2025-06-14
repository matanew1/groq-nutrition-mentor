
import React, { useState, useEffect } from 'react';
import { Utensils, Loader2 } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/EnhancedCard';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMealPlans } from '@/hooks/useMealPlans';
import { format } from 'date-fns';
import { MealTypeKey, MealTypeDetails } from '@/types/meal';
import { PlannerCalendar } from './meal-planner/PlannerCalendar';
import { AddMealForm } from './meal-planner/AddMealForm';
import { MealTypeCard } from './meal-planner/MealTypeCard';

const accessibleMealTypeStyles = {
  breakfast: 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  lunch: 'bg-sky-100/50 dark:bg-sky-900/30 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800',
  dinner: 'bg-violet-100/50 dark:bg-violet-900/30 text-violet-900 dark:text-violet-200 border-violet-200 dark:border-violet-800',
  snack: 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
}

const MealPlannerTab = () => {
  const { t, language } = useSettings();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { mealPlans, loading, addingMeal, loadMealPlans, addMealPlan, deleteMealPlan } = useMealPlans();

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const dayMeals = mealPlans[dateKey] || [];
  const isRTL = language === 'he';

  const mealTypes: MealTypeDetails[] = [
    { key: 'breakfast', icon: '🍳', style: accessibleMealTypeStyles.breakfast, label: t('breakfast') },
    { key: 'lunch', icon: '🌞', style: accessibleMealTypeStyles.lunch, label: t('lunch') },
    { key: 'dinner', icon: '🌙', style: accessibleMealTypeStyles.dinner, label: t('dinner') },
    { key: 'snack', icon: '🍎', style: accessibleMealTypeStyles.snack, label: t('snack') }
  ];

  useEffect(() => {
    if (user && selectedDate) {
      loadMealPlans(dateKey);
    }
  }, [user, dateKey, loadMealPlans]);

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

  const handleAddMeal = async (newMeal: { name: string; type: MealTypeKey }) => {
    if (!newMeal.name.trim() || !selectedDate || !user) return;

    await addMealPlan({
      date: dateKey,
      meal_type: newMeal.type,
      meal_name: newMeal.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    await deleteMealPlan(mealId, dateKey);
  };

  const getMealsByType = (type: MealTypeKey) => {
    return dayMeals.filter(meal => meal.meal_type === type);
  };

  const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <EnhancedCard className="p-6 sm:p-8 max-w-md w-full">
          <div className="flex-center-col space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl">
              <Utensils className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="heading-enhanced text-lg sm:text-xl mb-3">
              {t('signInRequired')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {t('signInToSaveMeals')}
            </p>
          </div>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <PlannerCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <EnhancedCard variant="glass">
            <EnhancedCardHeader>
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center justify-between">
                <EnhancedCardTitle className="text-center sm:text-left">
                  {selectedDate ? formatDateInHebrew(selectedDate) : t('selectDate')}
                </EnhancedCardTitle>
                <div className={`flex items-center justify-center sm:justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {(loading || addingMeal) && (
                    <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('loading')}</span>
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

            <EnhancedCardContent className="space-y-4 sm:space-y-6">
              <AddMealForm onAddMeal={handleAddMeal} addingMeal={addingMeal} mealTypes={mealTypes} />

              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                {mealTypes.map(mealType => (
                  <MealTypeCard
                    key={mealType.key}
                    mealType={mealType}
                    meals={getMealsByType(mealType.key)}
                    onDeleteMeal={handleDeleteMeal}
                  />
                ))}
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerTab;
