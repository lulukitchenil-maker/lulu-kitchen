/*
  # Add items and recommendations to orders table

  1. Changes
    - Add `items` JSONB column to store order items array
    - Add `recommendations` JSONB column to store recommendation items array
    - Add `apartment` and `floor` text columns for better address details
    - Update existing orders to have empty arrays for backward compatibility

  2. Security
    - Maintain existing RLS policies
    - No changes to access controls
*/

-- Add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'items'
  ) THEN
    ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'recommendations'
  ) THEN
    ALTER TABLE orders ADD COLUMN recommendations JSONB DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'apartment'
  ) THEN
    ALTER TABLE orders ADD COLUMN apartment TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'floor'
  ) THEN
    ALTER TABLE orders ADD COLUMN floor TEXT DEFAULT '';
  END IF;
END $$;

-- Update existing rows to have empty arrays if NULL
UPDATE orders 
SET items = '[]'::jsonb 
WHERE items IS NULL;

UPDATE orders 
SET recommendations = '[]'::jsonb 
WHERE recommendations IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN orders.items IS 'Array of order items with name, quantity, and price';
COMMENT ON COLUMN orders.recommendations IS 'Array of recommended items shown to customer';
COMMENT ON COLUMN orders.apartment IS 'Apartment number';
COMMENT ON COLUMN orders.floor IS 'Floor number';
