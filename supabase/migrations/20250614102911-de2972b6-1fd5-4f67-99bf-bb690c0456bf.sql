
-- Add settings column to profiles table to store user preferences
ALTER TABLE public.profiles 
ADD COLUMN settings JSONB DEFAULT '{}';
