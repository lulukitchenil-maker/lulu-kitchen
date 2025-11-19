# Google Apps Script - הוראות פריסה מעודכנות

## ⚠️ חשוב מאוד - יש לבצע את השלבים האלה כדי שהמיילים יגיעו!

### שלב 1: העתק את הקוד
1. פתח את הקובץ `google-apps-script.js`
2. העתק את **כל** הקוד

### שלב 2: פתח את Google Apps Script Editor
1. גש ל-[Google Apps Script](https://script.google.com)
2. לחץ על "פרויקט חדש" (New Project)
3. מחק את כל הקוד הקיים
4. הדבק את הקוד מהקובץ `google-apps-script.js`

### שלב 3: שמור את הפרויקט
1. לחץ על "שמור" או Ctrl+S
2. תן שם לפרויקט: "Lulu-K Orders Handler"

### שלב 4: פרוס כ-Web App (קריטי!)
1. לחץ על **Deploy** (פריסה) בפינה הימנית העליונה
2. בחר **New deployment** (פריסה חדשה)
3. לחץ על גלגל השיניים ליד "Select type"
4. בחר **Web app**

### שלב 5: הגדר את ההרשאות
**זה השלב החשוב ביותר!**

```
Description: Lulu-K Order Handler
Execute as: Me (YOUR_EMAIL@gmail.com)
Who has access: Anyone  ⬅️ חובה! חייב להיות "Anyone"
```

### שלב 6: לחץ Deploy
1. לחץ על "Deploy"
2. Google תבקש ממך אישורים - תן את כל האישורים
3. אם מופיעה אזהרה "This app isn't verified":
   - לחץ על "Advanced"
   - לחץ על "Go to [Project Name] (unsafe)"
   - לחץ "Allow"

### שלב 7: העתק את ה-URL החדש
1. אחרי הפריסה תקבל URL שנראה כך:
   ```
   https://script.google.com/macros/s/[LONG_ID]/exec
   ```
2. העתק את כל ה-URL

### שלב 8: עדכן את ה-.env
1. פתח את הקובץ `.env` בפרויקט
2. עדכן את השורה:
   ```
   VITE_FORM_ENDPOINT=https://script.google.com/macros/s/[THE_NEW_URL]/exec
   ```
3. שמור את הקובץ
4. הפעל מחדש את השרת (`npm run dev`)

## בדיקה שהכל עובד

### בדיקה ידנית:
פתח את הטרמינל והרץ:
```bash
curl -X GET "YOUR_SCRIPT_URL_HERE/exec"
```

אמור להחזיר:
```json
{"status":"API is running"}
```

### בדיקת POST:
```bash
curl -X POST "YOUR_SCRIPT_URL_HERE/exec" \
  -H "Content-Type: application/json" \
  -d '{"type":"test","message":"hello"}'
```

## אם עדיין לא עובד

### בעיות נפוצות:

1. **"Access denied" או 401/403**
   - וודא ש-"Who has access" מוגדר ל-**Anyone**
   - פרוס מחדש את הסקריפט

2. **CORS Errors**
   - וודא שהפונקציה `doOptions` קיימת בקוד
   - וודא שכל הפונקציות מחזירות את ה-CORS headers

3. **"Script not found"**
   - ה-URL לא נכון או הסקריפט לא פרוס
   - פרוס מחדש וקבל URL חדש

4. **לא מקבל מיילים**
   - בדוק ב-Google Sheets שהנתונים נשמרים
   - בדוק את ה-Spam/Junk Mail
   - ודא שהאימייל `lulu.kitchen.il@gmail.com` נכון

## צור קשר
אם אחרי ביצוע כל השלבים עדיין יש בעיה, צלם צילום מסך של:
1. הגדרות הפריסה (Deploy settings)
2. השגיאה שמופיעה בקונסול (F12 → Console)
