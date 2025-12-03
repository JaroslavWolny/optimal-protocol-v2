-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the "monitor-vital-signs" Edge Function to run every day at midnight (UTC)
-- NOTE: Replace 'YOUR_PROJECT_REF' and 'YOUR_SERVICE_ROLE_KEY' with actual values.
-- In a real Supabase deployment, it is often better to set this up via the Dashboard 
-- or use the Supabase CLI 'functions' config if available.

SELECT cron.schedule(
  'check-vital-signs-daily', -- unique name of the job
  '0 0 * * *',               -- cron syntax (every day at 00:00 UTC)
  $$
  select
    net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/monitor-vital-signs',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- To unschedule:
-- SELECT cron.unschedule('check-vital-signs-daily');
