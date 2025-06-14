
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Utensils, Trash2, Loader2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMealPlans } from '@/hooks/useMealPlans';
import { format } from 'date-fns';

const MealPlannerTab = () => {
  const { t } = useSettings();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newMeal, setNewMeal] = useState({ name: '', type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack' });
  const { mealPlans, loading, loadMealPlans, addMealPlan, deleteMealPlan } = useMealPlans();

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const dayMeals = mealPlans[dateKey] || [];

  const mealTypes = [
    { key: 'breakfast', icon: '🌅', color: 'bg-orange-100 text-orange-700' },
    { key: 'lunch', icon: '☀️', color: 'bg-yellow-100 text-yellow-700' },
    { key: 'dinner', icon: '🌙', color: 'bg-purple-100 text-purple-700' },
    { key: 'snack', icon: '🍎', color: 'bg-green-100 text-green-700' }
  ];

  useEffect(() => {
    if (user && selectedDate) {
      loadMealPlans(dateKey);
    }
  }, [user, dateKey]);

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
      <div className="text-center py-20">
        <Utensils className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
          {t('signIn')} Required
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Please sign in to save and manage your meal plans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold mb-4 flex items-center">
            <Utensils className="h-5 w-5 mr-2" />
            {t('selectDate')}
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </Card>

        {/* Meal Planning */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {selectedDate ? format(selectedDate, 'PPPP') : t('selectDate')}
              </h3>
              <div className="flex items-center space-x-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {totalCalories > 0 && (
                  <Badge variant="secondary">
                    {totalCalories} {t('calories')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Add Meal Form */}
            <div className="flex gap-2 mb-6">
              <select
                value={newMeal.type}
                onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as typeof newMeal.type }))}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {mealTypes.map(type => (
                  <option key={type.key} value={type.key}>
                    {type.icon} {t(type.key)}
                  </option>
                ))}
              </select>
              <Input
                placeholder={t('addMeal')}
                value={newMeal.name}
                onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMeal()}
                className="flex-1"
              />
              <Button onClick={handleAddMeal} size="sm" disabled={loading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Meals by Type */}
            <div className="space-y-4">
              {mealTypes.map(mealType => {
                const typeMeals = getMealsByType(mealType.key as 'breakfast' | 'lunch' | 'dinner' | 'snack');
                return (
                  <div key={mealType.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center">
                        <span className="mr-2 text-lg">{mealType.icon}</span>
                        {t(mealType.key)}
                      </h4>
                      <Badge className={mealType.color}>
                        {typeMeals.length} items
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {typeMeals.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">
                          No meals planned
                        </p>
                      ) : (
                        typeMeals.map(meal => (
                          <div key={meal.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <div>
                              <p className="font-medium">{meal.meal_name}</p>
                              {meal.time && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{meal.time}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {meal.calories && (
                                <Badge variant="outline">
                                  {meal.calories} cal
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMeal(meal.id)}
                                className="p-1 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerTab;
