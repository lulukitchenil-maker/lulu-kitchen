/*
  # Protect menu_items table from unauthorized changes
  
  1. Changes
    - DROP all existing policies on menu_items
    - Create new RESTRICTIVE policies:
      - SELECT: Allow everyone (anon + authenticated)
      - INSERT/UPDATE/DELETE: DENY to everyone except service_role
  
  2. Security
    - Only Supabase Dashboard (service_role) can modify menu items
    - Regular authenticated users CANNOT modify menu items
    - Anonymous users can only read
  
  3. Important Notes
    - This prevents accidental/malicious changes to menu data
    - All modifications must be done through Supabase Dashboard
    - Protects pricing and image data integrity
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Only authenticated users can insert menu items" ON menu_items;
DROP POLICY IF EXISTS "Only authenticated users can update menu items" ON menu_items;
DROP POLICY IF EXISTS "Only authenticated users can delete menu items" ON menu_items;

-- Allow everyone to read menu items (this is fine)
CREATE POLICY "Public read access to menu items"
  ON menu_items
  FOR SELECT
  USING (true);

-- DENY INSERT for everyone (only service_role can insert via Dashboard)
CREATE POLICY "Deny insert for all users"
  ON menu_items
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- DENY UPDATE for everyone (only service_role can update via Dashboard)
CREATE POLICY "Deny update for all users"
  ON menu_items
  FOR UPDATE
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- DENY DELETE for everyone (only service_role can delete via Dashboard)
CREATE POLICY "Deny delete for all users"
  ON menu_items
  FOR DELETE
  TO authenticated, anon
  USING (false);

-- Add comment explaining the protection
COMMENT ON TABLE menu_items IS 'Protected table - can only be modified through Supabase Dashboard with service_role key';
