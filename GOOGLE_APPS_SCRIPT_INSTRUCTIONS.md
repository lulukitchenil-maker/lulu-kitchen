# הוראות התקנת Google Apps Script

## שלב 1: העתקת הקוד
1. פתח את הקובץ `google-apps-script.js` בפרויקט
2. העתק את כל התוכן של הקובץ

## שלב 2: עריכת Google Apps Script
1. פתח את Google Sheets בכתובת:
   https://docs.google.com/spreadsheets/d/1EoqYXiIDOgkYJ0-WMiz7mJRYFnyHYwPnA0IcvtwGzBA/edit

2. לחץ על **Extensions** > **Apps Script**

3. מחק את כל הקוד הקיים (אם יש)

4. הדבק את הקוד שהעתקת מהקובץ `google-apps-script.js`

5. שמור את הקובץ (Ctrl+S או Cmd+S)

## שלב 3: Deploy כ-Web App

1. בתפריט העליון, לחץ על **Deploy** > **New deployment**

2. לחץ על האייקון של ההגדרות (⚙️) ליד "Select type"

3. בחר **Web app**

4. הגדר את השדות הבאים:
   - **Description**: "Lulu-K Forms Handler" (או כל תיאור אחר)
   - **Execute as**: Me (your-email@gmail.com)
   - **Who has access**: Anyone (חשוב מאוד!)

5. לחץ על **Deploy**

6. אישור הרשאות:
   - לחץ על **Authorize access**
   - בחר את חשבון ה-Google שלך
   - לחץ על **Advanced**
   - לחץ על **Go to [Project Name] (unsafe)**
   - לחץ על **Allow**

7. העתק את ה-**Web app URL** שמתקבל

## שלב 4: עדכון .env

1. פתח את הקובץ `.env` בפרויקט

2. החלף את הערך של `VITE_FORM_ENDPOINT` ב-URL החדש שקיבלת

```
VITE_FORM_ENDPOINT=https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec
```

## שלב 5: בדיקה

1. הרץ את האתר (`npm run dev`)

2. נסה למלא טופס הזמנה/צור קשר/המלצה

3. בדוק:
   - האם הטופס נשלח בהצלחה
   - האם הנתונים נשמרים ב-Google Sheets
   - האם קיבלת מייל עם פרטי ההזמנה/הודעה

## בעיות נפוצות

### הטופס נשלח אבל לא מגיע מייל
- בדוק שהאימייל `lulu.kitchen.il@gmail.com` נכון
- בדוק את תיקיית ה-Spam
- ודא שהרשאת את ה-Script לשלוח מיילים

### שגיאת CORS
- ודא ש-"Who has access" מוגדר ל-**Anyone**
- נסה לעשות Deploy מחדש

### הנתונים לא נשמרים ב-Google Sheets
- בדוק שה-SHEET_ID בקוד תואם ל-ID של ה-Spreadsheet שלך
- ודא שהרשאת את ה-Script לגשת ל-Google Sheets

## תחזוקה

כדי לעדכן את ה-Script בעתיד:
1. ערוך את הקוד ב-Apps Script Editor
2. לחץ על **Deploy** > **Manage deployments**
3. לחץ על האייקון של העריכה (✏️)
4. עדכן את ה-**Version** ל-"New version"
5. לחץ על **Deploy**

---

**חשוב:** שמור את ה-Deployment URL במקום בטוח. אתה תצטרך אותו אם תרצה לשנות את ה-endpoint בעתיד.
