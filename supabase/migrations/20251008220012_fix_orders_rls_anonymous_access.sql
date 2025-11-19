/*
  # Fix Orders Table RLS for Anonymous Users

  1. Changes
    - Drop existing INSERT policy
    - Create new permissive INSERT policy for anonymous and authenticated users
    - Ensure WITH CHECK allows all inserts
    - Add explicit grant for anon role

  2. Security
    - Allow public order creation (required for guest checkout)
    - No restrictions on order creation
    - Maintain read restrictions through existing policies
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can create orders" ON orders;

-- Create new permissive policy for INSERT that allows all users
CREATE POLICY "Enable insert for anon and authenticated users"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Ensure anon role has INSERT permission
GRANT INSERT ON orders TO anon;
GRANT INSERT ON orders TO authenticated;

-- Also ensure they can read their own orders
GRANT SELECT ON orders TO anon;
GRANT SELECT ON orders TO authenticated;