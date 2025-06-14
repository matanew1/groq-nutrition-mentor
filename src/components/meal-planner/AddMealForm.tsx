
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
    <div className="glass-card-enhanced" style={{ width: '100%' }}>
      <h4 className="heading-enhanced" style={{
        fontSize: '18px',
        textAlign: 'center',
        marginBottom: '16px'
      }}>{t('addNewMeal')}</h4>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <select
          value={newMeal.type}
          onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as MealTypeKey }))}
          className="input-enhanced"
          disabled={addingMeal}
          style={{
            width: '100%',
            minWidth: '140px',
            direction: isRTL ? 'rtl' : 'ltr'
          }}
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
          style={{ flex: 1 }}
          disabled={addingMeal}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <EnhancedButton 
          onClick={handleAdd} 
          disabled={addingMeal || !newMeal.name.trim()}
          loading={addingMeal}
          style={{ width: '100%' }}
        >
          <Plus style={{ height: '16px', width: '16px', marginRight: isRTL ? 0 : '4px', marginLeft: isRTL ? '4px' : 0 }} />
          <span>{t('addMeal')}</span>
        </EnhancedButton>
      </div>
    </div>
  );
};
