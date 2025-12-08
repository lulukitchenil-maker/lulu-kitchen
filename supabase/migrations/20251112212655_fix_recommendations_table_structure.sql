/*
  # Fix Recommendations Table Structure

  ## Changes
  - Add `approved` (boolean) - whether review is approved for display
  - Add `featured` (boolean) - whether review is featured on homepage
  - Rename `status` to be clear it's for admin moderation
  - Add indexes for performance

  ## Purpose
  This table is actually for CUSTOMER REVIEWS (not dish recommendations)
  It should be used for customer testimonials on the website

  ## Security
  - Public can only see approved reviews
  - Anyone can submit a review
  - Service role can moderate
*/

-- Add approved and featured columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recommendations' AND column_name = 'approved'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN approved boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'recommendations' AND column_name = 'featured'
  ) THEN
    ALTER TABLE recommendations ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_approved ON recommendations(approved);
CREATE INDEX IF NOT EXISTS idx_recommendations_featured ON recommendations(featured);

-- Enable RLS
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Enable read access for all users" ON recommendations;
DROP POLICY IF EXISTS "Enable insert for anon and authenticated users" ON recommendations;

-- New policies
CREATE POLICY "Public can view approved recommendations"
  ON recommendations
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Anyone can submit recommendations"
  ON recommendations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role full access"
  ON recommendations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON recommendations TO anon;
GRANT SELECT ON recommendations TO authenticated;
GRANT INSERT ON recommendations TO anon;
GRANT INSERT ON recommendations TO authenticated;
GRANT ALL ON recommendations TO service_role;
