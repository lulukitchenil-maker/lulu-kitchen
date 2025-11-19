import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactRequest {
  name: string;
  phone: string;
  email: string;
  message: string;
  preferredDate?: string;
  preferredTime?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { name, phone, email, message, preferredDate, preferredTime }: ContactRequest = await req.json();

    const adminEmails = ['lulu@lulu-k.com', 'lulu.kitchen.il@gmail.com'];
    const whatsappPhone = '972525201978';

    const emailBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #c41e3a;">הודעת יצירת קשר חדשה</h2>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>שם:</strong> ${name}</p>
          <p><strong>טלפון:</strong> ${phone}</p>
          <p><strong>אימייל:</strong> ${email || 'לא צוין'}</p>
          ${preferredDate ? `<p><strong>תאריך מועדף:</strong> ${preferredDate}</p>` : ''}
          ${preferredTime ? `<p><strong>שעה מועדפת:</strong> ${preferredTime}</p>` : ''}
        </div>

        <h3>ההודעה:</h3>
        <p style="background: #ffffff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; white-space: pre-wrap;">${message}</p>

        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">נשלח מאתר לולו קיטשן</p>
      </div>
    `;

    let emailSent = false;
    let smsSent = false;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const VONAGE_API_KEY = Deno.env.get('VONAGE_API_KEY');
    const VONAGE_API_SECRET = Deno.env.get('VONAGE_API_SECRET');

    if (RESEND_API_KEY) {
      try {
        const emailPromises = adminEmails.map(adminEmail =>
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Lulu Kitchen <orders@lulu-k.com>',
              to: [adminEmail],
              subject: `הודעה חדשה מ-${name}`,
              html: emailBody,
            }),
          })
        );

        const results = await Promise.all(emailPromises);
        emailSent = results.every(r => r.ok);

        if (!emailSent) {
          console.error('Email sending failed for some recipients');
          const errorResults = await Promise.all(results.map(r => r.text()));
          console.error('Error details:', errorResults);
        }

        if (email) {
          const customerEmailBody = `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
              <h2 style="color: #c41e3a;">תודה שיצרת קשר, ${name}!</h2>
              <p style="font-size: 16px; line-height: 1.6;">קיבלנו את הודעתך ונחזור אליך בהקדם האפשרי.</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>הפרטים שנשלחו:</strong></p>
                <p>טלפון: ${phone}</p>
                ${preferredDate ? `<p>תאריך מועדף: ${preferredDate}</p>` : ''}
                ${preferredTime ? `<p>שעה מועדפת: ${preferredTime}</p>` : ''}
              </div>
              <p style="color: #666;">בברכה,<br>צוות לולו קיטשן 🥟</p>
            </div>
          `;

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Lulu Kitchen <orders@lulu-k.com>',
              to: [email],
              subject: 'תודה שיצרת קשר - לולו קיטשן',
              html: customerEmailBody,
            }),
          });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    } else {
      console.warn('RESEND_API_KEY not configured');
    }

    if (VONAGE_API_KEY && VONAGE_API_SECRET) {
      try {
        const whatsappText = `📬 הודעה חדשה!\n\nשם: ${name}\nטלפון: ${phone}\nאימייל: ${email || 'לא צוין'}\n\nהודעה: ${message}`;

        const authHeader = 'Basic ' + btoa(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`);

        const vonageResponse = await fetch('https://messages-sandbox.nexmo.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            from: '14157386102',
            to: whatsappPhone,
            message_type: 'text',
            text: whatsappText,
            channel: 'whatsapp',
          }),
        });

        const vonageResult = await vonageResponse.json();
        smsSent = vonageResponse.ok;

        if (!smsSent) {
          console.error('WhatsApp sending failed:', vonageResult);
        } else {
          console.log('WhatsApp sent to admin:', vonageResult);
        }

        if (phone) {
          const customerMessage = `תודה ${name}! קיבלנו את הודעתך ונחזור אליך בהקדם.\n\n- צוות לולו קיטשן 🥟`;

          const customerResponse = await fetch('https://messages-sandbox.nexmo.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader,
            },
            body: JSON.stringify({
              from: '14157386102',
              to: phone,
              message_type: 'text',
              text: customerMessage,
              channel: 'whatsapp',
            }),
          });

          if (!customerResponse.ok) {
            const errorData = await customerResponse.json();
            console.error('Customer WhatsApp failed:', errorData);
          } else {
            console.log('WhatsApp sent to customer:', await customerResponse.json());
          }
        }
      } catch (whatsappError) {
        console.error('WhatsApp sending failed:', whatsappError);
      }
    } else {
      console.warn('VONAGE credentials not configured');
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent,
        smsSent,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
