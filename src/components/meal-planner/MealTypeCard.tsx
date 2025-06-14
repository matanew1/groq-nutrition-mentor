
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
        className={`${meals.length === 0 ? 'opacity-90' : ''} h-full`}
      >
        <div className={`p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700 gap-3 ${mealType.style}`}>
          <h4 className="heading-enhanced text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl" aria-hidden>{mealType.icon}</span>
            <span className="text-center sm:text-left">{mealType.label}</span>
          </h4>
          <EnhancedBadge 
            variant={meals.length > 0 ? 'success' : 'default'}
          >
            {meals.length} {meals.length === 1 ? t('item') : t('items')}
          </EnhancedBadge>
        </div>

        <div className="p-4 sm:p-5">
          {meals.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8 italic text-sm sm:text-base">
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
