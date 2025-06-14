
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

const MealPlannerTab = () => {
  const { t } = useSettings();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newMeal, setNewMeal] = useState({ name: '', type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack' });
  const { mealPlans, loading, addingMeal, loadMealPlans, addMealPlan, deleteMealPlan } = useMealPlans();

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const dayMeals = mealPlans[dateKey] || [];

  const mealTypes = [
    { key: 'breakfast', icon: '🌅', color: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Breakfast' },
    { key: 'lunch', icon: '☀️', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Lunch' },
    { key: 'dinner', icon: '🌙', color: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Dinner' },
    { key: 'snack', icon: '🍎', color: 'bg-green-50 text-green-700 border-green-200', label: 'Snack' }
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-6">
          <Utensils className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Sign In Required
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Please sign in to save and manage your personalized meal plans.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile: Stack calendar and planner vertically */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-1 shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              Select Date
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
          <Card className="shadow-sm border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl">
                  {selectedDate ? format(selectedDate, 'PPPP') : 'Select a Date'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {(loading || addingMeal) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Loading...</span>
                    </div>
                  )}
                  {totalCalories > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      🔥 {totalCalories} cal
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Add Meal Form */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">Add New Meal</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, type: e.target.value as typeof newMeal.type }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={addingMeal}
                  >
                    {mealTypes.map(type => (
                      <option key={type.key} value={type.key}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder={addingMeal ? "Adding meal with nutrition data..." : "Enter meal name (e.g., 'Grilled chicken breast')"}
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && !addingMeal && handleAddMeal()}
                    className="flex-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={addingMeal}
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
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Add</span>
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
                    <div key={mealType.key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className={`p-4 ${mealType.color} border-b border-gray-200 dark:border-gray-600`}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <span className="text-xl">{mealType.icon}</span>
                            <span>{mealType.label}</span>
                          </h4>
                          <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                            {typeMeals.length} {typeMeals.length === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white dark:bg-gray-800">
                        {typeMeals.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-4">
                            No meals planned for {mealType.label.toLowerCase()}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {typeMeals.map(meal => (
                              <div key={meal.id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                      {meal.meal_name}
                                    </h5>
                                    {meal.time && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Added at {meal.time}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-3">
                                    {meal.calories && (
                                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300">
                                        {meal.calories} cal
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteMeal(meal.id)}
                                      className="p-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Enhanced Nutrition Data Card */}
                                {meal.nutrition_data && meal.nutrition_data.foods && meal.nutrition_data.foods.length > 0 && (
                                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                                    <h6 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1">
                                      🍎 Nutrition Facts
                                    </h6>
                                    {meal.nutrition_data.foods.slice(0, 1).map((food: any, index: number) => (
                                      <div key={index} className="text-sm text-green-700 dark:text-green-300">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                          <div className="flex items-center gap-1">
                                            <span>💪</span>
                                            <span className="text-xs">{Math.round(food.nf_protein || 0)}g protein</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span>🌾</span>
                                            <span className="text-xs">{Math.round(food.nf_total_carbohydrate || 0)}g carbs</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span>🧈</span>
                                            <span className="text-xs">{Math.round(food.nf_total_fat || 0)}g fat</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span>🌿</span>
                                            <span className="text-xs">{Math.round(food.nf_dietary_fiber || 0)}g fiber</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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
