/*
  # Add Payment Fields to Orders Table

  1. Changes
    - Add `payment_status` field (pending, completed, failed)
    - Add `payment_method_type` field (cash, bit, paybox)
    - Add `payment_transaction_id` field for tracking
    - Add `payment_completed_at` timestamp

  2. Security
    - No changes to RLS policies (inherited from existing policies)
*/

-- Add payment_status field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;
END $$;

-- Add payment_method_type field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method_type text DEFAULT 'cash';
  END IF;
END $$;

-- Add payment_transaction_id field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_transaction_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_transaction_id text DEFAULT '';
  END IF;
END $$;

-- Add payment_completed_at field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_completed_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_completed_at timestamptz;
  END IF;
END $$;

-- Create index on payment_status for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Create index on payment_method_type for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_method_type ON orders(payment_method_type);