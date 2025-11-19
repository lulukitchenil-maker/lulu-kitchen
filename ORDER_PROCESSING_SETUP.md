# 🍜 מערכת עיבוד הזמנות - Lulu Kitchen

## סקירה כללית

המערכת כוללת Edge Function מלאה לעיבוד הזמנות עם:
- ✅ שמירה אוטומטית במסד נתונים Supabase
- ✅ שליחת מיילים ללקוח + 2 מיילים פנימיים
- ✅ WhatsApp fallback אוטומטי
- ✅ תבניות HTML מעוצבות
- ✅ תמיכה בהמלצות למנות נוספות

---

## 🚀 התקנה והפעלה

### שלב 1: הגדרת Resend לשליחת מיילים

**Resend** הוא שירות חינמי לשליחת מיילים (100 מיילים ביום בחינם).

1. **הירשם ל-Resend:**
   - היכנס ל-[resend.com](https://resend.com)
   - צור חשבון חינמי
   - אמת את כתובת המייל שלך

2. **קבל API Key:**
   - לחץ על "API Keys" בתפריט
   - לחץ על "Create API Key"
   - תן לו שם: `lulu-orders`
   - העתק את המפתח (מתחיל ב-`re_...`)

3. **הגדר את הדומיין (אופציונלי):**
   - אם יש לך דומיין `lulu-k.com`, הוסף אותו ב-Resend
   - אמת את הדומיין דרך DNS records
   - אחרת - תשתמש בדומיין ברירת המחדל של Resend

### שלב 2: הגדרת Supabase Secrets

הכנס ל-Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# API Key של Resend
RESEND_API_KEY=re_your_actual_key_here
```

**הערה:** אם אין לך Resend, המערכת תעבוד רק עם WhatsApp fallback.

---

## 📋 מבנה הנתונים

### טבלת Orders

הטבלה כוללת את השדות הבאים:

```sql
- id (uuid)
- customer_name (text)
- email (text)
- phone (text)
- city (text)
- street (text)
- house_number (text)
- apartment (text)        -- חדש!
- floor (text)            -- חדש!
- address (text)
- delivery_time (text)
- notes (text)
- payment_method (text)
- total_price (numeric)
- status (text)
- payment_status (text)
- items (jsonb)           -- חדש!
- recommendations (jsonb) -- חדש!
- created_at (timestamp)
- order_number (text)
```

#### דוגמת items:
```json
[
  {
    "name": "כיסון עוף",
    "quantity": 2,
    "price": 35
  },
  {
    "name": "מוקפץ בקר",
    "quantity": 1,
    "price": 60
  }
]
```

#### דוגמת recommendations:
```json
[
  { "name": "אורז מוקפץ" },
  { "name": "סלט ירקות" }
]
```

---

## 🔄 זרימת העבודה

### כאשר לקוח מבצע הזמנה:

1. **Frontend** שולח את ההזמנה ל-Edge Function:
   ```
   POST /functions/v1/process-order
   ```

2. **Edge Function** מבצעת:
   - ✅ שומרת הזמנה ב-Supabase (טבלת `orders`)
   - ✅ שולחת מייל אישור ללקוח
   - ✅ שולחת 2 מיילים פנימיים:
     - `lulu@lulu-k.com`
     - `lulu.kitchen.il@gmail.com`
   - ✅ אם המיילים נכשלו - מחזירה קישור WhatsApp

3. **Frontend** מקבלת תשובה:
   ```json
   {
     "success": true,
     "orderId": "ORD-20251024-001",
     "emailSent": true,
     "whatsappUrl": "https://wa.me/..." // רק אם המייל נכשל
   }
   ```

4. **Fallback אוטומטי:**
   - אם ה-Edge Function נכשלת → Frontend שומרת ישירות ב-Supabase
   - פותחת WhatsApp אוטומטית עם פרטי ההזמנה

---

## 📧 תבניות המיילים

### מייל ללקוח:
- כותרת מותאמת אישית
- טבלת פריטים מסודרת
- פרטי משלוח ותשלום
- המלצות למנות נוספות (אם קיימות)
- מידע ליצירת קשר

### מיילים פנימיים:
- פרטי לקוח מלאים (שם, טלפון, כתובת)
- טבלת פריטים
- הערות לקוח
- המלצות שהוצעו ללקוח

---

## 🛠️ בדיקה ופתרון בעיות

### בדיקת ה-Edge Function:

```bash
# בדיקה באמצעות curl
curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/process-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "customer_name": "בדיקה",
    "customer_email": "test@example.com",
    "customer_phone": "0501234567",
    "items": [
      {
        "name": "כיסון עוף",
        "quantity": 2,
        "price": 35
      }
    ],
    "total": 70,
    "payment_method": "מזומן"
  }'
```

### בדיקת לוגים:

1. היכנס ל-Supabase Dashboard
2. Edge Functions → process-order
3. Logs → צפה בלוגים בזמן אמת

### בעיות נפוצות:

#### ❌ "RESEND_API_KEY not configured"
**פתרון:** הוסף את ה-API Key ב-Supabase Secrets

#### ❌ "Database error: column 'items' does not exist"
**פתרון:** הרץ את המיגרציה:
```bash
npm run supabase migration up
```

#### ❌ מיילים לא מגיעים
**בדיקה:**
1. ודא ש-Resend API Key תקין
2. בדוק את הלוגים ב-Supabase
3. ודא שכתובת המייל תקינה
4. בדוק spam/junk folder

---

## 🔐 אבטחה

- ✅ Edge Function מאובטחת עם CORS
- ✅ שימוש ב-Service Role Key רק בצד השרת
- ✅ RLS פעיל על טבלת orders
- ✅ Validation של שדות חובה
- ✅ Error handling מלא

---

## 📝 דוגמת קוד - שליחת הזמנה

```typescript
// Frontend code
const orderPayload = {
  customer_name: "יוסי כהן",
  customer_email: "yossi@example.com",
  customer_phone: "0521234567",
  city: "ירושלים",
  street: "יפו",
  house_number: "123",
  apartment: "5",
  floor: "2",
  delivery_time: "18:00-19:00",
  notes: "בבקשה לצלצל כשמגיעים",
  payment_method: "ביט",
  items: [
    { name: "כיסון עוף", quantity: 2, price: 35 },
    { name: "מוקפץ ירקות", quantity: 1, price: 45 }
  ],
  total: 115,
  recommendations: [
    { name: "אורז מוקפץ" },
    { name: "סלט אסייתי" }
  ]
};

const response = await fetch(
  `${SUPABASE_URL}/functions/v1/process-order`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(orderPayload),
  }
);

const result = await response.json();

if (result.success) {
  console.log('Order saved:', result.orderId);
  if (!result.emailSent && result.whatsappUrl) {
    window.open(result.whatsappUrl, '_blank');
  }
}
```

---

## 🎯 סטטוס הפיצ'רים

| פיצ'ר | סטטוס | הערות |
|-------|-------|-------|
| שמירה ב-DB | ✅ | פועל מלא |
| שליחת מייל ללקוח | ✅ | דרוש Resend API |
| מיילים פנימיים | ✅ | 2 כתובות |
| WhatsApp fallback | ✅ | אוטומטי |
| תבניות HTML | ✅ | מעוצבות |
| המלצות | ✅ | כולל במייל |
| Fallback ישיר | ✅ | אם Edge Function נכשל |

---

## 📞 תמיכה

אם יש בעיה:
1. בדוק את הלוגים ב-Supabase
2. ודא שכל ה-Secrets מוגדרים
3. בדוק שהמיגרציות רצו
4. נסה את הבדיקה עם curl

**מוכן לשימוש!** 🚀
