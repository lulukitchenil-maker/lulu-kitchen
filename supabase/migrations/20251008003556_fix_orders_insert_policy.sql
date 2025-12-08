/*
  # Fix Orders Table INSERT Policy

  1. Changes
    - Drop existing "Anyone can create orders" policy
    - Create new policy that allows anonymous and authenticated users to insert orders
    - Remove the problematic WITH CHECK constraint

  2. Security
    - Allow public order creation (required for guest checkout)
    - Maintain other existing policies for viewing/updating orders
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Create a new policy for inserting orders that works correctly
CREATE POLICY "Public can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);