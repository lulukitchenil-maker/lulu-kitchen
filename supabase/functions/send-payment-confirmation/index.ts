import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function sendEmail(to: string, subject: string, html: string) {
  const SMTP_HOST = Deno.env.get("SMTP_HOST");
  const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || "465");
  const SMTP_USER = Deno.env.get("SMTP_USER");
  const SMTP_PASS = Deno.env.get("SMTP_PASS");

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP not configured, skipping email");
    return;
  }

  const client = new SmtpClient();
  await client.connect({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    username: SMTP_USER,
    password: SMTP_PASS,
    tls: SMTP_PORT === 465,
  });

  await client.send({
    from: SMTP_USER,
    to: to,
    subject: subject,
    content: html,
    html: true,
  });

  await client.close();
}

function generateCustomerEmailHTML(order: any): string {
  const itemsHTML = order.items
    .map((item: any) => {
      const addOnsHTML = item.addOns && item.addOns.length > 0
        ? `<br><small style="color:#666">תוספות: ${item.addOns.map((a: any) => `${a.name} (+₪${a.price})`).join(', ')}</small>`
        : '';
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}${addOnsHTML}</td>
          <td style="padding:8px;text-align:center;border-bottom:1px solid #eee">${item.quantity}</td>
          <td style="padding:8px;text-align:left;border-bottom:1px solid #eee">₪${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
    })
    .join("");

  const fullAddress = [
    order.street,
    order.house_number,
    order.apartment ? `דירה ${order.apartment}` : "",
    order.floor ? `קומה ${order.floor}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const deliveryDateTime = [
    order.delivery_date ? `📅 ${order.delivery_date}` : "",
    order.delivery_time ? `🕐 ${order.delivery_time}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
  <html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #c41e3a 0%, #8b1428 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
      .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .total { font-size: 20px; font-weight: bold; color: #c41e3a; margin-top: 20px; }
      .info-box { background: #f8f9fa; padding: 15px; border-right: 4px solid #c41e3a; margin: 15px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🍜 לולו המטבח הסיני</h1>
        <h2>תודה על ההזמנה!</h2>
      </div>
      <div class="content">
        <p style="font-size: 18px;"><strong>שלום ${order.customer_name},</strong></p>
        <p>תשלומך התקבל בהצלחה${order.payment_method === 'bit' ? ' דרך Bit' : order.payment_method === 'grow' ? ' דרך מערכת התשלום המאובטחת' : ''}! ההזמנה שלך בדרך אליך.</p>

        ${deliveryDateTime ? `
        <div class="info-box">
          <strong>⏰ זמן משלוח משוער:</strong><br>
          ${deliveryDateTime}
        </div>
        ` : ""}

        ${fullAddress ? `
        <div class="info-box">
          <strong>📍 כתובת למשלוח:</strong><br>
          ${order.city || ""}, ${fullAddress}
        </div>
        ` : ""}

        <h3>📦 פריטים שהוזמנו:</h3>
        <table style="border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #c41e3a;">פריט</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #c41e3a;">כמות</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #c41e3a;">מחיר</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="total">סה"כ: ₪${order.total_price.toFixed(2)}</div>

        ${order.notes ? `
        <div class="info-box">
          <strong>📝 הערות:</strong><br>
          ${order.notes}
        </div>
        ` : ""}

        <p style="margin-top: 30px;">אם יש לך שאלות, אנחנו כאן בשבילך!</p>
        <p><strong>טלפון:</strong> 052-520-1978</p>
      </div>
      <div class="footer">
        <p style="color: #666; font-size: 14px;">
          תודה שבחרת בלולו המטבח הסיני<br>
          בתאבון! 🥢
        </p>
      </div>
    </div>
  </body>
  </html>`;
}

function generateAdminEmailHTML(order: any): string {
  const itemsHTML = order.items
    .map((item: any) => {
      const addOnsHTML = item.addOns && item.addOns.length > 0
        ? `<br><small style="color:#666">תוספות: ${item.addOns.map((a: any) => `${a.name} (+₪${a.price})`).join(', ')}</small>`
        : '';
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}${addOnsHTML}</td>
          <td style="padding:8px;text-align:center;border-bottom:1px solid #eee">${item.quantity}</td>
          <td style="padding:8px;text-align:left;border-bottom:1px solid #eee">₪${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
    })
    .join("");

  const fullAddress = [
    order.street,
    order.house_number,
    order.apartment ? `דירה ${order.apartment}` : "",
    order.floor ? `קומה ${order.floor}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const deliveryDateTime = [
    order.delivery_date ? `📅 ${order.delivery_date}` : "",
    order.delivery_time ? `🕐 ${order.delivery_time}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
  <html dir="rtl" lang="he">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 700px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .total { font-size: 22px; font-weight: bold; color: #28a745; margin-top: 20px; }
      .info-box { background: #f8f9fa; padding: 15px; border-right: 4px solid #28a745; margin: 15px 0; }
      .alert { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>💰 התקבל תשלום חדש!</h1>
        <h2>הזמנה #${order.id}</h2>
      </div>
      <div class="content">
        <div class="alert">
          <strong>✅ התשלום אושר${order.payment_method === 'bit' ? ' ע"י Bit' : order.payment_method === 'grow' ? ' ע"י Grow' : ''}</strong><br>
          ${order.transaction_id ? `קוד עסקה: ${order.transaction_id}` : ''}
          ${order.payment_method ? `<br>אמצעי תשלום: ${order.payment_method === 'bit' ? 'Bit' : order.payment_method === 'grow' ? 'Grow Payment' : order.payment_method === 'cash' ? 'מזומן' : order.payment_method}` : ''}
        </div>

        <div class="info-box">
          <strong>👤 פרטי הלקוח:</strong><br>
          <strong>שם:</strong> ${order.customer_name}<br>
          <strong>טלפון:</strong> ${order.phone}<br>
          ${order.email ? `<strong>אימייל:</strong> ${order.email}<br>` : ""}
        </div>

        ${deliveryDateTime ? `
        <div class="info-box">
          <strong>⏰ זמן משלוח:</strong><br>
          ${deliveryDateTime}
        </div>
        ` : ""}

        ${fullAddress ? `
        <div class="info-box">
          <strong>📍 כתובת למשלוח:</strong><br>
          ${order.city || ""}, ${fullAddress}
        </div>
        ` : ""}

        <h3>📦 פריטים שהוזמנו:</h3>
        <table style="border: 1px solid #ddd;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #28a745;">פריט</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #28a745;">כמות</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #28a745;">מחיר</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="total">סה"כ: ₪${order.total_price.toFixed(2)}</div>

        ${order.notes ? `
        <div class="info-box" style="border-right-color: #ffc107;">
          <strong>📝 הערות מהלקוח:</strong><br>
          ${order.notes}
        </div>
        ` : ""}

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          הודעה זו נשלחה אוטומטית מהמערכת.
        </p>
      </div>
    </div>
  </body>
  </html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError || !order) {
      console.error("Order not found:", orderId);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OWNER_EMAIL_1 = Deno.env.get("OWNER_EMAIL_1") || "lulu@lulu-k.com";
    const OWNER_EMAIL_2 = Deno.env.get("OWNER_EMAIL_2") || "lulu.kitchen.il@gmail.com";

    await sendEmail(
      OWNER_EMAIL_1,
      `💰 התקבל תשלום חדש! הזמנה #${order.id}`,
      generateAdminEmailHTML(order)
    );

    await sendEmail(
      OWNER_EMAIL_2,
      `💰 התקבל תשלום חדש! הזמנה #${order.id}`,
      generateAdminEmailHTML(order)
    );

    if (order.email) {
      await sendEmail(
        order.email,
        "הזמנתך התקבלה – לולו המטבח הסיני",
        generateCustomerEmailHTML(order)
      );
    }

    console.log(`Confirmation emails sent for order ${orderId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Emails sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send emails", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
