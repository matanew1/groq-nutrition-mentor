
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MealPlan {
  id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_name: string;
  calories?: number;
  time?: string;
}

export const useMealPlans = () => {
  const [mealPlans, setMealPlans] = useState<{ [key: string]: MealPlan[] }>({});
  const [loading, setLoading] = useState(false);
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
        meal_type: plan.meal_type,
        meal_name: plan.meal_name,
        calories: plan.calories,
        time: plan.time
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

    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          date: mealPlan.date,
          meal_type: mealPlan.meal_type,
          meal_name: mealPlan.meal_name,
          calories: mealPlan.calories,
          time: mealPlan.time
        })
        .select()
        .single();

      if (error) throw error;

      const newMealPlan: MealPlan = {
        id: data.id,
        date: data.date,
        meal_type: data.meal_type,
        meal_name: data.meal_name,
        calories: data.calories,
        time: data.time
      };

      setMealPlans(prev => ({
        ...prev,
        [mealPlan.date]: [...(prev[mealPlan.date] || []), newMealPlan]
      }));

      toast({
        title: "Success",
        description: "Meal added to your plan!",
      });
    } catch (error: any) {
      console.error('Error adding meal plan:', error);
      toast({
        title: "Error adding meal",
        description: error.message,
        variant: "destructive",
      });
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
    loadMealPlans,
    addMealPlan,
    deleteMealPlan
  };
};
