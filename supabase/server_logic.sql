-- =============================================
-- OPTIMAL PROTOCOL v2 - SERVER-SIDE LOGIC
-- =============================================

-- 1. HARDCORE MODE & STATE TRACKING
-- Add columns to track server-side state
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hardcore_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_log_date DATE;

-- 2. SECURE THE PROFILE (RLS)
-- Prevent users from faking their streak/level via API
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

CREATE POLICY "Users can update own profile metadata only."
  ON public.profiles
  FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- User CANNOT change these fields manually:
      streak IS NOT DISTINCT FROM (SELECT streak FROM public.profiles WHERE id = id)
      AND avatar_stage IS NOT DISTINCT FROM (SELECT avatar_stage FROM public.profiles WHERE id = id)
    )
  );

-- 3. STREAK CALCULATION ENGINE
-- This function recalculates the streak whenever a log is added/removed.
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    v_streak INT := 0;
    v_check_date DATE := CURRENT_DATE;
    v_has_logs BOOLEAN;
BEGIN
    -- Loop backwards from today
    LOOP
        -- Check if there are ANY logs for this date
        -- (MVP Logic: 1 log = Active. Strict Logic would require checking all habits)
        SELECT EXISTS (
            SELECT 1 FROM public.logs 
            WHERE user_id = p_user_id 
            AND date_string = to_char(v_check_date, 'YYYY-MM-DD')
        ) INTO v_has_logs;

        IF v_has_logs THEN
            v_streak := v_streak + 1;
            v_check_date := v_check_date - 1;
        ELSE
            -- If today is empty, don't break yet (maybe they haven't logged *yet* today)
            IF v_check_date = CURRENT_DATE THEN
                v_check_date := v_check_date - 1;
                CONTINUE;
            ELSE
                EXIT; -- Break on first missed day in the past
            END IF;
        END IF;
    END LOOP;

    RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGER: UPDATE STREAK ON LOGGING
CREATE OR REPLACE FUNCTION on_log_change()
RETURNS TRIGGER AS $$
DECLARE
    p_user_id UUID;
    v_new_streak INT;
BEGIN
    p_user_id := COALESCE(NEW.user_id, OLD.user_id);
    
    -- Recalculate Streak
    v_new_streak := calculate_streak(p_user_id);
    
    -- Update Profile
    UPDATE public.profiles
    SET streak = v_new_streak,
        last_active = now(),
        last_log_date = CURRENT_DATE
    WHERE id = p_user_id;
    
    RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_change ON public.logs;
CREATE TRIGGER trigger_log_change
AFTER INSERT OR DELETE ON public.logs
FOR EACH ROW EXECUTE PROCEDURE on_log_change();

-- 5. THE REAPER (HARDCORE CHECK - CLIENT SIDE FALLBACK)
-- Call this function from the client on App Init: supabase.rpc('check_vital_signs')
CREATE OR REPLACE FUNCTION check_vital_signs()
RETURNS JSONB AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_last_log_date DATE;
    v_days_missed INT;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
    
    -- If no profile, return neutral
    IF v_profile IS NULL THEN
        RETURN jsonb_build_object('status', 'UNKNOWN');
    END IF;

    -- Calculate missed days (Today - Last Log)
    -- If last_log_date is NULL, assume they are new (0 missed)
    v_last_log_date := COALESCE(v_profile.last_log_date, CURRENT_DATE);
    v_days_missed := CURRENT_DATE - v_last_log_date;
    
    -- HARDCORE LOGIC
    -- If Hardcore Mode is ON and we missed yesterday (gap > 1 day)
    IF v_profile.hardcore_mode AND v_days_missed > 1 THEN
        -- WIPE PROGRESS
        UPDATE public.profiles 
        SET streak = 0, avatar_stage = 0 
        WHERE id = auth.uid();
        
        RETURN jsonb_build_object(
            'status', 'DEAD', 
            'message', 'VITAL SIGNS LOST. PROTOCOL RESET.',
            'days_missed', v_days_missed
        );
    END IF;
    
    RETURN jsonb_build_object(
        'status', 'ALIVE', 
        'streak', v_profile.streak,
        'hardcore', v_profile.hardcore_mode
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. THE REAPER (BATCH JOB - CRON EXECUTION)
-- Run this via Cron Edge Function every night to kill inactive hardcore users
CREATE OR REPLACE FUNCTION reap_souls()
RETURNS INT AS $$
DECLARE
    v_killed_count INT;
BEGIN
    WITH killed_users AS (
        UPDATE public.profiles
        SET streak = 0, 
            avatar_stage = 0
        WHERE hardcore_mode = TRUE 
          AND (CURRENT_DATE - COALESCE(last_log_date, CURRENT_DATE)) > 1
        RETURNING id
    )
    SELECT count(*) INTO v_killed_count FROM killed_users;

    RETURN v_killed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
