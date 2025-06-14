
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
import { MealPlan } from '@/types/meal';
import { useSettings } from '@/contexts/SettingsContext';

interface MealItemProps {
  meal: MealPlan;
  onDelete: (mealId: string) => void;
}

export const MealItem = ({ meal, onDelete }: MealItemProps) => {
  const { t } = useSettings();

  return (
    <li
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
            onClick={() => onDelete(meal.id)}
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
  );
};
