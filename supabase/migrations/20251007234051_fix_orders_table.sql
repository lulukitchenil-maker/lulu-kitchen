/*
  # Fix Orders Table Issues

  1. Changes
    - Add missing `apartment` field to orders table
    - Fix `order_number` to auto-generate with default value
    - Make order_number optional on insert (will be auto-generated)

  2. Security
    - No changes to RLS policies
*/

-- Add apartment field if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'apartment'
  ) THEN
    ALTER TABLE orders ADD COLUMN apartment text DEFAULT '';
  END IF;
END $$;

-- Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  -- Get the count of orders today
  SELECT COUNT(*) + 1 INTO counter
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Format: YYYYMMDD-XXX (e.g., 20251007-001)
  new_number := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Update the order_number column to have a default value using the function
ALTER TABLE orders 
  ALTER COLUMN order_number SET DEFAULT generate_order_number();

-- Make order_number nullable temporarily for updates
ALTER TABLE orders 
  ALTER COLUMN order_number DROP NOT NULL;

-- Update existing rows with empty order_number
UPDATE orders 
SET order_number = generate_order_number()
WHERE order_number = '' OR order_number IS NULL;

-- Make order_number required again
ALTER TABLE orders 
  ALTER COLUMN order_number SET NOT NULL;