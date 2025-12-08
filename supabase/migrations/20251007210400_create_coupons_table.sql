/*
  # Create Coupons Table

  ## Overview
  This migration creates the coupons table for managing discount codes
  and promotional offers for Lulu Kitchen orders.

  ## Tables Created

  ### coupons
  Stores discount codes with usage tracking and validation rules:

  **Fields:**
  - `id` (uuid, primary key) - Unique coupon identifier
  - `code` (text, unique) - Coupon code (uppercase, unique)
  - `discount_type` (text) - Type of discount: 'percentage' or 'fixed'
  - `discount_value` (integer) - Discount amount (percentage 0-100 or fixed in agorot)
  - `min_order_amount` (integer) - Minimum order amount in agorot to use coupon
  - `max_uses` (integer) - Maximum number of times coupon can be used (NULL = unlimited)
  - `current_uses` (integer) - Number of times coupon has been used
  - `valid_from` (timestamptz) - When coupon becomes valid
  - `valid_until` (timestamptz) - When coupon expires
  - `active` (boolean) - Whether coupon is currently active
  - `description` (text) - Internal description/notes about the coupon
  - `created_at` (timestamptz) - When coupon was created
  - `updated_at` (timestamptz) - Last update timestamp

  ## Discount Types
  - **percentage**: discount_value is percentage (0-100)
    Example: discount_value = 20 means 20% off
  - **fixed**: discount_value is fixed amount in agorot
    Example: discount_value = 5000 means ₪50 off

  ## Indexes
  - `idx_coupons_code` - Fast coupon code lookup (unique)
  - `idx_coupons_active` - Filter active coupons
  - `idx_coupons_valid_dates` - Check validity period

  ## Security (Row Level Security)
  - RLS is enabled for secure access control
  - Public can SELECT only active, valid coupons
  - Service role has full access for management

  ## Important Notes
  - Coupon codes are stored in uppercase for consistency
  - Prices are in agorot (cents) to match orders table
  - max_uses = NULL means unlimited uses
  - current_uses is incremented when coupon is applied to an order
  - Coupons must be active AND within valid dates to be usable
*/

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Coupon code (unique, uppercase)
  code text UNIQUE NOT NULL,

  -- Discount configuration
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL CHECK (
    (discount_type = 'percentage' AND discount_value >= 0 AND discount_value <= 100) OR
    (discount_type = 'fixed' AND discount_value >= 0)
  ),

  -- Usage restrictions
  min_order_amount integer DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses integer CHECK (max_uses IS NULL OR max_uses > 0),
  current_uses integer DEFAULT 0 CHECK (current_uses >= 0),

  -- Validity period
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,

  -- Status
  active boolean DEFAULT true,

  -- Internal notes
  description text DEFAULT '',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

-- Function to uppercase coupon codes automatically
CREATE OR REPLACE FUNCTION uppercase_coupon_code()
RETURNS trigger AS $$
BEGIN
  NEW.code = UPPER(TRIM(NEW.code));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure uppercase codes
DROP TRIGGER IF EXISTS coupons_uppercase_code ON coupons;
CREATE TRIGGER coupons_uppercase_code
  BEFORE INSERT OR UPDATE OF code ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION uppercase_coupon_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS coupons_updated_at ON coupons;
CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- Enable Row Level Security
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active coupons within valid dates
CREATE POLICY "Public can view active valid coupons"
  ON coupons
  FOR SELECT
  TO anon, authenticated
  USING (
    active = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until >= now())
    AND (max_uses IS NULL OR current_uses < max_uses)
  );

-- Policy: Service role has full access
CREATE POLICY "Service role has full access"
  ON coupons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON coupons TO anon;
GRANT SELECT ON coupons TO authenticated;
GRANT ALL ON coupons TO service_role;
