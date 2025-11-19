import { useLanguage } from '../hooks/useLanguage';

export default function Terms() {
  const { language } = useLanguage();
  const isHebrew = language === 'he';

  if (isHebrew) {
    return (
      <main className="container mx-auto py-12 px-4 max-w-4xl text-right">
        <h1 className="text-4xl font-bold mb-8 text-chinese-red">תקנון האתר</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">1. כללי</h2>
            <p className="text-gray-700 leading-relaxed">
              אתר "לולו - המטבח הסיני" (להלן: "האתר") נועד לשימוש לקוחות המעוניינים
              להזמין מנות ממטבח סיני אסייתי איכותי. השימוש באתר מהווה הסכמה מלאה
              ובלתי מסויגת לתנאים המפורטים להלן.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">2. ביצוע הזמנות</h2>
            <ul className="list-disc pr-6 space-y-2 text-gray-700">
              <li>הזמנה באתר מחייבת אישור סופי באמצעות טלפון או WhatsApp במספר: 052-520-1978</li>
              <li>עדיף להזמין יום מראש כדי להבטיח זמינות וטריות המנות</li>
              <li>ההזמנה תיחשב כמאושרת רק לאחר קבלת אישור מפורש מנציג העסק</li>
              <li>האתר שומר לעצמו את הזכות לסרב להזמנה או לבטלה מכל סיבה שהיא</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">3. תשלום</h2>
            <ul className="list-disc pr-6 space-y-2 text-gray-700">
              <li>התשלום ניתן לבצע באמצעות ביט (Bit) או פייבוקס (Paybox) בלבד</li>
              <li>כל המחירים באתר כוללים מע"מ כחוק (17%)</li>
              <li>דמי משלוח נקבעים לפי אזור המשלוח ויודעו ללקוח בעת אישור ההזמנה</li>
              <li>התשלום יבוצע לאחר אישור ההזמנה ולפני המשלוח</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">4. משלוחים</h2>
            <ul className="list-disc pr-6 space-y-2 text-gray-700">
              <li>המשלוחים מתבצעים לאזור ירושלים והסביבה בלבד</li>
              <li>זמני המשלוח יתואמו עם הלקוח בעת אישור ההזמנה</li>
              <li>האתר אינו אחראי לעיכובים הנובעים מנסיבות שאינן בשליטתו</li>
              <li>במקרה של בעיה במשלוח, יש ליצור קשר מיידי בטלפון 052-520-1978</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">5. ביטולים והחזרות</h2>
            <ul className="list-disc pr-6 space-y-2 text-gray-700">
              <li>ניתן לבטל הזמנה עד 4 שעות לפני המועד המתוכנן להכנה</li>
              <li>ביטול לאחר מכן עלול לגרור חיוב חלקי עקב תחילת הכנת המזון</li>
              <li>במקרה של בעיה באיכות המזון, יש ליצור קשר מיידי לקבלת פתרון</li>
              <li>החזר כספי יינתן במקרים מוצדקים בלבד ולפי שיקול דעת העסק</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">6. שעות פעילות</h2>
            <p className="text-gray-700 leading-relaxed">
              השירות ניתן בהתאם לשעות הפעילות המפורסמות באתר ובעמוד "צור קשר".
              שעות הפעילות עשויות להשתנות בחגים ובמועדים מיוחדים.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">7. פרטיות ואבטחת מידע</h2>
            <ul className="list-disc pr-6 space-y-2 text-gray-700">
              <li>המידע האישי שנמסר על ידי הלקוחים נשמר במאגרי מידע מאובטחים</li>
              <li>המידע משמש לצורכי ביצוע ההזמנות ושיפור השירות בלבד</li>
              <li>לא נעביר מידע לצדדים שלישיים ללא הסכמה מפורשת</li>
              <li>הלקוחות זכאים לעיין במידע האישי שלהם ולבקש לתקנו או למחקו</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">8. קניין רוחני</h2>
            <p className="text-gray-700 leading-relaxed">
              כל התכנים באתר, לרבות טקסטים, תמונות, עיצובים וסימני מסחר, הם רכושו
              הבלעדי של "לולו - המטבח הסיני" ומוגנים בזכויות יוצרים. אין להעתיק,
              לשכפל או להפיץ תכנים אלו ללא אישור בכתב.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">9. שינויים בתקנון</h2>
            <p className="text-gray-700 leading-relaxed">
              האתר שומר לעצמו את הזכות לשנות תקנון זה מעת לעת. שינויים יפורסמו
              באתר ויכנסו לתוקף מיד עם פרסומם. המשך השימוש באתר לאחר הפרסום
              מהווה הסכמה לשינויים.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-chinese-black">10. יצירת קשר</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              לכל שאלה, בקשה או תלונה, אנא פנו אלינו:
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
          </section>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500">
              תקנון זה עודכן לאחרונה בתאריך: נובמבר 2025
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-4xl text-left">
      <h1 className="text-4xl font-bold mb-8 text-chinese-red">Website Terms of Use</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">1. General</h2>
          <p className="text-gray-700 leading-relaxed">
            The "Lulu - The Chinese Kitchen" website (hereinafter: "the Site") is intended
            for customers wishing to order authentic Asian dishes. Using this website
            constitutes full and unconditional acceptance of the terms detailed below.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">2. Placing Orders</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Orders placed on the site require final confirmation via phone or WhatsApp at: +972-52-520-1978</li>
            <li>It's preferable to order a day in advance to ensure availability and freshness</li>
            <li>An order is considered confirmed only after receiving explicit approval from a business representative</li>
            <li>The site reserves the right to refuse or cancel any order for any reason</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">3. Payment</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Payment can be made via Bit or PayBox only</li>
            <li>All prices on the site include VAT as required by law (17%)</li>
            <li>Delivery fees are determined by delivery area and will be communicated when confirming the order</li>
            <li>Payment is processed after order confirmation and before delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">4. Delivery</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Deliveries are made to Jerusalem and surrounding areas only</li>
            <li>Delivery times will be coordinated with the customer when confirming the order</li>
            <li>The site is not responsible for delays caused by circumstances beyond its control</li>
            <li>In case of delivery issues, please contact us immediately at +972-52-520-1978</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">5. Cancellations and Returns</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Orders can be cancelled up to 4 hours before the scheduled preparation time</li>
            <li>Cancellation after this time may result in partial charges due to food preparation having started</li>
            <li>In case of food quality issues, please contact us immediately for a solution</li>
            <li>Refunds are provided in justified cases only at the business's discretion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">6. Business Hours</h2>
          <p className="text-gray-700 leading-relaxed">
            Service is provided according to business hours published on the site and "Contact" page.
            Business hours may change during holidays and special occasions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">7. Privacy and Data Security</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Personal information provided by customers is stored in secure databases</li>
            <li>Information is used solely for order processing and service improvement</li>
            <li>We will not transfer information to third parties without explicit consent</li>
            <li>Customers are entitled to view their personal information and request corrections or deletion</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">8. Intellectual Property</h2>
          <p className="text-gray-700 leading-relaxed">
            All content on the site, including texts, images, designs, and trademarks, is the
            exclusive property of "Lulu - The Chinese Kitchen" and protected by copyright.
            Content may not be copied, reproduced, or distributed without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">9. Terms Changes</h2>
          <p className="text-gray-700 leading-relaxed">
            The site reserves the right to modify these terms from time to time. Changes will
            be published on the site and take effect immediately upon publication. Continued
            use of the site after publication constitutes acceptance of the changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 text-chinese-black">10. Contact</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            For any questions, requests, or complaints, please contact us:
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
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-sm text-gray-500">
            These terms were last updated: November 2025
          </p>
        </div>
      </div>
    </main>
  );
}
