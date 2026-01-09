-- Add onboarding_completed column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have onboarding_completed = false by default
UPDATE public.profiles 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;
