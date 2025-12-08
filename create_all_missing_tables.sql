-- =============================================
-- Lulu Kitchen: Complete SQL Migrations
-- =============================================

-- ==================================================
-- Orders Table
-- ==================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT '',

  -- Customer info
  customer_name text NOT NULL,
  customer_email text DEFAULT '',
  customer_phone text NOT NULL,

  -- Delivery info
  delivery_date text NOT NULL,
  delivery_time text NOT NULL,
  delivery_city text NOT NULL,
  delivery_address text NOT NULL,
  apartment text DEFAULT '',

  -- Order details
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text DEFAULT '',

  -- Pricing
  subtotal integer NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  shipping_cost integer NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total_amount integer NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  coupon_code text DEFAULT '',

  -- Payment
  payment_method text NOT NULL DEFAULT 'cash',
  payment_method_type text DEFAULT 'cash',
  payment_transaction_id text DEFAULT '',
  payment_completed_at timestamptz,

  -- Order status
  status text NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  SELECT COUNT(*) + 1 INTO counter
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;

  new_number := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 3, '0');

  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) LOOP
    counter := counter + 1;
    new_number := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 3, '0');
  END LOOP;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE orders
  ALTER COLUMN order_number SET DEFAULT generate_order_number();

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon and authenticated users"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role has full access"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT INSERT ON orders TO anon;
GRANT INSERT ON orders TO authenticated;
GRANT ALL ON orders TO service_role;

-- ==================================================
-- Contact Messages Table
-- ==================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  name text NOT NULL,
  phone text NOT NULL,
  email text DEFAULT '',
  preferred_date text DEFAULT '',
  preferred_time text DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contact_messages_updated_at ON contact_messages;
CREATE TRIGGER contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon and authenticated users"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role has full access"
  ON contact_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT INSERT ON contact_messages TO anon;
GRANT INSERT ON contact_messages TO authenticated;
GRANT ALL ON contact_messages TO service_role;

-- ==================================================
-- Reviews Table
-- ==================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_name text NOT NULL,
  customer_email text DEFAULT '',
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_he text NOT NULL,
  review_en text DEFAULT '',
  approved boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reviews_updated_at ON reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon and authenticated users"
  ON reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view approved reviews"
  ON reviews
  FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Service role has full access"
  ON reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT INSERT ON reviews TO anon;
GRANT INSERT ON reviews TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON reviews TO authenticated;
GRANT ALL ON reviews TO service_role;

-- ==================================================
-- Add-Ons Table
-- ==================================================
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  name_he text NOT NULL,
  name_en text NOT NULL,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  available boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_add_ons_menu_item_id ON add_ons(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_add_ons_available ON add_ons(available);
CREATE INDEX IF NOT EXISTS idx_add_ons_sort_order ON add_ons(sort_order);

CREATE OR REPLACE FUNCTION update_add_ons_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_ons_updated_at ON add_ons;
CREATE TRIGGER add_ons_updated_at
  BEFORE UPDATE ON add_ons
  FOR EACH ROW
  EXECUTE FUNCTION update_add_ons_updated_at();

ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view available add-ons"
  ON add_ons
  FOR SELECT
  TO anon, authenticated
  USING (available = true);

CREATE POLICY "Service role has full access"
  ON add_ons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON add_ons TO anon;
GRANT SELECT ON add_ons TO authenticated;
GRANT ALL ON add_ons TO service_role;

-- ==================================================
-- Coupons Table
-- ==================================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL CHECK (
    (discount_type = 'percentage' AND discount_value >= 0 AND discount_value <= 100) OR
    (discount_type = 'fixed' AND discount_value >= 0)
  ),
  min_order_amount integer DEFAULT 0 CHECK (min_order_amount >= 0),
  max_uses integer CHECK (max_uses IS NULL OR max_uses > 0),
  current_uses integer DEFAULT 0 CHECK (current_uses >= 0),
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  active boolean DEFAULT true,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);

CREATE OR REPLACE FUNCTION uppercase_coupon_code()
RETURNS trigger AS $$
BEGIN
  NEW.code = UPPER(TRIM(NEW.code));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coupons_uppercase_code ON coupons;
CREATE TRIGGER coupons_uppercase_code
  BEFORE INSERT OR UPDATE OF code ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION uppercase_coupon_code();

CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS coupons_updated_at ON coupons;
CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active valid coupons"
  ON coupons
  FOR SELECT
  TO anon, authenticated
  USING (active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Service role has full access"
  ON coupons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON coupons TO anon;
GRANT SELECT ON coupons TO authenticated;
GRANT ALL ON coupons TO service_role;
