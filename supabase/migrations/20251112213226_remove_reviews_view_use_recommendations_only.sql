/*
  # Remove Reviews View - Use Recommendations Table Only

  ## Changes
  - Drop the 'reviews' VIEW (it's confusing and incomplete)
  - Keep only 'recommendations' table as the single source of truth
  - Recommendations table already has: approved, featured, customer_name, rating, comment

  ## Why?
  - Having both 'reviews' and 'recommendations' with the same data is confusing
  - The VIEW didn't include 'approved' and 'featured' columns
  - Simplifies the database structure

  ## Note
  - All frontend code should now use 'recommendations' table directly
*/

-- Drop the reviews view if it exists
DROP VIEW IF EXISTS reviews CASCADE;
