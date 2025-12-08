/*
  # Create Reviews Table

  ## Overview
  This migration creates the reviews table for storing customer reviews
  and testimonials for Lulu Kitchen.

  ## Tables Created

  ### reviews
  Stores customer reviews with approval and featuring system:

  **Fields:**
  - `id` (uuid, primary key) - Unique review identifier
  - `customer_name` (text) - Reviewer's name
  - `customer_email` (text) - Reviewer's email (optional, for follow-up)
  - `rating` (integer) - Star rating from 1 to 5
  - `review_he` (text) - Review text in Hebrew
  - `review_en` (text) - Review text in English (optional)
  - `approved` (boolean) - Whether review is approved for public display
  - `featured` (boolean) - Whether review is featured on homepage
  - `created_at` (timestamptz) - When review was submitted
  - `updated_at` (timestamptz) - Last update timestamp

  ## Indexes
  - `idx_reviews_approved` - Fast filtering of approved reviews
  - `idx_reviews_featured` - Fast retrieval of featured reviews
  - `idx_reviews_rating` - Filtering by rating score
  - `idx_reviews_created_at` - Date-based sorting

  ## Security (Row Level Security)
  - RLS is enabled for secure access control
  - Anonymous users can INSERT reviews (for guest submissions)
  - Public can SELECT only approved reviews
  - Service role has full access for moderation

  ## Important Notes
  - Reviews start as not approved (approved = false)
  - Only approved reviews are visible to public
  - Featured reviews appear prominently on the website
  - Rating must be between 1 and 5
  - Hebrew review is required, English is optional
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reviewer information
  customer_name text NOT NULL,
  customer_email text DEFAULT '',

  -- Review content
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_he text NOT NULL,
  review_en text DEFAULT '',

  -- Moderation flags
  approved boolean DEFAULT false,
  featured boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS reviews_updated_at ON reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous and authenticated users to insert reviews
CREATE POLICY "Enable insert for anon and authenticated users"
  ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Public can view only approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access"
  ON reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON reviews TO anon;
GRANT INSERT ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON reviews TO authenticated;
GRANT ALL ON reviews TO service_role;
