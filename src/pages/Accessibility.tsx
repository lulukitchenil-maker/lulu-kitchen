import { useLanguage } from '../hooks/useLanguage';

export default function Accessibility() {
  const { language, t } = useLanguage();
  const isHebrew = language === 'he';

  if (isHebrew) {
    return (
      <main className="container mx-auto py-12 px-4 max-w-4xl text-right">
        <h1 className="text-4xl font-bold mb-8 text-chinese-red">הצהרת נגישות</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">מחויבות לנגישות</h2>
            <p className="text-gray-700 leading-relaxed">
              אתר "לולו - המטבח הסיני" נבנה בהתאם להנחיות הנגישות בתקן הישראלי (ת"י 5568)
              וברמה AA לפי תקן WCAG 2.1 של ארגון W3C. האתר מותאם לגולשים עם מוגבלויות
              ומאפשר שימוש בעזרת מקלדת, שינוי גודל טקסט, ניגודיות ועוד.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">תכונות נגישות באתר</h2>
            <ul className="list-disc pr-6 space-y-2 text-gray-700">
              <li>ניווט באמצעות מקלדת - כל תכני האתר נגישים באמצעות מקלדת בלבד</li>
              <li>תמיכה בקוראי מסך - האתר תומך בתוכנות קוראי מסך מובילות</li>
              <li>ניגודיות צבעים - עומדת בדרישות תקן WCAG 2.1 ברמה AA</li>
              <li>גופנים ברורים וקריאים - טקסט ברור וניתן להגדלה</li>
              <li>תמיכה דו-לשונית - האתר זמין בעברית ובאנגלית</li>
              <li>כותרות מובנות - היררכיה ברורה של כותרות לניווט קל</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">תאימות דפדפנים</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              האתר נבדק ונמצא תואם לדפדפנים הבאים:
            </p>
            <ul className="list-disc pr-6 space-y-1 text-gray-700">
              <li>Google Chrome (גרסה עדכנית)</li>
              <li>Mozilla Firefox (גרסה עדכנית)</li>
              <li>Microsoft Edge (גרסה עדכנית)</li>
              <li>Safari (גרסה עדכנית)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">פנייה בנושא נגישות</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              אם מצאתם בעיה או יש לכם הצעה לשיפור נגישות – נשמח לקבל את פנייתכם:
            </p>
            <div className="bg-chinese-lightGold p-6 rounded-lg space-y-2">
              <p className="text-gray-800">
                <strong className="text-chinese-red">אימייל:</strong> lulu@lulu-k.com
              </p>
              <p className="text-gray-800">
                <strong className="text-chinese-red">טלפון:</strong> 052-520-1978
              </p>
              <p className="text-gray-800">
                <strong className="text-chinese-red">WhatsApp:</strong> 052-520-1978
              </p>
            </div>
            <p className="text-gray-600 mt-4 text-sm">
              אנו מתחייבים לטפל בכל פניה תוך 7 ימי עבודה ולעשות את מירב המאמצים
              לתקן ולשפר את נגישות האתר באופן שוטף.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">רכז נגישות</h2>
            <p className="text-gray-700 leading-relaxed">
              רכז הנגישות באתר: לולו<br />
              אימייל: lulu@lulu-k.com<br />
              טלפון: 052-520-1978
            </p>
          </section>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500">
              הצהרת נגישות זו עודכנה לאחרונה בתאריך: נובמבר 2025
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-4xl text-left">
      <h1 className="text-4xl font-bold mb-8 text-chinese-red">Accessibility Statement</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">Commitment to Accessibility</h2>
          <p className="text-gray-700 leading-relaxed">
            "Lulu - The Chinese Kitchen" website complies with Israeli Standard 5568
            and WCAG 2.1 Level AA accessibility guidelines. The site is designed to
            be accessible to all users, including those with disabilities, and supports
            keyboard navigation, contrast adjustments, and text resizing.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">Accessibility Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Keyboard navigation - All site content accessible via keyboard only</li>
            <li>Screen reader support - Compatible with leading screen reader software</li>
            <li>Color contrast - Meets WCAG 2.1 Level AA requirements</li>
            <li>Clear, readable fonts - Text is clear and resizable</li>
            <li>Bilingual support - Site available in Hebrew and English</li>
            <li>Structured headings - Clear heading hierarchy for easy navigation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">Browser Compatibility</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The site has been tested and is compatible with the following browsers:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>Google Chrome (current version)</li>
            <li>Mozilla Firefox (current version)</li>
            <li>Microsoft Edge (current version)</li>
            <li>Safari (current version)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">Accessibility Feedback</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you encounter any accessibility issue or have suggestions for improvement,
            please contact us:
          </p>
          <div className="bg-chinese-lightGold p-6 rounded-lg space-y-2">
            <p className="text-gray-800">
              <strong className="text-chinese-red">Email:</strong> lulu@lulu-k.com
            </p>
            <p className="text-gray-800">
              <strong className="text-chinese-red">Phone:</strong> +972-52-520-1978
            </p>
            <p className="text-gray-800">
              <strong className="text-chinese-red">WhatsApp:</strong> +972-52-520-1978
            </p>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            We commit to addressing all inquiries within 7 business days and making
            every effort to continuously improve the site's accessibility.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">Accessibility Coordinator</h2>
          <p className="text-gray-700 leading-relaxed">
            Site Accessibility Coordinator: Lulu<br />
            Email: lulu@lulu-k.com<br />
            Phone: +972-52-520-1978
          </p>
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-500">
            This accessibility statement was last updated: November 2025
          </p>
        </div>
      </div>
    </main>
  );
}
