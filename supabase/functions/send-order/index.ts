import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * 🌟 Supabase Edge Function: send-order
 * שולח את ההזמנה החדשה למייל ולוואטסאפ, ושומר אותה ב־DB
 * גרסה מותאמת ל־BOLT / Supabase Edge Runtime
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// טיפוס ההזמנה
interface OrderRequest {
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  items: Array<{ name: string; quantity: number; price?: number; addOns?: Array<{ name: string; price: number }> }>;
  total: number;
  payment_method: string;
  city?: string;
  street?: string;
  house_number?: string;
  apartment?: string;
  floor?: string;
  delivery_date?: string;
  delivery_time?: string;
  notes?: string;
  recommendations?: Array<{ name: string }>;
}

// טיפוס לשליחת מייל
interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "לולו המטבח הסיני <orders@lulu-k.com>",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      console.error("❌ Email send failed:", await response.text());
      return false;
    }

    console.log("📧 Email sent:", payload.to);
    return true;
  } catch (err) {
    console.error("Email error:", err);
    return false;
  }
}

function sendWhatsAppFallback(orderData: OrderRequest): string {
  const deliveryDateTime = [
    orderData.delivery_date ? `📅 ${orderData.delivery_date}` : "",
    orderData.delivery_time ? `🕐 ${orderData.delivery_time}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const itemsWithAddOns = orderData.items.map((i) => {
    let itemText = `• ${i.name} x${i.quantity}`;
    if (i.addOns && i.addOns.length > 0) {
      itemText += `\n  תוספות: ${i.addOns.map(a => `${a.name} (+₪${a.price})`).join(', ')}`;
    }
    return itemText;
  }).join("\n");

  const message = `
🍜 הזמנה חדשה - ${orderData.customer_name}
📞 ${orderData.customer_phone}
${deliveryDateTime ? `⏰ ${deliveryDateTime}` : ""}
💰 סה"כ: ₪${orderData.total}
💳 תשלום: ${orderData.payment_method}

📦 פריטים:
${itemsWithAddOns}

${orderData.notes ? `📝 הערות: ${orderData.notes}` : ""}
`.trim();

  return `https://api.whatsapp.com/send?phone=972525201978&text=${encodeURIComponent(message)}`;
}

// תבנית HTML למייל
function generateEmailHTML(orderData: OrderRequest, isCustomer: boolean): string {
  const itemsHTML = orderData.items
    .map(
      (item) => {
        const addOnsHTML = item.addOns && item.addOns.length > 0
          ? `<br><small style="color:#666">תוספות: ${item.addOns.map(a => `${a.name} (+₪${a.price})`).join(', ')}</small>`
          : '';
        return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.name}${addOnsHTML}</td>
          <td style="padding:8px;text-align:center">${item.quantity}</td>
          <td style="padding:8px;text-align:left">${item.price ? `₪${item.price * item.quantity}` : "-"}</td>
        </tr>`;
      }
    )
    .join("");

  const fullAddress = [
    orderData.street,
    orderData.house_number,
    orderData.apartment ? `דירה ${orderData.apartment}` : "",
    orderData.floor ? `קומה ${orderData.floor}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const deliveryDateTime = [
    orderData.delivery_date ? `📅 ${orderData.delivery_date}` : "",
    orderData.delivery_time ? `🕐 ${orderData.delivery_time}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isCustomer) {
    return `
    <html dir="rtl" lang="he"><body style="font-family:Arial,sans-serif">
      <h2>תודה על ההזמנה, ${orderData.customer_name}!</h2>
      <p>קיבלנו את ההזמנה שלך.</p>
      ${deliveryDateTime ? `<p><b>זמן משלוח:</b> ${deliveryDateTime}</p>` : ""}
      <table style="width:100%;border-collapse:collapse">${itemsHTML}</table>
      <p style="font-size:18px;font-weight:bold">סה"כ: ₪${orderData.total}</p>
      <p>💳 ${orderData.payment_method}</p>
      ${fullAddress ? `<p>📍 ${orderData.city || ""}, ${fullAddress}</p>` : ""}
    </body></html>`;
  }

  return `
  <html dir="rtl" lang="he"><body style="font-family:Arial,sans-serif">
    <h2>🔔 הזמנה חדשה מאת ${orderData.customer_name}</h2>
    <p><b>טלפון:</b> ${orderData.customer_phone}</p>
    ${orderData.customer_email ? `<p><b>אימייל:</b> ${orderData.customer_email}</p>` : ""}
    ${deliveryDateTime ? `<p><b>זמן משלוח:</b> ${deliveryDateTime}</p>` : ""}
    ${fullAddress ? `<p><b>כתובת:</b> ${orderData.city || ""}, ${fullAddress}</p>` : ""}
    <p><b>תשלום:</b> 💳 ${orderData.payment_method}</p>
    <h3>פריטים שהוזמנו:</h3>
    <table style="width:100%;border-collapse:collapse;border:1px solid #ddd">${itemsHTML}</table>
    <p style="font-size:20px;font-weight:bold;color:#c41e3a">סה"כ: ₪${orderData.total}</p>
    ${orderData.notes ? `<p><b>הערות:</b> ${orderData.notes}</p>` : ""}
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const orderData: OrderRequest = await req.json();
    console.log("📦 הזמנה חדשה:", orderData.customer_name);

    if (!orderData.customer_name || !orderData.customer_phone || !orderData.items?.length) {
      return new Response(JSON.stringify({ success: false, error: "Missing fields" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials missing");
    }

    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        customer_name: orderData.customer_name,
        email: orderData.customer_email || "",
        phone: orderData.customer_phone,
        city: orderData.city || "",
        street: orderData.street || "",
        house_number: orderData.house_number || "",
        apartment: orderData.apartment || "",
        floor: orderData.floor || "",
        delivery_date: orderData.delivery_date || "",
        delivery_time: orderData.delivery_time || "",
        notes: orderData.notes || "",
        payment_method: orderData.payment_method,
        total_price: orderData.total,
        items: orderData.items,
        recommendations: orderData.recommendations || [],
        status: "pending",
        payment_status: "pending",
      }),
    });

    if (!dbRes.ok) {
      const err = await dbRes.text();
      console.error("❌ Database error:", err);
      throw new Error(err);
    }

    const saved = await dbRes.json();

    await sendEmail({
      to: ["lulu@lulu-k.com", "lulu.kitchen.il@gmail.com"],
      subject: `🔔 הזמנה חדשה - ${orderData.customer_name}`,
      html: generateEmailHTML(orderData, false),
    });

    if (orderData.customer_email) {
      await sendEmail({
        to: [orderData.customer_email],
        subject: "תודה על ההזמנה שלך!",
        html: generateEmailHTML(orderData, true),
      });
    }

    const whatsappUrl = sendWhatsAppFallback(orderData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "ההזמנה נשלחה בהצלחה!",
        orderId: saved[0]?.id || null,
        whatsappUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("⚠️ Error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
