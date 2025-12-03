-- Add 'status' column to profiles to track ALIVE vs DEAD state
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ALIVE';

-- Update the 'check_vital_signs' function (or the Edge Function logic) to use this status
-- (Note: The Edge Function logic is in TypeScript, so we don't need to change SQL for that, 
-- but we need the column to exist).

-- Optional: Add a function to 'respawn' (reset stats and set status to ALIVE)
CREATE OR REPLACE FUNCTION respawn()
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET status = 'ALIVE',
        streak = 0,
        avatar_stage = 0,
        last_log_date = CURRENT_DATE
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
