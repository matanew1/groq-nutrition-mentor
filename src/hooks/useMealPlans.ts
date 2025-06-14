
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { searchNutrition } from '@/utils/nutritionixApi';
import { callGroqAPI } from '@/utils/groqApi';

interface MealPlan {
  id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_name: string;
  calories?: number;
  time?: string;
  nutrition_data?: any;
}

export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<{ [key: string]: MealPlan[] }>({});
  const [loading, setLoading] = useState(false);
  const [addingMeal, setAddingMeal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadMealPlans = async (date: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMealPlans = data.map((plan: any) => ({
        id: plan.id,
        date: plan.date,
        meal_type: plan.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        meal_name: plan.meal_name,
        calories: plan.calories,
        time: plan.time,
        nutrition_data: plan.nutrition_data
      }));

      setMealPlans(prev => ({
        ...prev,
        [date]: formattedMealPlans
      }));
    } catch (error: any) {
      console.error('Error loading meal plans:', error);
      toast({
        title: "Error loading meal plans",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addMealPlan = async (mealPlan: Omit<MealPlan, 'id'>) => {
    if (!user) return;

    setAddingMeal(true);
    let nutritionData = null;
    let calories = 0;

    try {
      // First, try to get nutrition data from Nutritionix
      console.log('Fetching nutrition data for:', mealPlan.meal_name);
      
      try {
        nutritionData = await searchNutrition(mealPlan.meal_name);
        if (nutritionData && nutritionData.foods && nutritionData.foods.length > 0) {
          const food = nutritionData.foods[0];
          calories = Math.round(food.nf_calories || 0);
          console.log('Got nutrition data:', { calories, food: food.food_name });
        }
      } catch (nutritionError) {
        console.log('Nutritionix failed, trying Groq AI for nutrition estimation');
        
        // If Nutritionix fails, use Groq AI to estimate nutrition
        try {
          const aiPrompt = `Please provide a brief nutrition estimate for "${mealPlan.meal_name}" in this exact format:
          Calories: [number]
          Protein: [number]g
          Carbs: [number]g
          Fat: [number]g
          
          Give realistic estimates based on typical serving sizes. Only respond with the nutrition data in the format above.`;
          
          const aiResponse = await callGroqAPI(aiPrompt);
          console.log('Groq AI nutrition response:', aiResponse);
          
          // Parse AI response to extract calories
          const calorieMatch = aiResponse.match(/Calories:\s*(\d+)/i);
          if (calorieMatch) {
            calories = parseInt(calorieMatch[1]);
          }
        } catch (aiError) {
          console.log('AI nutrition estimation also failed:', aiError);
        }
      }

      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          date: mealPlan.date,
          meal_type: mealPlan.meal_type,
          meal_name: mealPlan.meal_name,
          calories: calories || mealPlan.calories,
          time: mealPlan.time,
          nutrition_data: nutritionData
        })
        .select()
        .single();

      if (error) throw error;

      const newMealPlan: MealPlan = {
        id: data.id,
        date: data.date,
        meal_type: data.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        meal_name: data.meal_name,
        calories: data.calories,
        time: data.time,
        nutrition_data: data.nutrition_data
      };

      setMealPlans(prev => ({
        ...prev,
        [mealPlan.date]: [...(prev[mealPlan.date] || []), newMealPlan]
      }));

      toast({
        title: "Success",
        description: nutritionData ? "Meal added with nutrition data!" : "Meal added to your plan!",
      });
    } catch (error: any) {
      console.error('Error adding meal plan:', error);
      toast({
        title: "Error adding meal",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingMeal(false);
    }
  };

  const deleteMealPlan = async (id: string, date: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMealPlans(prev => ({
        ...prev,
        [date]: prev[date]?.filter(meal => meal.id !== id) || []
      }));

      toast({
        title: "Success",
        description: "Meal removed from your plan!",
      });
    } catch (error: any) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: "Error removing meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    mealPlans,
    loading,
    addingMeal,
    loadMealPlans,
    addMealPlan,
    deleteMealPlan
  };
};
