/*
  # Create vacation_settings table
  
  1. New Tables
    - `vacation_settings`
      - `id` (bigint, primary key)
      - `is_active` (boolean) - האם החופשה פעילה כרגע
      - `start_date` (date) - תאריך התחלה
      - `end_date` (date) - תאריך סיום
      - `message_he` (text) - הודעה בעברית
      - `message_en` (text) - הודעה באנגלית
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `vacation_settings` table
    - Allow SELECT (read) for everyone (anon + authenticated)
    - Allow INSERT, UPDATE, DELETE only for authenticated users (admins)
  
  3. Initial Data
    - Insert default inactive vacation setting
*/

-- Create vacation_settings table
CREATE TABLE IF NOT EXISTS vacation_settings (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  is_active boolean NOT NULL DEFAULT false,
  start_date date,
  end_date date,
  message_he text DEFAULT 'העסק סגור לחופשה',
  message_en text DEFAULT 'Business closed for vacation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE vacation_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read vacation settings
CREATE POLICY "Anyone can view vacation settings"
  ON vacation_settings
  FOR SELECT
  USING (true);

-- Only authenticated users (admins) can insert
CREATE POLICY "Only authenticated users can insert vacation settings"
  ON vacation_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can update
CREATE POLICY "Only authenticated users can update vacation settings"
  ON vacation_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users (admins) can delete
CREATE POLICY "Only authenticated users can delete vacation settings"
  ON vacation_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default inactive vacation (if not exists)
INSERT INTO vacation_settings (is_active, start_date, end_date, message_he, message_en)
VALUES (false, NULL, NULL, 'העסק סגור לחופשה', 'Business closed for vacation')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vacation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS vacation_settings_updated_at ON vacation_settings;
CREATE TRIGGER vacation_settings_updated_at
  BEFORE UPDATE ON vacation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_vacation_updated_at();
