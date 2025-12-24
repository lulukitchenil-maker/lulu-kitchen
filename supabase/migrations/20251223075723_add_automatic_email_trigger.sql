/*
  # Add Automatic Email Trigger on Payment Confirmation

  1. Purpose
    - Automatically send confirmation emails when payment_status changes to 'paid'
    - Works without any API or webhook from Bit/Grow
    - Triggered by database update (manual or automatic)

  2. How it works
    - When admin updates order: payment_status → 'paid'
    - This trigger calls the send-payment-confirmation Edge Function
    - Emails are sent automatically to customer and business

  3. Security
    - Only triggers on status change (not on every update)
    - Uses Supabase built-in HTTP functions
    - Requires service role key (secure)
*/

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION send_payment_confirmation_emails()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  request_id bigint;
  supabase_url text;
  service_role_key text;
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    IF supabase_url IS NULL THEN
      supabase_url := 'https://ctbqgowxhcuspngagzst.supabase.co';
    END IF;
    
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/send-payment-confirmation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'orderId', NEW.id
      )
    ) INTO request_id;
    
    RAISE LOG 'Triggered email send for order %, request_id: %', NEW.id, request_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_payment_status_changed ON orders;

CREATE TRIGGER on_payment_status_changed
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_payment_confirmation_emails();

COMMENT ON FUNCTION send_payment_confirmation_emails() IS 'Automatically sends confirmation emails when order payment_status changes to paid';
