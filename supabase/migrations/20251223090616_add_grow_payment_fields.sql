/*
  # Add Grow Payments Integration Fields
  
  1. New Columns
    - `grow_transaction_id` (text, nullable) - Stores Grow's transaction ID for tracking
    - `raw_webhook_data` (jsonb, nullable) - Stores complete webhook payload for debugging
  
  2. Changes
    - Adds indexes for faster webhook lookups
    - Updates trigger to auto-update `updated_at` timestamp
  
  3. Security
    - No RLS changes needed - webhook uses SERVICE_ROLE_KEY
*/

-- Add new columns for Grow Payments integration
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS grow_transaction_id text,
  ADD COLUMN IF NOT EXISTS raw_webhook_data jsonb;

-- Create index for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_grow_transaction 
  ON orders(grow_transaction_id) 
  WHERE grow_transaction_id IS NOT NULL;

-- Create index for order lookups by status
CREATE INDEX IF NOT EXISTS idx_orders_payment_status 
  ON orders(payment_status, created_at DESC);

-- Update trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at'
    ) THEN
        CREATE TRIGGER update_orders_updated_at 
            BEFORE UPDATE ON orders 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;