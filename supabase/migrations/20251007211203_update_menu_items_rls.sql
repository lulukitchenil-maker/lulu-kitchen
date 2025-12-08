/*
  # Update RLS policies for menu_items

  1. Changes
    - Drop overly restrictive policies
    - Add simple policy that allows anyone to read all items
    - Keep table secure but readable
*/

DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can view all menu items" ON menu_items;

CREATE POLICY "Public read access to menu items"
  ON menu_items FOR SELECT
  USING (true);
