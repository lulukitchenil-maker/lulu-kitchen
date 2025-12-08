/*
  # Create menu_items table

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key) - Unique identifier for each menu item
      - `name_he` (text) - Hebrew name of the dish
      - `name_en` (text) - English name of the dish
      - `description_he` (text) - Hebrew description
      - `description_en` (text) - English description
      - `price` (numeric) - Price in shekels
      - `category` (text) - Category (dumplings, stir-fry, sides, salads, soups, pastries, etc.)
      - `portion_size` (text, nullable) - Portion size description
      - `is_vegetarian` (boolean) - Vegetarian flag
      - `is_vegan` (boolean) - Vegan flag
      - `image_url` (text, nullable) - URL to dish image
      - `allergens` (text, nullable) - Allergen information
      - `available` (boolean) - Availability status
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Indexes
    - Index on `category` for fast filtering
    - Index on `sort_order` for ordering
    - Index on `available` for filtering active items

  3. Security
    - Enable RLS on `menu_items` table
    - Add policy for public read access (menu is public)
    - No write policies (admin only via service role)
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text NOT NULL,
  description_he text DEFAULT '',
  description_en text DEFAULT '',
  price numeric NOT NULL CHECK (price >= 0),
  category text NOT NULL DEFAULT 'other',
  portion_size text,
  is_vegetarian boolean DEFAULT false,
  is_vegan boolean DEFAULT false,
  image_url text,
  allergens text,
  available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (available = true);

CREATE POLICY "Anyone can view all menu items"
  ON menu_items FOR SELECT
  TO anon, authenticated
  USING (true);