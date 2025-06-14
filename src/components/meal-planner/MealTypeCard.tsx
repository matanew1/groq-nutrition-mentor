
import React from 'react';
import { EnhancedCard } from '@/components/ui/EnhancedCard';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
import { MealItem } from './MealItem';
import { MealPlan, MealTypeDetails } from '@/types/meal';
import { useSettings } from '@/contexts/SettingsContext';

interface MealTypeCardProps {
  mealType: MealTypeDetails;
  meals: MealPlan[];
  onDeleteMeal: (mealId: string) => void;
}

export const MealTypeCard = ({ mealType, meals, onDeleteMeal }: MealTypeCardProps) => {
  const { t } = useSettings();
  
  return (
    <div className="w-full">
      <EnhancedCard
        variant="meal"
        className={`${mealType.style} ${meals.length === 0 ? 'bg-opacity-70 dark:bg-opacity-70' : ''} h-full`}
      >
        <div className={`p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between border-b border-black/10 dark:border-white/10 gap-3`}>
          <h4 className="heading-enhanced text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl" aria-hidden>{mealType.icon}</span>
            <span className="text-center sm:text-left">{mealType.label}</span>
          </h4>
          <EnhancedBadge 
            variant={meals.length > 0 ? 'success' : 'default'}
            className="bg-white/30 dark:bg-black/20 backdrop-blur-sm"
          >
            {meals.length} {meals.length === 1 ? t('item') : t('items')}
          </EnhancedBadge>
        </div>

        <div className="p-4 sm:p-5">
          {meals.length === 0 ? (
            <p className="text-center text-current/70 dark:text-current/70 py-6 sm:py-8 italic text-sm sm:text-base">
              {t('noMealsPlanned')} {mealType.label.toLowerCase()}
            </p>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {meals.map(meal => (
                <MealItem
                  key={meal.id}
                  meal={meal}
                  onDelete={onDeleteMeal}
                />
              ))}
            </ul>
          )}
        </div>
      </EnhancedCard>
    </div>
  );
};
