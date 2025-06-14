
-- Create a table for meal plans
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT NOT NULL,
  calories INTEGER,
  time TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own meal plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own meal plans
CREATE POLICY "Users can view their own meal plans" 
  ON public.meal_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own meal plans
CREATE POLICY "Users can create their own meal plans" 
  ON public.meal_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own meal plans
CREATE POLICY "Users can update their own meal plans" 
  ON public.meal_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own meal plans
CREATE POLICY "Users can delete their own meal plans" 
  ON public.meal_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create an index for faster queries
CREATE INDEX idx_meal_plans_user_date ON public.meal_plans (user_id, date);
