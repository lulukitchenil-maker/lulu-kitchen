# 📋 מדריך ניהול תפריט ומחירים

## 🎯 סיכום המערכת

**הסנכרון האוטומטי מ-Google Sheets מושבת!**

כעת המערכת מנוהלת **רק ב-Supabase** - כל שינוי שתעשה ב-Supabase יישאר לצמיתות ולא יידרס.

### 🎨 ניהול התפריט ב-Supabase (הדרך היחידה!)

1. היכנס ל-**Supabase Dashboard**
2. עבור ל-**Table Editor** בתפריט צד
3. בחר טבלה **`menu_items`**
4. ערוך כל שדה ישירות:
   - 💰 **מחיר** (price)
   - 📝 **שם** (name_he / name_en)
   - 📄 **תיאור** (description_he / description_en)
   - 🖼️ **תמונה** (image_url)
   - 📊 **סטטוס** (availability_status)

### 📊 Google Sheets (גיבוי בלבד)

**קישור לעריכה:**
```
https://docs.google.com/spreadsheets/d/1WVTKCdmaxrGrGJYLo1MJAdD6tOLkt7FxHGUxWOyfcjQ/edit
```

**שימו לב:** Google Sheets לא משפיע יותר על האתר אלא אם תסנכרן ידנית!

---

## 🔄 סנכרון מ-Google Sheets (אופציונלי בלבד!)

**⚠️ אזהרה:** סנכרון ידני ימחק את **כל השינויים** ב-Supabase ויביא את הנתונים מ-Google Sheets!

רק אם עדכנת את ה-Google Sheet וצריך לסנכרן ל-Supabase:

```bash
node manual-sync-menu.mjs
```

זה יביא את כל הנתונים מ-Google Sheets וימחק את הטבלה הקיימת ב-Supabase.

---

## ⚠️ בעיות שטופלו

### כפילויות בתפריט

**✅ נפתר!** הכפילויות הבאות נמחקו:

1. ~~מאפה חואה ג'ואן מאודה בשר (ID 30)~~ - נמחק
2. ~~נודלס תוצרת בית טופו/ירק (ID 32)~~ - נמחק

כעת יש 30 מנות בלבד ללא כפילויות.

---

## 💡 עצות לניהול

### שינוי מחיר של מנה ספציפית:

**באמצעות SQL:**
```sql
UPDATE menu_items
SET price = 55
WHERE name_he = 'צ''או מיאן עוף וירקות';
```

**או בממשק Supabase:**
1. Table Editor → menu_items
2. מצא את השורה
3. לחץ על התא וערוך
4. שמור

### הוספת מנה חדשה:

```sql
INSERT INTO menu_items (
  name_he,
  name_en,
  price,
  category_he,
  category_en,
  availability_status,
  display_order
) VALUES (
  'מנה חדשה',
  'New Dish',
  60.00,
  'מוקפץ',
  'Stir-fry',
  'זמין',
  100
);
```

### מחיקת מנה:

```sql
DELETE FROM menu_items WHERE id = 30;
```

---

## 📊 שאילתות שימושיות

### הצגת כל המחירים:
```sql
SELECT id, name_he, price
FROM menu_items
ORDER BY price DESC;
```

### מציאת מנות יקרות:
```sql
SELECT name_he, price
FROM menu_items
WHERE price > 50
ORDER BY price DESC;
```

### ספירת מנות לפי קטגוריה:
```sql
SELECT category_he, COUNT(*) as count
FROM menu_items
GROUP BY category_he
ORDER BY count DESC;
```

---

## 🔐 גישה ל-Supabase

פרטי החיבור נמצאים בקובץ `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🆘 פתרון בעיות

### המחירים לא מתעדכנים באתר?
1. נקה cache בדפדפן (Ctrl+Shift+R או Ctrl+F5)
2. בדוק שהמחיר עודכן ב-Supabase
3. רענן את הדף פעמיים
4. בדוק בקונסול אם יש שגיאות

### יש כפילויות?
הרץ שאילתה זו לזיהוי כפילויות:
```sql
SELECT * FROM duplicate_menu_items;
```

### איך למחוק את כל התפריט ולהתחיל מחדש?
```sql
DELETE FROM menu_items WHERE id > 0;
```
ואז הרץ: `node manual-sync-menu.mjs`

---

## 📝 הערות חשובות

1. **גיבויים:** לפני מחיקות גדולות, תמיד עשה גיבוי
2. **סנכרון אוטומטי מושבת:** המערכת לא מסנכרנת יותר מ-Google Sheets באופן אוטומטי
3. **מקור האמת:** Supabase הוא מקור האמת היחידי - שינויים שם נשארים לצמיתות
4. **Google Sheets:** משמש רק כגיבוי או למקרה שתרצה לסנכרן ידנית
