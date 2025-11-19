/*
  # Create Add-Ons Table

  ## Overview
  This migration creates the add_ons table for storing optional extras
  that customers can add to menu items (e.g., extra sauce, side dishes).

  ## Tables Created

  ### add_ons
  Stores all available add-ons with optional menu item associations:

  **Fields:**
  - `id` (uuid, primary key) - Unique add-on identifier
  - `menu_item_id` (uuid, nullable) - Optional link to specific menu item
  - `name_he` (text) - Hebrew name of the add-on
  - `name_en` (text) - English name of the add-on
  - `price` (numeric) - Additional price in shekels
  - `available` (boolean) - Whether add-on is currently available
  - `sort_order` (integer) - Display order in the UI
  - `created_at` (timestamptz) - When add-on was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## Relationships
  - Optional foreign key to menu_items table
  - If menu_item_id is NULL, add-on is available for all items
  - If menu_item_id is set, add-on is specific to that menu item

  ## Indexes
  - `idx_add_ons_menu_item_id` - Fast lookup of add-ons for specific items
  - `idx_add_ons_available` - Fast filtering of available add-ons
  - `idx_add_ons_sort_order` - Efficient ordering for display

  ## Security (Row Level Security)
  - RLS is enabled for secure access control
  - Public can SELECT available add-ons
  - Service role has full access for management

  ## Important Notes
  - Price is stored as numeric (in shekels, not agorot)
  - Add-ons with NULL menu_item_id are "global" add-ons
  - Only available add-ons should be shown to customers
  - sort_order determines display sequence
*/

-- Create add_ons table
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Optional association with specific menu item
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,

  -- Add-on details
  name_he text NOT NULL,
  name_en text NOT NULL,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),

  -- Availability
  available boolean DEFAULT true,

  -- Display order
  sort_order integer DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_add_ons_menu_item_id ON add_ons(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_available ON add_ons(available);
CREATE INDEX IF NOT EXISTS idx_add_ons_sort_order ON add_ons(sort_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_add_ons_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS add_ons_updated_at ON add_ons;
CREATE TRIGGER add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_add_ons_updated_at();

-- Enable Row Level Security
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view available add-ons
CREATE POLICY "Public can view available add-ons"
  ON add_ons
  FOR SELECT
  TO anon, authenticated
  USING (available = true);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access"
  ON add_ons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON add_ons TO anon;
GRANT SELECT ON add_ons TO authenticated;
GRANT ALL ON add_ons TO service_role;
