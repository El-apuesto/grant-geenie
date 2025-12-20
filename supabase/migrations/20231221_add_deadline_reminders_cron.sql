-- Enable pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Schedule deadline reminders to run daily at 9 AM UTC (4 AM EST)
select cron.schedule(
  'send-deadline-reminders',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  select
    net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'SUPABASE_FUNCTIONS_URL') || '/send-deadline-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'SUPABASE_SERVICE_ROLE_KEY')
      ),
      body := '{}'
    );
  $$
);
