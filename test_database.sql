-- ============================================================================
-- Quick Database Test Script
-- Run this after setting up the database to verify everything works
-- ============================================================================

-- Step 1: Check all tables exist
-- Expected: Should return 8+ tables including orders, reviews, etc.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Step 2: Check RLS policies are in place
-- Expected: Should return multiple policies for each table
SELECT
  tablename,
  policyname,
  ARRAY_TO_STRING(roles, ', ') as roles,
  cmd as command
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Step 3: Test order_number generation function
-- Expected: Should return something like "20251011-001"
SELECT generate_order_number();

-- Step 4: Test inserting a sample order
-- Expected: Success. 1 row inserted
INSERT INTO orders (
  customer_name,
  customer_phone,
  customer_email,
  delivery_date,
  delivery_time,
  delivery_city,
  delivery_address,
  apartment,
  notes,
  items,
  subtotal,
  shipping_cost,
  total_amount,
  payment_method,
  status
) VALUES (
  'לקוח בדיקה',
  '052-123-4567',
  'test@example.com',
  '2025-10-15',
  '18:00-20:00',
  'ירושלים',
  'רחוב הרצל 10',
  'דירה 5',
  'בבקשה לצלצל 5 דקות לפני הגעה',
  '[
    {
      "menuItem": {
        "name_he": "כופתאות אדומות",
        "name_en": "Red Dumplings",
        "price": 45
      },
      "quantity": 2,
      "selectedAddOns": []
    },
    {
      "menuItem": {
        "name_he": "אטריות מוקפצות",
        "name_en": "Stir-Fried Noodles",
        "price": 58
      },
      "quantity": 1,
      "selectedAddOns": [
        {
          "name_he": "ירקות נוספים",
          "name_en": "Extra Vegetables",
          "price": 10
        }
      ]
    }
  ]'::jsonb,
  15800,  -- ₪158.00 in agorot
  0,      -- Free shipping
  15800,
  'bit',
  'pending'
);

-- Step 5: Verify the order was created with auto-generated order_number
-- Expected: Should show the test order with an auto-generated order_number
SELECT
  order_number,
  customer_name,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
  status,
  ROUND(total_amount::numeric / 100, 2) || ' ₪' as total_ils
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- Step 6: Test inserting a contact message
-- Expected: Success. 1 row inserted
INSERT INTO contact_messages (
  name,
  phone,
  email,
  preferred_date,
  preferred_time,
  message,
  status
) VALUES (
  'יוסי כהן',
  '054-987-6543',
  'yossi@example.com',
  '2025-10-12',
  '14:00',
  'היי, אני מעוניין להזמין למסיבה של 20 אנשים. אשמח לפרטים נוספים.',
  'new'
);

-- Step 7: Verify contact message
-- Expected: Should show the test contact message
SELECT
  name,
  phone,
  LEFT(message, 50) || '...' as message_preview,
  status,
  TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
FROM contact_messages
ORDER BY created_at DESC
LIMIT 5;

-- Step 8: Test inserting a review
-- Expected: Success. 1 row inserted
INSERT INTO reviews (
  customer_name,
  customer_email,
  rating,
  review_he,
  review_en,
  approved,
  featured
) VALUES (
  'שרה לוי',
  'sara@example.com',
  5,
  'אוכל סיני מדהים! הכופתאות הכי טעימות שטעמתי. שירות מהיר ואדיב. ממליצה בחום!',
  'Amazing Chinese food! The dumplings are the most delicious I''ve ever tasted. Fast and friendly service. Highly recommend!',
  true,
  true
);

-- Step 9: Verify review and test public access
-- Expected: Should show only approved reviews
SELECT
  customer_name,
  rating,
  LEFT(review_he, 60) || '...' as review_preview,
  approved,
  featured,
  TO_CHAR(created_at, 'YYYY-MM-DD') as date
FROM reviews
WHERE approved = true
ORDER BY created_at DESC;

-- Step 10: Test inserting an add-on
-- Expected: Success. 1 row inserted
INSERT INTO add_ons (
  name_he,
  name_en,
  price,
  available,
  sort_order
) VALUES
  ('ירקות נוספים', 'Extra Vegetables', 10, true, 1),
  ('רוטב חריף', 'Spicy Sauce', 5, true, 2),
  ('אורז לבן', 'White Rice', 12, true, 3),
  ('אורז מטוגן', 'Fried Rice', 15, true, 4);

-- Step 11: Verify add-ons
-- Expected: Should show all available add-ons
SELECT
  name_he,
  name_en,
  price,
  available
FROM add_ons
WHERE available = true
ORDER BY sort_order;

-- Step 12: Test inserting coupons
-- Expected: Success. 2 rows inserted
INSERT INTO coupons (
  code,
  discount_type,
  discount_value,
  min_order_amount,
  max_uses,
  valid_from,
  valid_until,
  active,
  description
) VALUES
  ('WELCOME10', 'percentage', 10, 10000, 100, NOW(), NOW() + INTERVAL '30 days', true, 'קופון לקוחות חדשים - 10% הנחה'),
  ('FREESHIP', 'fixed', 4000, 50000, NULL, NOW(), NOW() + INTERVAL '7 days', true, 'משלוח חינם להזמנות מעל 500 ₪');

-- Step 13: Verify coupons
-- Expected: Should show active coupons
SELECT
  code,
  discount_type,
  CASE
    WHEN discount_type = 'percentage' THEN discount_value || '%'
    ELSE ROUND(discount_value::numeric / 100, 2) || ' ₪'
  END as discount,
  ROUND(min_order_amount::numeric / 100, 2) || ' ₪' as min_order,
  COALESCE(max_uses::text, 'unlimited') as max_uses,
  active,
  TO_CHAR(valid_until, 'YYYY-MM-DD') as expires
FROM coupons
WHERE active = true
ORDER BY created_at DESC;

-- ============================================================================
-- Summary: Check record counts
-- ============================================================================
SELECT
  'orders' as table_name,
  COUNT(*) as record_count
FROM orders
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM contact_messages
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'add_ons', COUNT(*) FROM add_ons
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL
SELECT 'cities', COUNT(*) FROM cities
UNION ALL
SELECT 'streets', COUNT(*) FROM streets
ORDER BY table_name;

-- ============================================================================
-- All tests completed!
-- If you see results for all queries above, your database is working correctly!
-- ============================================================================
