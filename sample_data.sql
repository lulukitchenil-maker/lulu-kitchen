-- ============================================================================
-- Sample Data for Lulu Kitchen Database
-- This file contains realistic sample data for testing and demonstration
-- ============================================================================

-- ============================================================================
-- Sample Add-Ons (תוספות)
-- ============================================================================

INSERT INTO add_ons (name_he, name_en, price, available, sort_order) VALUES
  ('ירקות נוספים', 'Extra Vegetables', 10, true, 1),
  ('רוטב חריף', 'Spicy Sauce', 5, true, 2),
  ('רוטב סויה', 'Soy Sauce', 0, true, 3),
  ('אורז לבן', 'White Rice', 12, true, 4),
  ('אורז מטוגן', 'Fried Rice', 15, true, 5),
  ('נודלס נוספים', 'Extra Noodles', 8, true, 6),
  ('שום נוסף', 'Extra Garlic', 5, true, 7),
  ('בצל ירוק', 'Spring Onions', 3, true, 8),
  ('בוטנים קלויים', 'Roasted Peanuts', 8, true, 9),
  ('שומשום', 'Sesame Seeds', 3, true, 10)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Sample Coupons (קופונים)
-- ============================================================================

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
  -- Welcome coupon - 10% off
  ('WELCOME10', 'percentage', 10, 10000, 100, NOW(), NOW() + INTERVAL '90 days', true, 'קופון ברוכים הבאים - 10% הנחה על ההזמנה הראשונה'),

  -- Free shipping coupon
  ('FREESHIP', 'fixed', 4000, 50000, NULL, NOW(), NOW() + INTERVAL '30 days', true, 'משלוח חינם להזמנות מעל 500 ₪'),

  -- Weekend special - 15% off
  ('WEEKEND15', 'percentage', 15, 15000, 50, NOW(), NOW() + INTERVAL '60 days', true, 'מבצע סוף שבוע - 15% הנחה על הזמנות מעל 150 ₪'),

  -- Family meal deal - ₪30 off
  ('FAMILY30', 'fixed', 3000, 25000, 200, NOW(), NOW() + INTERVAL '45 days', true, '30 ₪ הנחה על ארוחה משפחתית מעל 250 ₪'),

  -- Birthday special - 20% off
  ('BIRTHDAY20', 'percentage', 20, 10000, 30, NOW(), NOW() + INTERVAL '30 days', true, 'מבצע יום הולדת מיוחד - 20% הנחה'),

  -- Expired coupon (for testing)
  ('EXPIRED', 'percentage', 50, 0, 100, NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day', false, 'קופון שפג תוקפו - לבדיקה'),

  -- Used up coupon (for testing)
  ('SOLDOUT', 'fixed', 5000, 10000, 5, NOW(), NOW() + INTERVAL '30 days', true, 'קופון שנגמר - כבר נוצל 5 פעמים')
ON CONFLICT (code) DO NOTHING;

-- Update the used coupon to show it's been used
UPDATE coupons SET current_uses = 5 WHERE code = 'SOLDOUT';

-- ============================================================================
-- Sample Reviews (המלצות)
-- ============================================================================

INSERT INTO reviews (
  customer_name,
  customer_email,
  rating,
  review_he,
  review_en,
  approved,
  featured
) VALUES
  (
    'שרה לוי',
    'sara.levi@example.com',
    5,
    'אוכל סיני מדהים! הכופתאות הכי טעימות שטעמתי. שירות מהיר ואדיב. בהחלט נזמין שוב!',
    'Amazing Chinese food! The dumplings are the most delicious I''ve ever tasted. Fast and friendly service. Will definitely order again!',
    true,
    true
  ),
  (
    'דוד כהן',
    'david.cohen@example.com',
    5,
    'הזמנו למסיבה והכל היה מושלם! המנות הגיעו חמות וטעימות. כמויות נדיבות. ממליץ בחום!',
    'Ordered for a party and everything was perfect! The dishes arrived hot and delicious. Generous portions. Highly recommend!',
    true,
    true
  ),
  (
    'מיכל אברהם',
    'michal.abraham@example.com',
    5,
    'לולו קיטשן זה פשוט הכי! האוכל מעולה, המחירים הוגנים, והשירות יוצא מן הכלל. תודה!',
    'Lulu Kitchen is simply the best! Excellent food, fair prices, and outstanding service. Thank you!',
    true,
    true
  ),
  (
    'יוסי מזרחי',
    'yossi.mizrahi@example.com',
    4,
    'אוכל טעים מאוד, הגיע מהר. ההזמנה הייתה מדויקת. רק הייתי שמח אם היו יותר אפשרויות צמחוניות.',
    'Very tasty food, arrived quickly. The order was accurate. Just wish there were more vegetarian options.',
    true,
    false
  ),
  (
    'רחל גרין',
    'rachel.green@example.com',
    5,
    'הזמנתי כופתאות והן פשוט נהדרות! הבצק רך והמילוי עשיר בטעמים. האריזה מצוינת. אחלה!',
    'Ordered dumplings and they are simply wonderful! The dough is soft and the filling is rich in flavors. Excellent packaging!',
    true,
    true
  ),
  (
    'אבי שלום',
    'avi.shalom@example.com',
    5,
    'מסעדה מעולה! הנודלס המוקפצים עם ירקות היו ברמה אחרת. אני וחברים כבר נסעים על זה כמה חודשים!',
    'Excellent restaurant! The stir-fried noodles with vegetables were on another level. My friends and I have been hooked for months!',
    true,
    false
  ),
  (
    'תמר לוין',
    'tamar.levin@example.com',
    4,
    'אוכל ביתי וטעים. המנות מגיעות בכמויות נדיבות. רק זמן המתנה קצת ארוך בסופי שבוע.',
    'Homemade and tasty food. Dishes arrive in generous portions. Just the wait time is a bit long on weekends.',
    true,
    false
  ),
  (
    'גל ברק',
    'gal.barak@example.com',
    5,
    'ההזמנה הכי טובה שעשיתי! הכל היה חם, טעים ומושלם. המשלוח הגיע בדיוק בזמן. תודה רבה!',
    'The best order I''ve made! Everything was hot, delicious and perfect. Delivery arrived right on time. Thank you so much!',
    true,
    true
  ),
  (
    'נועה רוזן',
    '',
    5,
    'סוף סוף מצאנו אוכל סיני מעולה בירושלים! הסאטה עם רוטב בוטנים היא חלום. אוכל משפחתי ואותנטי.',
    '',
    true,
    false
  ),
  (
    'עומר דהן',
    'omer.dahan@example.com',
    3,
    'אוכל טוב בסך הכל, אבל חיכיתי שעה וחצי למשלוח. כשהגיע היה קר. קצת מאכזב.',
    'Good food overall, but I waited an hour and a half for delivery. When it arrived it was cold. Bit disappointing.',
    false,
    false
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Sample Contact Messages (הודעות צור קשר)
-- ============================================================================

INSERT INTO contact_messages (
  name,
  phone,
  email,
  preferred_date,
  preferred_time,
  message,
  status
) VALUES
  (
    'משה ישראלי',
    '052-123-4567',
    'moshe@example.com',
    '2025-10-15',
    '19:00',
    'שלום, אני רוצה להזמין למסיבת יום הולדת של 25 אנשים. יש לכם מגשי אירוח? מה המחיר?',
    'new'
  ),
  (
    'יעל שטרן',
    '054-987-6543',
    'yael@example.com',
    '',
    '',
    'היי, יש לכם אפשרות למנות ללא גלוטן? אני רגישה לגלוטן ואשמח להזמין מכם.',
    'new'
  ),
  (
    'רון אשכנזי',
    '050-111-2233',
    '',
    '2025-10-20',
    '13:00',
    'אפשר לדעת אם אתם עובדים בשבת? רוצה להזמין לסעודה גדולה.',
    'read'
  ),
  (
    'דנה פרידמן',
    '053-444-5566',
    'dana.friedman@example.com',
    '',
    '',
    'קיבלתי מכם המלצה ממישהו. האם יש לכם קופונים למנויים חדשים?',
    'replied'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Sample Orders (הזמנות)
-- ============================================================================

-- Order 1: Regular order with multiple items
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
  payment_status,
  status
) VALUES (
  'אביגיל כהן',
  '052-111-2222',
  'avigail@example.com',
  '2025-10-12',
  '19:00-21:00',
  'ירושלים',
  'רחוב הרצל 25',
  'קומה 3, דירה 12',
  'בבקשה לצלצל 5 דקות לפני',
  '[
    {
      "menuItem": {
        "id": "1",
        "name_he": "כופתאות ברוטב אדום",
        "name_en": "Dumplings in Red Sauce",
        "price": 45
      },
      "quantity": 2,
      "selectedAddOns": [
        {"name_he": "רוטב חריף", "name_en": "Spicy Sauce", "price": 5}
      ]
    },
    {
      "menuItem": {
        "id": "2",
        "name_he": "נודלס מוקפצים עם ירקות",
        "name_en": "Stir-Fried Noodles with Vegetables",
        "price": 58
      },
      "quantity": 1,
      "selectedAddOns": []
    }
  ]'::jsonb,
  15300,
  0,
  15300,
  'bit',
  'completed',
  'delivered'
);

-- Order 2: Large family order
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
  coupon_code,
  payment_method,
  payment_status,
  status
) VALUES (
  'משפחת לוי',
  '054-333-4444',
  'levi.family@example.com',
  '2025-10-13',
  '18:30-20:30',
  'מבשרת ציון',
  'רחוב הגפן 8',
  'בית פרטי',
  'הזמנה גדולה למשפחה - 6 אנשים',
  '[
    {
      "menuItem": {"name_he": "כופתאות אדומות", "name_en": "Red Dumplings", "price": 45},
      "quantity": 4,
      "selectedAddOns": []
    },
    {
      "menuItem": {"name_he": "אטריות מוקפצות", "name_en": "Stir-Fried Noodles", "price": 58},
      "quantity": 3,
      "selectedAddOns": [{"name_he": "ירקות נוספים", "name_en": "Extra Vegetables", "price": 10}]
    },
    {
      "menuItem": {"name_he": "ירקות מוקפצים", "name_en": "Stir-Fried Vegetables", "price": 42},
      "quantity": 2,
      "selectedAddOns": []
    }
  ]'::jsonb,
  39200,
  2000,
  41200,
  'WELCOME10',
  'cash',
  'pending',
  'confirmed'
);

-- Order 3: Simple order
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
  payment_status,
  status
) VALUES (
  'יוסי ברק',
  '050-555-6666',
  '',
  '2025-10-14',
  '20:00-22:00',
  'ירושלים',
  'רחוב יפו 120',
  'דירה 5',
  '',
  '[
    {
      "menuItem": {"name_he": "מרק ירקות", "name_en": "Vegetable Soup", "price": 28},
      "quantity": 1,
      "selectedAddOns": []
    },
    {
      "menuItem": {"name_he": "סלט סיני", "name_en": "Chinese Salad", "price": 32},
      "quantity": 1,
      "selectedAddOns": []
    }
  ]'::jsonb,
  6000,
  0,
  6000,
  'paybox',
  'pending',
  'pending'
);

-- ============================================================================
-- Summary Report
-- ============================================================================

SELECT 'Sample data inserted successfully!' as status;

SELECT
  'add_ons' as table_name,
  COUNT(*) as records
FROM add_ons
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'contact_messages', COUNT(*) FROM contact_messages
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
ORDER BY table_name;

-- Show active coupons
SELECT
  '=== Active Coupons ===' as info,
  code,
  CASE
    WHEN discount_type = 'percentage' THEN discount_value || '% off'
    ELSE '₪' || (discount_value / 100) || ' off'
  END as discount
FROM coupons
WHERE active = true AND valid_until > NOW();

-- Show featured reviews
SELECT
  '=== Featured Reviews ===' as info,
  customer_name,
  rating || ' stars' as rating,
  LEFT(review_he, 60) || '...' as preview
FROM reviews
WHERE featured = true;

-- Show recent orders
SELECT
  '=== Recent Orders ===' as info,
  order_number,
  customer_name,
  status,
  '₪' || (total_amount::float / 100) as total
FROM orders
ORDER BY created_at DESC;
