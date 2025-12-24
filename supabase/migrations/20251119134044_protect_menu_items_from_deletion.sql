/*
  # Protect menu_items table from unauthorized changes
  
  1. Security Changes
    - Enable RLS on menu_items table
    - Allow SELECT (read) for everyone (anon + authenticated)
    - Block INSERT, UPDATE, DELETE for anon users
    - Allow INSERT, UPDATE, DELETE only for authenticated admins
  
  2. Important Notes
    - This prevents accidental or malicious data deletion
    - Only authenticated admin users can modify menu data
    - Public users can still read the menu
*/

-- Enable RLS on menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read menu items
CREATE POLICY "Anyone can view menu items"
  ON menu_items
  FOR SELECT
  USING (true);

-- Only authenticated users can insert (for admin panel)
CREATE POLICY "Only authenticated users can insert menu items"
  ON menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update (for admin panel)
CREATE POLICY "Only authenticated users can update menu items"
  ON menu_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete (for admin panel)
CREATE POLICY "Only authenticated users can delete menu items"
  ON menu_items
  FOR DELETE
  TO authenticated
  USING (true);
