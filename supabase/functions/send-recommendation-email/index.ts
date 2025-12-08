import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RecommendationRequest {
  name: string;
  email: string;
  phone?: string;
  rating: number;
  reviewHe: string;
  reviewEn: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { name, email, phone, rating, reviewHe, reviewEn }: RecommendationRequest = await req.json();

    const adminEmails = ['lulu@lulu-k.com', 'lulu.kitchen.il@gmail.com'];
    const adminPhone = '972525201978';

    const stars = '⭐'.repeat(rating);
    const emailBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
        <h2 style="color: #c41e3a;">המלצה חדשה מ-${name}</h2>
        <p><strong>דירוג:</strong> ${stars} (${rating}/5)</p>
        <p><strong>אימייל:</strong> ${email}</p>
        ${phone ? `<p><strong>טלפון:</strong> ${phone}</p>` : ''}

        <h3>התוכן בעברית:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${reviewHe || 'לא צוין'}</p>

        <h3>התוכן באנגלית:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${reviewEn || 'לא צוין'}</p>

        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">נשלח מאתר לולו קיטשן</p>
      </div>
    `;

    let emailSent = false;
    let whatsappSent = false;

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
              subject: `המלצה חדשה מ-${name} - ${stars}`,
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
              <h2 style="color: #c41e3a;">תודה רבה ${name}!</h2>
              <p style="font-size: 18px; line-height: 1.6;">קיבלנו את ההמלצה שלך ${stars}</p>
              <p style="font-size: 16px; line-height: 1.6;">אנחנו מעריכים מאוד את הזמן שלקחת לשתף את החוויה שלך איתנו.</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>הדירוג שלך:</strong> ${stars} (${rating}/5)</p>
                ${reviewHe ? `<p style="margin-top: 15px;"><em>"${reviewHe}"</em></p>` : ''}
              </div>
              <p style="color: #666;">המלצות כמו שלך עוזרות לנו להמשיך להשתפר ולהביא לכם את האוכל הכי טעים!</p>
              <p style="color: #666; margin-top: 20px;">בברכה והערכה רבה,<br>צוות לולו קיטשן 🥟</p>
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
              subject: `תודה על ההמלצה שלך ${stars} - לולו קיטשן`,
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
        const whatsappText = `🌟 המלצה חדשה!\n\nשם: ${name}\nאימייל: ${email}${phone ? `\nטלפון: ${phone}` : ''}\nדירוג: ${stars}\n\nהמלצה: ${reviewHe || reviewEn}`;

        const authHeader = 'Basic ' + btoa(`${VONAGE_API_KEY}:${VONAGE_API_SECRET}`);

        const vonageResponse = await fetch('https://messages-sandbox.nexmo.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            from: '14157386102',
            to: adminPhone,
            message_type: 'text',
            text: whatsappText,
            channel: 'whatsapp',
          }),
        });

        const vonageResult = await vonageResponse.json();
        whatsappSent = vonageResponse.ok;

        if (!whatsappSent) {
          console.error('WhatsApp sending failed:', vonageResult);
        } else {
          console.log('WhatsApp sent to admin:', vonageResult);
        }

        if (phone) {
          const customerMessage = `תודה רבה ${name} על ההמלצה שלך! ${stars}\n\nאנחנו מעריכים את הזמן שלקחת לשתף את החוויה שלך.\n\n- צוות לולו קיטשן 🥟`;

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
        whatsappSent,
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
