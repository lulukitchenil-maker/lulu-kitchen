/*
  # Create Orders Table

  ## Overview
  This migration creates the main orders table for storing customer orders
  from the Lulu Kitchen online ordering system.

  ## Tables Created

  ### orders
  Main table for customer orders with complete order information:

  **Customer Information:**
  - `customer_name` (text) - Full name of customer
  - `customer_email` (text) - Email address (optional)
  - `customer_phone` (text) - Phone number for contact

  **Delivery Information:**
  - `delivery_date` (text) - Requested delivery date
  - `delivery_time` (text) - Requested delivery time slot
  - `delivery_city` (text) - City for delivery
  - `delivery_address` (text) - Street address
  - `apartment` (text) - Apartment/floor number

  **Order Information:**
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number (auto-generated)
  - `items` (jsonb) - Array of ordered items with quantities and add-ons
  - `notes` (text) - Special instructions from customer

  **Pricing (stored in agorot/cents):**
  - `subtotal` (integer) - Order subtotal before shipping
  - `shipping_cost` (integer) - Delivery fee
  - `total_amount` (integer) - Final total amount
  - `coupon_code` (text) - Applied coupon code if any

  **Payment Information:**
  - `payment_method` (text) - Customer's preferred payment method (cash/bit/paybox)
  - `payment_status` (text) - Current payment status (pending/completed/failed)
  - `payment_method_type` (text) - Actual payment type used
  - `payment_transaction_id` (text) - Transaction ID from payment provider
  - `payment_completed_at` (timestamptz) - When payment was completed

  **Status Tracking:**
  - `status` (text) - Order status (pending/confirmed/preparing/delivered/cancelled)
  - `created_at` (timestamptz) - Order creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Indexes
  Created for optimal query performance:
  - `idx_orders_status` - Fast filtering by order status
  - `idx_orders_payment_status` - Fast filtering by payment status
  - `idx_orders_created_at` - Fast date-based queries
  - `idx_orders_customer_phone` - Quick customer lookup
  - `idx_orders_order_number` - Fast order number lookup

  ## Security (Row Level Security)
  - RLS is enabled for secure access control
  - Anonymous users can INSERT orders (for guest checkout)
  - No read access by default (admin only via service role)
  - Service role has full access for admin operations

  ## Functions
  - `generate_order_number()` - Generates unique order numbers in format YYYYMMDD-XXX
  - `update_orders_updated_at()` - Automatically updates updated_at timestamp

  ## Important Notes
  - All prices stored in agorot (cents) to avoid floating point issues
  - Order numbers are auto-generated and guaranteed unique per day
  - Items stored as JSONB for flexibility with menu changes
  - RLS policies allow anonymous order creation but restrict viewing
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT '',

  -- Customer information
  customer_name text NOT NULL,
  customer_email text DEFAULT '',
  customer_phone text NOT NULL,

  -- Delivery information
  delivery_date text NOT NULL,
  delivery_time text NOT NULL,
  delivery_city text NOT NULL,
  delivery_address text NOT NULL,
  apartment text DEFAULT '',

  -- Order details
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text DEFAULT '',

  -- Pricing (in agorot/cents)
  subtotal integer NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  shipping_cost integer NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total_amount integer NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  coupon_code text DEFAULT '',

  -- Payment information
  payment_method text NOT NULL DEFAULT 'cash',
  payment_status text DEFAULT 'pending',
  payment_method_type text DEFAULT 'cash',
  payment_transaction_id text DEFAULT '',
  payment_completed_at timestamptz,

  -- Status
  status text NOT NULL DEFAULT 'pending',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
BEGIN
  -- Get the count of orders today + 1
  SELECT COUNT(*) + 1 INTO counter
  FROM orders
  WHERE DATE(created_at) = CURRENT_DATE;

  -- Format: YYYYMMDD-XXX (e.g., 20251007-001)
  new_number := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 3, '0');

  -- Check if this number already exists (race condition protection)
  WHILE EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) LOOP
    counter := counter + 1;
    new_number := TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::text, 3, '0');
  END LOOP;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Set default for order_number to use the function
ALTER TABLE orders
  ALTER COLUMN order_number SET DEFAULT generate_order_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain updated_at
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous and authenticated users to insert orders
CREATE POLICY "Enable insert for anon and authenticated users"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only service role can read/update/delete
CREATE POLICY "Service role has full access"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT INSERT ON orders TO anon;
GRANT INSERT ON orders TO authenticated;
GRANT ALL ON orders TO service_role;
