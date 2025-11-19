/**
 * STANDALONE ORDER PROCESSOR
 * ==========================
 * פונקציה עצמאית לעיבוד הזמנות ללא תלות ב-Supabase Edge Functions
 *
 * שימוש:
 * 1. התקן: npm install nodemailer pg
 * 2. הגדר משתני סביבה ב-.env
 * 3. הרץ: node standalone-order-processor.js
 *
 * או הטמע בשרת Node.js קיים (Express, Fastify וכו')
 */

const nodemailer = require('nodemailer');
const { Pool } = require('pg');

// ========================================
// 1. הגדרות חיבור (מתוך .env או הרדקוד)
// ========================================

const CONFIG = {
  // SMTP settings (דוגמה: Gmail, SendGrid, או כל SMTP אחר)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'lulu@lulu-k.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  },

  // Postgres connection
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'lulu_orders',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || ''
  },

  // Restaurant info
  restaurant: {
    name: 'לולו - המטבח הסיני',
    email: 'lulu@lulu-k.com',
    internalEmails: [
      'lulu@lulu-k.com',
      'lulu.kitchen.il@gmail.com'
    ],
    whatsapp: '972525201978'
  }
};

// ========================================
// 2. יצירת חיבורים
// ========================================

const pool = new Pool(CONFIG.database);
const transporter = nodemailer.createTransport(CONFIG.smtp);

// ========================================
// 3. פונקציות עזר
// ========================================

/**
 * שליחת מייל
 */
async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"${CONFIG.restaurant.name}" <${CONFIG.restaurant.email}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html
    });

    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return false;
  }
}

/**
 * יצירת תבנית HTML למייל
 */
function generateEmailHTML(orderData, isCustomer = true) {
  const itemsHTML = orderData.items
    .map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">₪${item.price ? (item.price * item.quantity).toFixed(2) : '-'}</td>
      </tr>
    `)
    .join('');

  const recommendationsHTML = orderData.recommendations && orderData.recommendations.length > 0
    ? `
      <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <h3 style="color: #c41e3a; margin-top: 0;">💡 המלצות למנות נוספות</h3>
        <ul style="margin: 10px 0; padding-right: 20px;">
          ${orderData.recommendations.map(rec => `<li>${rec.name}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const fullAddress = [
    orderData.street,
    orderData.house_number,
    orderData.apartment ? `דירה ${orderData.apartment}` : '',
    orderData.floor ? `קומה ${orderData.floor}` : '',
  ].filter(Boolean).join(', ');

  if (isCustomer) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #c41e3a 0%, #8b1528 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🍜 ${CONFIG.restaurant.name}</h1>
          <p style="margin: 10px 0 0 0;">תודה על ההזמנה!</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #c41e3a;">שלום ${orderData.customer_name},</h2>
          <p>קיבלנו את הזמנתך ואנחנו מכינים אותה במיוחד בשבילך! 🎉</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #c41e3a; color: white;">
                <th style="padding: 12px;">מנה</th>
                <th style="padding: 12px;">כמות</th>
                <th style="padding: 12px;">מחיר</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr style="font-weight: bold; background: #fff3cd;">
                <td colspan="2" style="padding: 15px;">סה"כ לתשלום:</td>
                <td style="padding: 15px; color: #c41e3a;">₪${orderData.total}</td>
              </tr>
            </tbody>
          </table>
          ${orderData.delivery_time ? `<p><strong>⏰ זמן אספקה:</strong> ${orderData.delivery_time}</p>` : ''}
          ${fullAddress ? `<p><strong>📍 כתובת:</strong> ${orderData.city}, ${fullAddress}</p>` : ''}
          <p><strong>💳 תשלום:</strong> ${orderData.payment_method}</p>
          ${orderData.notes ? `<p><strong>📝 הערות:</strong> ${orderData.notes}</p>` : ''}
          ${recommendationsHTML}
          <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; text-align: center;">
            <p>💚 נתראה בקרוב! צרו קשר: <strong>052-520-1978</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    // Internal email
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: #c41e3a; color: white; padding: 20px; text-align: center;">
          <h1>🔔 הזמנה חדשה!</h1>
        </div>
        <div style="padding: 30px; border: 2px solid #c41e3a;">
          <h2>פרטי לקוח</h2>
          <ul style="list-style: none; padding: 0;">
            <li><strong>שם:</strong> ${orderData.customer_name}</li>
            <li><strong>טלפון:</strong> <a href="tel:${orderData.customer_phone}">${orderData.customer_phone}</a></li>
            <li><strong>אימייל:</strong> ${orderData.customer_email}</li>
            ${fullAddress ? `<li><strong>כתובת:</strong> ${orderData.city}, ${fullAddress}</li>` : ''}
            ${orderData.delivery_time ? `<li><strong>זמן אספקה:</strong> ${orderData.delivery_time}</li>` : ''}
            <li><strong>תשלום:</strong> ${orderData.payment_method}</li>
          </ul>
          <h3>📦 פריטים</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; border: 1px solid #ddd;">מנה</th>
                <th style="padding: 10px; border: 1px solid #ddd;">כמות</th>
                <th style="padding: 10px; border: 1px solid #ddd;">מחיר</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr style="font-weight: bold; background: #fff3cd;">
                <td colspan="2" style="padding: 15px; border: 1px solid #ddd;">סה"כ:</td>
                <td style="padding: 15px; border: 1px solid #ddd; color: #c41e3a;">₪${orderData.total}</td>
              </tr>
            </tbody>
          </table>
          ${orderData.notes ? `
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
              <strong>📝 הערות לקוח:</strong><br>
              ${orderData.notes}
            </div>
          ` : ''}
          ${recommendationsHTML}
        </div>
      </body>
      </html>
    `;
  }
}

/**
 * שמירת הזמנה במסד נתונים
 */
async function saveOrderToDB(orderData) {
  const client = await pool.connect();

  try {
    const fullAddress = [
      orderData.street,
      orderData.house_number,
      orderData.apartment ? `דירה ${orderData.apartment}` : '',
      orderData.floor ? `קומה ${orderData.floor}` : '',
    ].filter(Boolean).join(', ');

    const query = `
      INSERT INTO orders (
        customer_name, email, phone, city, street, house_number,
        apartment, floor, address, delivery_time, notes,
        payment_method, total_price, status, payment_status,
        items, recommendations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id, order_number
    `;

    const values = [
      orderData.customer_name,
      orderData.customer_email || '',
      orderData.customer_phone,
      orderData.city || '',
      orderData.street || '',
      orderData.house_number || '',
      orderData.apartment || '',
      orderData.floor || '',
      fullAddress,
      orderData.delivery_time || '',
      orderData.notes || '',
      orderData.payment_method,
      orderData.total,
      'pending',
      'pending',
      JSON.stringify(orderData.items),
      JSON.stringify(orderData.recommendations || [])
    ];

    const result = await client.query(query, values);
    console.log('✅ Order saved to DB:', result.rows[0].order_number);
    return result.rows[0];
  } catch (error) {
    console.error('❌ DB save failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * יצירת URL ל-WhatsApp
 */
function generateWhatsAppURL(orderData) {
  const message = `
🍜 הזמנה חדשה - ${orderData.customer_name}
📞 ${orderData.customer_phone}
💰 סה"כ: ₪${orderData.total}
💳 תשלום: ${orderData.payment_method}

📦 פריטים:
${orderData.items.map(item => `• ${item.name} x${item.quantity}`).join('\n')}

${orderData.notes ? `📝 הערות: ${orderData.notes}` : ''}
  `.trim();

  return `https://api.whatsapp.com/send?phone=${CONFIG.restaurant.whatsapp}&text=${encodeURIComponent(message)}`;
}

// ========================================
// 4. הפונקציה המרכזית - עיבוד הזמנה
// ========================================

async function processOrder(orderData) {
  console.log('\n🚀 Processing order for:', orderData.customer_name);

  const result = {
    success: false,
    orderId: null,
    emailSent: false,
    whatsappUrl: null,
    errors: []
  };

  try {
    // שלב 1: שמירה במסד נתונים
    try {
      const savedOrder = await saveOrderToDB(orderData);
      result.orderId = savedOrder.order_number;
      result.success = true;
    } catch (dbError) {
      result.errors.push(`Database: ${dbError.message}`);
      throw dbError;
    }

    // שלב 2: שליחת מיילים (לא חוסם)
    try {
      // מייל ללקוח
      if (orderData.customer_email) {
        const customerEmailSent = await sendEmail({
          to: orderData.customer_email,
          subject: `הזמנה מס' ${result.orderId} - ${CONFIG.restaurant.name}`,
          html: generateEmailHTML(orderData, true)
        });
        result.emailSent = customerEmailSent;
      }

      // מיילים פנימיים
      const internalEmailSent = await sendEmail({
        to: CONFIG.restaurant.internalEmails,
        subject: `🔔 הזמנה חדשה - ${orderData.customer_name}`,
        html: generateEmailHTML(orderData, false)
      });

      result.emailSent = result.emailSent || internalEmailSent;
    } catch (emailError) {
      result.errors.push(`Email: ${emailError.message}`);
      console.warn('⚠️ Email failed but order saved');
    }

    // שלב 3: יצירת WhatsApp URL (fallback)
    if (!result.emailSent) {
      result.whatsappUrl = generateWhatsAppURL(orderData);
      console.log('📱 WhatsApp fallback URL generated');
    }

    console.log('✅ Order processing completed:', result.orderId);
    return result;

  } catch (error) {
    console.error('❌ Order processing failed:', error.message);
    result.errors.push(error.message);
    return result;
  }
}

// ========================================
// 5. דוגמת שימוש
// ========================================

async function testOrder() {
  const sampleOrder = {
    customer_name: 'יוסי כהן',
    customer_email: 'yossi@example.com',
    customer_phone: '0521234567',
    city: 'ירושלים',
    street: 'יפו',
    house_number: '123',
    apartment: '5',
    floor: '2',
    delivery_time: '18:00-19:00',
    notes: 'בבקשה לצלצל כשמגיעים',
    payment_method: 'ביט',
    items: [
      { name: 'כיסון עוף', quantity: 2, price: 35 },
      { name: 'מוקפץ ירקות', quantity: 1, price: 45 }
    ],
    total: 115,
    recommendations: [
      { name: 'אורז מוקפץ' },
      { name: 'סלט אסייתי' }
    ]
  };

  const result = await processOrder(sampleOrder);
  console.log('\n📊 Result:', JSON.stringify(result, null, 2));

  if (result.whatsappUrl) {
    console.log('\n📱 WhatsApp URL:', result.whatsappUrl);
  }

  process.exit(result.success ? 0 : 1);
}

// ========================================
// 6. הפעלה
// ========================================

// אם זה נקרא ישירות (לא require)
if (require.main === module) {
  testOrder().catch(console.error);
}

// ייצוא לשימוש חיצוני
module.exports = {
  processOrder,
  sendEmail,
  generateEmailHTML,
  saveOrderToDB,
  generateWhatsAppURL
};
