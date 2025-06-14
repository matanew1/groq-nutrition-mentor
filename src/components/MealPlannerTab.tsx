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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center'
      }}>
        <EnhancedCard>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #dbeafe, #faf5ff)',
              borderRadius: '16px',
              padding: '12px'
            }}>
              <Utensils style={{ height: '48px', width: '48px', color: '#2563eb' }} />
            </div>
            <h3 className="heading-enhanced" style={{ fontSize: '20px', margin: '16px 0 8px 0' }}>
              {t('signInRequired')}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              {t('signInToSaveMeals')}
            </p>
          </div>
        </EnhancedCard>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 0%',
      minHeight: 0,
      width: '100%'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        flex: '1 1 0%',
        minHeight: 0,
        height: '100%',
        alignItems: 'flex-start'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}>
          <PlannerCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          flex: '1 1 0%',
          height: '100%',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}>
          <EnhancedCard variant="glass" style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 0%',
            minHeight: 0,
            height: '100%'
          }}>
            <EnhancedCardHeader>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                justifyContent: 'space-between'
              }}>
                <EnhancedCardTitle style={{ textAlign: 'center' }}>
                  {selectedDate ? formatDateInHebrew(selectedDate) : t('selectDate')}
                </EnhancedCardTitle>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  flexDirection: isRTL ? 'row-reverse' : 'row'
                }}>
                  {(loading || addingMeal) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#6b7280',
                      flexDirection: isRTL ? 'row-reverse' : 'row'
                    }}>
                      <Loader2 style={{ height: '16px', width: '16px' }} className="animate-spin" />
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
            <EnhancedCardContent style={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0%',
              minHeight: 0
            }}>
              <AddMealForm onAddMeal={handleAddMeal} addingMeal={addingMeal} mealTypes={mealTypes} />
              <div style={{
                flex: '1 1 0%',
                minHeight: 0,
                overflowY: 'auto'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                  {mealTypes.map(mealType => (
                    <MealTypeCard
                      key={mealType.key}
                      mealType={mealType}
                      meals={getMealsByType(mealType.key)}
                      onDeleteMeal={handleDeleteMeal}
                    />
                  ))}
                </div>
              </div>
            </EnhancedCardContent>
          </EnhancedCard>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerTab;
