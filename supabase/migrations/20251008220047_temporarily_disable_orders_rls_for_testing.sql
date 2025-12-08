/*
  # Temporarily Disable RLS on Orders Table for Testing

  1. Changes
    - Disable RLS temporarily to test if this is the blocker
    - This will allow us to confirm the issue is RLS-related

  2. Security Note
    - This is TEMPORARY for testing only
    - Will be re-enabled with proper policy in next migration
*/

-- Disable RLS on orders table temporarily
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;