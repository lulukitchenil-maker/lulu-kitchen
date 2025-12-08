/*
  # Add phone column to recommendations table

  1. Changes
    - Add `phone` column to `recommendations` table
    - Set default value to empty string
    - Allow NULL values for backwards compatibility

  2. Security
    - No RLS changes needed (existing policies remain)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recommendations' AND column_name = 'phone'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN phone text DEFAULT '';
  END IF;
END $$;
