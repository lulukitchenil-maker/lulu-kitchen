import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderRequest {
  customer_name: string;
  customer_email: string;
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

interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "‹’‹’ ‘ﬁÿ—◊ ‘·Ÿ‡Ÿ <orders@lulu-k.com>",
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Email send failed:", error);
      return false;
    }

    console.log("Email sent successfully to:", payload.to);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
}

async function sendWhatsAppViaVonage(orderData: OrderRequest, orderNumber?: string): Promise<{ restaurant: boolean; customer: boolean }> {
  const VONAGE_API_KEY = Deno.env.get("VONAGE_API_KEY");
  const VONAGE_API_SECRET = Deno.env.get("VONAGE_API_SECRET");

  if (!VONAGE_API_KEY || !VONAGE_API_SECRET) {
    console.warn("Vonage credentials not configured, skipping WhatsApp");
    return { restaurant: false, customer: false };
  }

  const authToken = btoa(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`);

  const restaurantMessage = `
<\ ‘÷ﬁ‡‘ ◊”È‘ - ${orderData.customer_name}
=ﬁ ${orderData.customer_phone}
${orderData.delivery_date ? `=≈ Í–ËŸ⁄: ${orderData.delivery_date}` : ''}
${orderData.delivery_time ? ` È‚‘: ${orderData.delivery_time}` : ''}
=∞ ·‘"€: ™${orderData.total}
=≥ ÍÈ‹’›: ${orderData.payment_method}

=Ê ‰ËŸÿŸ›:
${orderData.items.map(item => {
  let itemText = `" ${item.name} x${item.quantity}`;
  if (item.addOns && item.addOns.length > 0) {
    itemText += `\n  Í’·‰’Í: ${item.addOns.map(addon => addon.name).join(', ')}`;
  }
  return itemText;
}).join('\n')}

${orderData.notes ? `=› ‘‚Ë’Í: ${orderData.notes}` : ''}
  `.trim();

  const customerMessage = `
È‹’› ${orderData.customer_name}! =K

Í’”‘ ‚‹ ‘‘÷ﬁ‡‘ È‹⁄ ﬁ‹’‹’ - ‘ﬁÿ—◊ ‘·Ÿ‡Ÿ! <\

${orderNumber ? `=À ﬁ·‰Ë ‘÷ﬁ‡‘: ${orderNumber}` : ''}
${orderData.delivery_date ? `=≈ Í–ËŸ⁄ ﬁÈ‹’◊: ${orderData.delivery_date}` : ''}
${orderData.delivery_time ? ` ÷ﬁﬂ –·‰Á‘: ${orderData.delivery_time}` : ''}

=Ê ‘÷ﬁ‡Í:
${orderData.items.map(item => {
  let itemText = `" ${item.name} x${item.quantity}`;
  if (item.addOns && item.addOns.length > 0) {
    itemText += `\n  Í’·‰’Í: ${item.addOns.map(addon => addon.name).join(', ')}`;
  }
  return itemText;
}).join('\n')}

=∞ ·‘"€ ‹ÍÈ‹’›: ™${orderData.total}
=≥ –ﬁÊ‚Ÿ ÍÈ‹’›: ${orderData.payment_method}

–‡◊‡’ ﬁ€Ÿ‡Ÿ› –Í ‘‘÷ﬁ‡‘ —ﬁŸ’◊” —È—Ÿ‹⁄! <â

=ﬁ ‹È–‹’Í: 052-520-1978
  `.trim();

  let restaurantSent = false;
  let customerSent = false;

  try {
    const restaurantResponse = await fetch("https://messages-sandbox.nexmo.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authToken}`,
      },
      body: JSON.stringify({
        message_type: "text",
        text: restaurantMessage,
        to: "972525201978",
        from: "14157386102",
        channel: "whatsapp",
      }),
    });

    if (restaurantResponse.ok) {
      console.log("WhatsApp sent to restaurant successfully");
      restaurantSent = true;
    } else {
      const error = await restaurantResponse.json();
      console.error("Restaurant WhatsApp failed:", error);
    }
  } catch (error) {
    console.error("Restaurant WhatsApp error:", error);
  }

  if (orderData.customer_phone) {
    try {
      const cleanPhone = orderData.customer_phone.replace(/\D/g, '');
      const customerPhone = cleanPhone.startsWith('972') ? cleanPhone : `972${cleanPhone.replace(/^0/, '')}`;

      const customerResponse = await fetch("https://messages-sandbox.nexmo.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${authToken}`,
        },
        body: JSON.stringify({
          message_type: "text",
          text: customerMessage,
          to: customerPhone,
          from: "14157386102",
          channel: "whatsapp",
        }),
      });

      if (customerResponse.ok) {
        console.log("WhatsApp sent to customer successfully");
        customerSent = true;
      } else {
        const error = await customerResponse.json();
        console.error("Customer WhatsApp failed:", error);
      }
    } catch (error) {
      console.error("Customer WhatsApp error:", error);
    }
  }

  return { restaurant: restaurantSent, customer: customerSent };
}

function sendWhatsAppFallback(orderData: OrderRequest): string {
  const message = `
<\ ‘÷ﬁ‡‘ ◊”È‘ - ${orderData.customer_name}
=ﬁ ${orderData.customer_phone}
${orderData.delivery_date ? `=≈ Í–ËŸ⁄: ${orderData.delivery_date}` : ''}
${orderData.delivery_time ? ` È‚‘: ${orderData.delivery_time}` : ''}
=∞ ·‘"€: ™${orderData.total}
=≥ ÍÈ‹’›: ${orderData.payment_method}

=Ê ‰ËŸÿŸ›:
${orderData.items.map(item => {
  let itemText = `" ${item.name} x${item.quantity}`;
  if (item.addOns && item.addOns.length > 0) {
    itemText += `\n  Í’·‰’Í: ${item.addOns.map(addon => addon.name).join(', ')}`;
  }
  return itemText;
}).join('\n')}

${orderData.notes ? `=› ‘‚Ë’Í: ${orderData.notes}` : ''}
  `.trim();

  const whatsappUrl = `https://api.whatsapp.com/send?phone=972525201978&text=${encodeURIComponent(message)}`;
  return whatsappUrl;
}

function generateEmailHTML(orderData: OrderRequest, isCustomer: boolean): string {
  const itemsHTML = orderData.items
    .map(item => {
      let html = `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name}
          ${item.addOns && item.addOns.length > 0 ? `<br><small style="color: #666;">Í’·‰’Í: ${item.addOns.map(addon => addon.name).join(', ')}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${item.price ? `™${item.price * item.quantity}` : '-'}</td>
      </tr>`;
      return html;
    })
    .join('');

  const recommendationsHTML = orderData.recommendations && orderData.recommendations.length > 0
    ? `
      <div style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <h3 style="color: #c41e3a; margin-top: 0;">=° ‘ﬁ‹Ê’Í ‹ﬁ‡’Í ‡’·‰’Í</h3>
        <ul style="margin: 10px 0; padding-right: 20px;">
          ${orderData.recommendations.map(rec => `<li>${rec.name}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  const fullAddress = [
    orderData.street,
    orderData.house_number,
    orderData.apartment ? `”ŸË‘ ${orderData.apartment}` : '',
    orderData.floor ? `Á’ﬁ‘ ${orderData.floor}` : '',
  ].filter(Boolean).join(', ');

  if (isCustomer) {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #c41e3a 0%, #8b1528 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;"><\ ‹’‹’ - ‘ﬁÿ—◊ ‘·Ÿ‡Ÿ</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Í’”‘ ‚‹ ‘‘÷ﬁ‡‘!</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #c41e3a; border-bottom: 2px solid #c41e3a; padding-bottom: 10px;">È‹’› ${orderData.customer_name},</h2>
          <p style="font-size: 16px; line-height: 1.8;">ÁŸ—‹‡’ –Í ‘÷ﬁ‡Í⁄ ’–‡◊‡’ ﬁ€Ÿ‡Ÿ› –’Í‘ —ﬁŸ’◊” —È—Ÿ‹⁄! <â</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #c41e3a;">=À ‰ËÿŸ ‘‘÷ﬁ‡‘</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background: #c41e3a; color: white;">
                  <th style="padding: 12px; text-align: right;">ﬁ‡‘</th>
                  <th style="padding: 12px; text-align: center;">€ﬁ’Í</th>
                  <th style="padding: 12px; text-align: left;">ﬁ◊ŸË</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
                <tr style="font-weight: bold; background: #fff3cd;">
                  <td colspan="2" style="padding: 15px; text-align: right; font-size: 18px;">·‘"€ ‹ÍÈ‹’›:</td>
                  <td style="padding: 15px; text-align: left; font-size: 20px; color: #c41e3a;">™${orderData.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
          ${orderData.delivery_date ? `<p><strong>=≈ Í–ËŸ⁄ ﬁÈ‹’◊:</strong> ${orderData.delivery_date}</p>` : ''}
          ${orderData.delivery_time ? `<p><strong> ÷ﬁﬂ –·‰Á‘:</strong> ${orderData.delivery_time}</p>` : ''}
          ${fullAddress ? `<p><strong>=Õ €Í’—Í ﬁÈ‹’◊:</strong> ${orderData.city}, ${fullAddress}</p>` : ''}
          <p><strong>=≥ –ﬁÊ‚Ÿ ÍÈ‹’›:</strong> ${orderData.payment_method}</p>
          ${orderData.notes ? `<p><strong>=› ‘‚Ë’Í:</strong> ${orderData.notes}</p>` : ''}
          ${recommendationsHTML}
          <div style="margin-top: 30px; padding: 20px; background: #e8f5e9; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 16px;">=ö ‡ÍË–‘ —ÁË’—! –› ŸÈ È–‹’Í, ÊË’ ÁÈË: <strong>052-520-1978</strong></p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>‹’‹’ - ‘ﬁÿ—◊ ‘·Ÿ‡Ÿ | www.lulu-k.com</p>
        </div>
      </body>
      </html>
    `;
  } else {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: #c41e3a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">= ‘÷ﬁ‡‘ ◊”È‘!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 2px solid #c41e3a; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #c41e3a; margin-top: 0;">‰ËÿŸ ‹Á’◊</h2>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>È›:</strong> ${orderData.customer_name}</li>
            <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>ÿ‹‰’ﬂ:</strong> <a href="tel:${orderData.customer_phone}">${orderData.customer_phone}</a></li>
            <li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>–ŸﬁŸŸ‹:</strong> ${orderData.customer_email}</li>
            ${orderData.delivery_date ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Í–ËŸ⁄:</strong> ${orderData.delivery_date}</li>` : ''}
            ${orderData.delivery_time ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>÷ﬁﬂ –·‰Á‘:</strong> ${orderData.delivery_time}</li>` : ''}
            ${fullAddress ? `<li style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>€Í’—Í:</strong> ${orderData.city}, ${fullAddress}</li>` : ''}
            <li style="padding: 8px 0;"><strong>ÍÈ‹’›:</strong> ${orderData.payment_method}</li>
          </ul>
          <h3 style="color: #c41e3a; margin-top: 30px;">=Ê ‰ËŸÿŸ›</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">ﬁ‡‘</th>
                <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">€ﬁ’Í</th>
                <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">ﬁ◊ŸË</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
              <tr style="font-weight: bold; background: #fff3cd;">
                <td colspan="2" style="padding: 15px; text-align: right; border: 1px solid #ddd;">·‘"€:</td>
                <td style="padding: 15px; text-align: left; border: 1px solid #ddd; color: #c41e3a; font-size: 18px;">™${orderData.total}</td>
              </tr>
            </tbody>
          </table>
          ${orderData.notes ? `
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-right: 4px solid #ffc107;">
              <strong>=› ‘‚Ë’Í ‹Á’◊:</strong><br>
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const orderData: OrderRequest = await req.json();

    console.log("Processing order for:", orderData.customer_name);

    if (!orderData.customer_name || !orderData.customer_phone || !orderData.items || orderData.items.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const fullAddress = [
      orderData.street,
      orderData.house_number,
      orderData.apartment ? `”ŸË‘ ${orderData.apartment}` : '',
      orderData.floor ? `Á’ﬁ‘ ${orderData.floor}` : '',
    ].filter(Boolean).join(', ');

    const dbPayload = {
      customer_name: orderData.customer_name,
      email: orderData.customer_email || '',
      phone: orderData.customer_phone,
      city: orderData.city || '',
      street: orderData.street || '',
      house_number: orderData.house_number || '',
      apartment: orderData.apartment || '',
      floor: orderData.floor || '',
      address: fullAddress,
      delivery_date: orderData.delivery_date || '',
      delivery_time: orderData.delivery_time || '',
      notes: orderData.notes || '',
      payment_method: orderData.payment_method,
      total_price: orderData.total,
      status: 'pending',
      payment_status: 'pending',
      items: orderData.items,
      recommendations: orderData.recommendations || [],
    };

    const dbResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(dbPayload),
    });

    if (!dbResponse.ok) {
      const error = await dbResponse.text();
      console.error("Database save failed:", error);
      throw new Error(`Database error: ${error}`);
    }

    const savedOrder = await dbResponse.json();
    console.log("Order saved to database:", savedOrder[0]?.order_number);

    let emailSent = false;
    let whatsappRestaurantSent = false;
    let whatsappCustomerSent = false;

    try {
      if (orderData.customer_email) {
        const customerEmailSent = await sendEmail({
          to: [orderData.customer_email],
          subject: `‘÷ﬁ‡‘ ﬁ·' ${savedOrder[0]?.order_number || ''} - ‹’‹’ ‘ﬁÿ—◊ ‘·Ÿ‡Ÿ`,
          html: generateEmailHTML(orderData, true),
        });
        emailSent = customerEmailSent;
      }

      const internalEmailSent = await sendEmail({
        to: ["lulu@lulu-k.com", "lulu.kitchen.il@gmail.com"],
        subject: `= ‘÷ﬁ‡‘ ◊”È‘ - ${orderData.customer_name}`,
        html: generateEmailHTML(orderData, false),
      });

      emailSent = emailSent || internalEmailSent;
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    try {
      const whatsappResult = await sendWhatsAppViaVonage(orderData, savedOrder[0]?.order_number);
      whatsappRestaurantSent = whatsappResult.restaurant;
      whatsappCustomerSent = whatsappResult.customer;
    } catch (whatsappError) {
      console.error("WhatsApp sending failed:", whatsappError);
    }

    const whatsappUrl = (!whatsappRestaurantSent && !whatsappCustomerSent) ? sendWhatsAppFallback(orderData) : undefined;

    return new Response(
      JSON.stringify({
        success: true,
        message: "‘‘÷ﬁ‡‘ ‡È‹◊‘ —‘Ê‹◊‘!",
        orderId: savedOrder[0]?.order_number,
        emailSent,
        whatsappRestaurantSent,
        whatsappCustomerSent,
        whatsappUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Order processing error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
