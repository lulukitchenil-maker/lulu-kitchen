/*
  # Create Orders View with Prices in Shekels

  1. New View
    - `orders_display` - View that shows prices in shekels (ILS) instead of agorot (cents)
  
  2. Changes
    - Divides all price fields by 100 to show in shekels
    - Makes it easier to read orders in Supabase dashboard
  
  3. Note
    - This is a VIEW, not a table
    - The underlying data in `orders` table remains in agorot (cents)
    - This is just for display purposes
*/

-- Create view for displaying orders with prices in shekels
CREATE OR REPLACE VIEW orders_display AS
SELECT 
  id,
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  delivery_date,
  delivery_time,
  delivery_city,
  delivery_address,
  apartment,
  notes,
  payment_method,
  items,
  ROUND(subtotal::numeric / 100, 2) as subtotal_ils,
  ROUND(shipping_cost::numeric / 100, 2) as shipping_ils,
  ROUND(discount_amount::numeric / 100, 2) as discount_ils,
  ROUND(total_amount::numeric / 100, 2) as total_ils,
  coupon_code,
  status,
  created_at,
  updated_at
FROM orders
ORDER BY created_at DESC;