# 🗄️ הוראות שחזור Database - Lulu Kitchen

## 📋 מצב נוכחי

הפרויקט שלך כולל קבצי migration בתיקייה `supabase/migrations/`, אבל הטבלאות הבסיסיות (orders, contact_messages, reviews, add_ons, coupons) לא נוצרו ב-database.

יצרתי עבורך את כל ה-migrations החסרים והם מוכנים להרצה!

---

## 🚀 שיטה 1: הרצה דרך Supabase Dashboard (מומלץ)

### שלב 1: כנס ל-Supabase Dashboard

1. גש ל-[Supabase Dashboard](https://app.supabase.com)
2. בחר את הפרויקט שלך: `bmeyaxprvzltkpochfcp`
3. בתפריט הצד, לחץ על **SQL Editor**

### שלב 2: הרץ את קובץ ה-SQL המאוחד

1. פתח את הקובץ `create_all_missing_tables.sql` מתיקיית הפרויקט
2. העתק את כל התוכן של הקובץ (675 שורות)
3. הדבק ב-SQL Editor ב-Supabase
4. לחץ על **Run** (או Ctrl/Cmd + Enter)

### שלב 3: בדוק שהכל עבר בהצלחה

לאחר ההרצה, אמור להופיע:
```
Success. No rows returned
```

זה אומר שהכל עבד מצוין!

---

## ✅ אימות שהטבלאות נוצרו

### בדיקה ויזואלית

1. בתפריט הצד של Supabase, לחץ על **Table Editor**
2. וודא שאתה רואה את הטבלאות הבאות:
   - ✅ `orders` - הזמנות לקוחות
   - ✅ `contact_messages` - הודעות צור קשר
   - ✅ `reviews` - המלצות לקוחות
   - ✅ `add_ons` - תוספות למנות
   - ✅ `coupons` - קופוני הנחה
   - ✅ `menu_items` - תפריט (הייתה כבר)
   - ✅ `cities` - ערים למשלוח (הייתה כבר)
   - ✅ `streets` - רחובות (הייתה כבר)

### בדיקה דרך SQL

הרץ את השאילתה הזו ב-SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

אמורות להופיע **לפחות 8 טבלאות**.

---

## 🔐 בדיקת Row Level Security (RLS)

וודא שה-RLS Policies הוגדרו נכון:

```sql
SELECT
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

אמורות להופיע policies עבור כל הטבלאות.

---

## 🧪 בדיקת פונקציונליות

### בדיקה 1: יצירת הזמנה (orders)

```sql
INSERT INTO orders (
  customer_name,
  customer_phone,
  delivery_date,
  delivery_time,
  delivery_city,
  delivery_address,
  items,
  subtotal,
  shipping_cost,
  total_amount
) VALUES (
  'בדיקה טסט',
  '0501234567',
  '2025-10-15',
  '18:00-20:00',
  'ירושלים',
  'רחוב הרצל 1',
  '[{"name": "כופתאות", "quantity": 2, "price": 45}]'::jsonb,
  9000,
  0,
  9000
);
```

אם עבד - תראה:
```
Success. 1 row inserted
```

לבדוק את מספר ההזמנה שנוצר:
```sql
SELECT order_number, customer_name, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 1;
```

### בדיקה 2: יצירת המלצה (reviews)

```sql
INSERT INTO reviews (
  customer_name,
  customer_email,
  rating,
  review_he,
  approved
) VALUES (
  'לקוח מרוצה',
  'test@example.com',
  5,
  'אוכל מעולה! ממליץ בחום!',
  true
);
```

### בדיקה 3: קריאת המלצות מאושרות

```sql
SELECT * FROM reviews WHERE approved = true;
```

אמורה להופיע ההמלצה שיצרת.

---

## 🚀 שיטה 2: הרצה דרך קבצי Migration (מתקדם)

אם אתה מעדיף להריץ כל migration בנפרד:

### לפי סדר:

```bash
# 1. Orders table
supabase/migrations/20251007210000_create_orders_table.sql

# 2. Contact Messages table
supabase/migrations/20251007210100_create_contact_messages_table.sql

# 3. Reviews table
supabase/migrations/20251007210200_create_reviews_table.sql

# 4. Add-Ons table
supabase/migrations/20251007210300_create_add_ons_table.sql

# 5. Coupons table
supabase/migrations/20251007210400_create_coupons_table.sql
```

העתק והדבק כל קובץ בנפרד ב-SQL Editor והרץ.

---

## 📊 מבנה הטבלאות שנוצרו

### 1. **orders** - הזמנות לקוחות
- מזהה הזמנה אוטומטי (`order_number`)
- פרטי לקוח (שם, טלפון, אימייל)
- כתובת משלוח מלאה
- פריטים בפורמט JSON
- מחירים באגורות (cents)
- סטטוס תשלום והזמנה
- **RLS**: אנונימיים יכולים ליצור, רק service role יכול לקרוא

### 2. **contact_messages** - הודעות צור קשר
- פרטי יצירת קשר (שם, טלפון, אימייל)
- תוכן ההודעה
- סטטוס טיפול (new/read/replied/archived)
- **RLS**: אנונימיים יכולים ליצור, רק service role יכול לקרוא

### 3. **reviews** - המלצות לקוחות
- שם ואימייל המליץ
- דירוג (1-5 כוכבים)
- טקסט ההמלצה (עברית + אנגלית)
- דגלי אישור והצגה (approved, featured)
- **RLS**: אנונימיים יכולים ליצור, כולם יכולים לקרוא מאושרות

### 4. **add_ons** - תוספות למנות
- שם עברי ואנגלי
- מחיר נוסף
- קישור אופציונלי למנה ספציפית
- **RLS**: כולם יכולים לקרוא תוספות זמינות

### 5. **coupons** - קופוני הנחה
- קוד קופון (אותיות גדולות אוטומטית)
- סוג הנחה (אחוזים או סכום קבוע)
- הגבלות שימוש (מינימום הזמנה, מקס שימושים)
- תאריכי תוקף
- **RLS**: כולם יכולים לקרוא קופונים פעילים ותקפים

---

## 🐛 פתרון בעיות נפוצות

### שגיאה: "relation already exists"

אם אתה רואה שגיאה כזו, זה אומר שהטבלה כבר קיימת. זה בסדר!
המערכת משתמשת ב-`CREATE TABLE IF NOT EXISTS` אז זה לא יגרום לבעיות.

### שגיאה: "permission denied"

וודא שאתה מחובר עם הרשאות מתאימות ב-Supabase Dashboard.

### לא רואה את הטבלאות ב-Table Editor

רענן את הדף (F5) ובדוק שוב.

### הזמנות לא נשמרות מהאתר

1. בדוק שה-migrations רצו בהצלחה
2. בדוק ב-Console של הדפדפן אם יש שגיאות
3. וודא שה-`.env` מוגדר נכון עם `VITE_SUPABASE_URL` ו-`VITE_SUPABASE_ANON_KEY`

---

## ✨ השלבים הבאים

לאחר שהטבלאות נוצרו בהצלחה:

1. **הרץ build** - `npm run build` כדי לוודא שהכל עובד
2. **בדוק את האתר** - הרץ `npm run dev` ונסה להכניס הזמנה
3. **מלא נתוני דמו** - הוסף מנות לתפריט, רחובות למשלוח, וכו'

---

## 📞 צריך עזרה?

אם נתקלת בבעיות:
1. בדוק את ה-Console ב-Supabase (Logs)
2. בדוק את ה-Console בדפדפן (F12)
3. ודא שכל משתני הסביבה ב-`.env` מוגדרים נכון

---

## 📝 סיכום מהיר

```bash
# 1. פתח Supabase Dashboard
https://app.supabase.com/project/bmeyaxprvzltkpochfcp

# 2. SQL Editor → הדבק את create_all_missing_tables.sql → Run

# 3. Table Editor → וודא 8 טבלאות

# 4. הרץ npm run build בפרויקט

# 5. בדוק שהאתר עובד עם npm run dev
```

**זהו! ה-Database שלך מוכן! 🎉**
