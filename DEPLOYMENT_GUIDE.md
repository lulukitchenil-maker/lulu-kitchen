# 🚀 מדריך הפעלה ופריסה - Lulu Kitchen

## 📋 סקירה כללית

הפרויקט משתמש בארכיטקטורה היברידית:
- **Supabase** - מסד נתונים ראשי (הזמנות, הודעות, המלצות)
- **Google Apps Script** - שליחת מיילים ועדכון Google Sheets (אופציונלי)
- **React + Vite** - ממשק משתמש

---

## 🔧 הגדרה ראשונית

### 1. התקנת תלויות

```bash
npm install
```

### 2. הגדרת קובץ `.env`

צור קובץ `.env` בתיקיית הבסיס עם המשתנים הבאים:

```env
# Supabase (חובה)
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google Apps Script (אופציונלי - למיילים)
VITE_FORM_ENDPOINT=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_SHEET_ID=YOUR_GOOGLE_SHEET_ID

# פרטי עסק
VITE_BUSINESS_PHONE=052-520-1978
VITE_BUSINESS_EMAIL=lulu.kitchen.il@gmail.com
VITE_WHATSAPP_NUMBER=972525201978

# תשלומים
VITE_BIT_URL=https://www.bitpay.co.il/app/me/YOUR_BIT_ID
VITE_BIT_PHONE=0525201978
VITE_PAYBOX_URL=https://web.payboxapp.com/?v=pm&g=YOUR_GROUP_ID

# משלוח
VITE_DELIVERY_FEE=40
VITE_FREE_SHIPPING_THRESHOLD=800

# נוספים
VITE_IMAGES_BASE=https://lulu-k.com/images
VITE_CURRENCY=₪
```

---

## 📊 הגדרת Supabase (חובה)

### 1. יצירת טבלאות

הפרויקט כבר כולל migrations ב-`supabase/migrations/`. הטבלאות הבאות יווצרו אוטומטית:

- **orders** - הזמנות לקוחות
- **contact_messages** - הודעות צור קשר
- **reviews** - המלצות לקוחות
- **menu_items** - תפריט מנות
- **cities** - ערים למשלוח
- **streets** - רחובות למשלוח

### 2. RLS (Row Level Security)

כל הטבלאות מוגדרות עם RLS. ההרשאות:
- **אנונימי (anon)** - יכול להכניס הזמנות חדשות
- **מאומת (authenticated)** - יכול לקרוא ולערוך הכל

### 3. View למחירים

הפרויקט כולל view `orders_with_shekels` שמציג מחירים בשקלים:
```sql
SELECT *,
  (subtotal / 100.0) as subtotal_shekels,
  (shipping_cost / 100.0) as shipping_shekels,
  (total_amount / 100.0) as total_shekels
FROM orders;
```

---

## 📧 הגדרת Google Apps Script (אופציונלי)

Google Apps Script משמש **רק** לשליחת מיילים. אם המערכת נכשלת לשלוח מייל, ההזמנה עדיין נשמרת ב-Supabase.

### 1. יצירת Script

1. לך ל-https://script.google.com/
2. צור פרויקט חדש
3. העתק את הקוד מ-`google-apps-script.js`
4. עדכן:
   ```javascript
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
   const EMAIL_TO = 'lulu.kitchen.il@gmail.com';
   const EMAIL_TO_SECONDARY = 'lulu@lulu-k.com';
   ```

### 2. פריסת Script

1. Deploy → New Deployment
2. Type: **Web App**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Deploy
6. העתק את ה-URL

### 3. עדכון `.env`

```env
VITE_FORM_ENDPOINT=https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec
```

### 4. הרשאות Google Sheet

וודא שהאימייל שמריץ את הסקריפט יש לו הרשאת **Editor** ל-Google Sheet.

---

## 💳 הגדרת תשלומים

### Bit

1. קבל את הקישור האישי שלך מאפליקציית Bit
2. עדכן ב-`.env`:
   ```env
   VITE_BIT_URL=https://www.bitpay.co.il/app/me/YOUR_BIT_ID
   ```

### PayBox

1. התחבר ל-PayBox Business
2. קבל את קישור התשלום (עם פרמטר `g=`)
3. עדכן ב-`.env`:
   ```env
   VITE_PAYBOX_URL=https://web.payboxapp.com/?v=pm&g=YOUR_GROUP_ID
   ```

---

## 🏃 הרצה מקומית

```bash
npm run dev
```

האתר יהיה זמין ב-http://localhost:5173

---

## 🔨 בנייה לפרודקשן

```bash
npm run build
```

הקבצים יווצרו בתיקייה `dist/`.

---

## 📤 פריסה

### Netlify / Vercel

1. חבר את הריפוזיטורי
2. הגדר את משתני הסביבה מ-`.env`
3. Build command: `npm run build`
4. Publish directory: `dist`

### FTP (לשרת קיים)

1. `npm run build`
2. העלה את כל התוכן מ-`dist/` לשרת
3. וודא ש-`.env` לא מועלה (הוא ב-`.gitignore`)

---

## 🔍 בדיקות

### בדיקת הזמנה

1. הוסף מנה לעגלה
2. מלא פרטים בטופס הזמנה
3. בחר אמצעי תשלום
4. שלח

**מה צריך לקרות:**
- ✅ ההזמנה נשמרת ב-Supabase (טבלת `orders`)
- ✅ מייל נשלח ללקוח (אם Google Apps Script מוגדר)
- ✅ מייל נשלח למערכת (אם Google Apps Script מוגדר)
- ✅ שורה חדשה ב-Google Sheets (אם מוגדר)
- ✅ חלון תשלום נפתח (Bit/PayBox)

### בדיקת טופס צור קשר

1. מלא טופס צור קשר
2. שלח

**מה צריך לקרות:**
- ✅ ההודעה נשמרת ב-Supabase (טבלת `contact_messages`)
- ✅ מייל נשלח למערכת (אם Google Apps Script מוגדר)

### בדיקת המלצה

1. כתוב המלצה
2. שלח

**מה צריך לקרות:**
- ✅ ההמלצה נשמרת ב-Supabase (טבלת `reviews`)
- ✅ מייל נשלח למערכת (אם Google Apps Script מוגדר)

---

## 🐛 פתרון בעיות

### הזמנה לא נשמרת

1. **בדוק Console:**
   - פתח DevTools (F12)
   - לך ל-Console
   - חפש שגיאות אדומות

2. **בדוק Supabase:**
   - לך ל-Supabase Dashboard
   - Table Editor → orders
   - וודא שיש שורה חדשה

3. **בדוק RLS:**
   - Supabase → Authentication → Policies
   - וודא שיש policy ל-`anon` להכנסת הזמנות

### מייל לא נשלח

זה **לא בעיה קריטית**! ההזמנה נשמרת ב-Supabase גם אם המייל נכשל.

**לבדוק:**
1. ה-`VITE_FORM_ENDPOINT` תקין ב-`.env`?
2. ה-Google Apps Script פרוס עם "Anyone" access?
3. יש הרשאות ל-Google Sheet?

### תשלום לא נפתח

1. **בדוק את הקישורים:**
   - `VITE_BIT_URL` תקין?
   - `VITE_PAYBOX_URL` תקין?

2. **בדוק במובייל:**
   - Bit עובד רק באפליקציה
   - PayBox עובד בדפדפן

---

## 📝 עדכון תפריט

### דרך Supabase Dashboard

1. לך ל-Supabase Dashboard
2. Table Editor → menu_items
3. ערוך/הוסף מנות

### דרך Google Sheets Sync

1. עדכן את Google Sheets
2. הרץ `node sync-menu.mjs`

---

## 🔐 אבטחה

### מה בטוח להיות public:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY` (יש RLS!)
- ✅ `VITE_FORM_ENDPOINT`
- ✅ כל משתני `VITE_*`

### מה **לא** לשתף:
- ❌ `SUPABASE_SERVICE_ROLE_KEY` (אם יש)
- ❌ סיסמאות
- ❌ מפתחות פרטיים

---

## 📞 תמיכה

בעיות? צור issue בגיטהאב או פנה לצוות הפיתוח.

---

## ✅ Checklist לפני Go-Live

- [ ] כל משתני `.env` מוגדרים
- [ ] Supabase מוגדר והטבלאות קיימות
- [ ] Google Apps Script פרוס (אופציונלי)
- [ ] נבדקה הזמנה מלאה
- [ ] Bit/PayBox עובדים
- [ ] מיילים נשלחים (אם מוגדר)
- [ ] Build עובר ללא שגיאות
- [ ] האתר נבדק במובייל ובדסקטופ
