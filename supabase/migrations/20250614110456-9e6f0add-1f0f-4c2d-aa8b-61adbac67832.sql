
-- Add nutrition_data column to meal_plans table to store detailed nutrition information
ALTER TABLE public.meal_plans 
ADD COLUMN nutrition_data JSONB;
