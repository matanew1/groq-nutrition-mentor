
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { EnhancedInput } from '@/components/ui/EnhancedInput';
import { useSettings } from '@/contexts/SettingsContext';
import { MealTypeDetails, MealTypeKey } from '@/types/meal';

interface AddMealFormProps {
  onAddMeal: (meal: { name: string; type: MealTypeKey }) => Promise<void>;
  addingMeal: boolean;
  mealTypes: MealTypeDetails[];
}

export const AddMealForm = ({ onAddMeal, addingMeal, mealTypes }: AddMealFormProps) => {
  const { t, language } = useSettings();
  const [newMeal, setNewMeal] = useState({ name: '', type: 'breakfast' as MealTypeKey });
  const isRTL = language === 'he';

  const handleAdd = async () => {
    if (!newMeal.name.trim()) return;
    await onAddMeal(newMeal);
    setNewMeal({ name: '', type: 'breakfast' });
  };

  return (
    <div className="glass-card-enhanced p-5">
      <h4 className="heading-enhanced text-lg mb-4">{t('addNewMeal')}</h4>
      <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
        <select
          value={newMeal.type}
          onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as MealTypeKey }))}
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
          onKeyPress={(e) => e.key === 'Enter' && !addingMeal && handleAdd()}
          className="flex-1"
          disabled={addingMeal}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <EnhancedButton 
          onClick={handleAdd} 
          disabled={addingMeal || !newMeal.name.trim()}
          loading={addingMeal}
        >
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
          <span className="hidden sm:inline">{t('addMeal')}</span>
        </EnhancedButton>
      </div>
    </div>
  );
};
