import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SMTP_HOST = Deno.env.get("SMTP_HOST")!;
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USER = Deno.env.get("SMTP_USER")!;
const SMTP_PASS = Deno.env.get("SMTP_PASS")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  const client = new SmtpClient();
  await client.connect({
    hostname: SMTP_HOST,
    port: SMTP_PORT,
    username: SMTP_USER,
    password: SMTP_PASS,
    tls: SMTP_PORT === 465
  });

  await client.send({
    from: SMTP_USER,
    to: to,
    subject: subject,
    content: html,
  });

  await client.close();
}

serve(async (req) => {
  // simple auth for scheduler: expect a secret header
  const secret = Deno.env.get("FUNCTION_SECRET") || "";
  const header = req.headers.get("x-function-secret") || "";
  if (secret && header !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  // fetch pending jobs
  const { data: queue, error } = await supabase
    .from("email_queue")
    .select("*")
    .eq("status", "pending")
    .limit(20);

  if (error) {
    console.error("Supabase fetch error:", error);
    return new Response("Error fetching queue", { status: 500 });
  }

  if (!queue || queue.length === 0) {
    return new Response("No pending emails", { status: 200 });
  }

  for (const job of queue) {
    try {
      const record = job.record as any;
      let subject = "Notification from Lulu Kitchen";
      if (job.table_name === "orders") subject = "התקבלה הזמנה חדשה – לולו מטבח סיני";
      if (job.table_name === "reviews") subject = "חוות דעת חדשה – לולו מטבח סיני";
      if (job.table_name === "contact_messages") subject = "פנייה חדשה מהאתר – לולו מטבח סיני";

      const html = `<h3>${subject}</h3><pre>${JSON.stringify(record, null, 2)}</pre>`;

      // send to owner emails
      await sendEmail(Deno.env.get("OWNER_EMAIL_1")!, subject, html);
      await sendEmail(Deno.env.get("OWNER_EMAIL_2")!, subject, html);

      // send confirmation to customer if email present
      if (record && record.email) {
        const customerSubject = "קיבלנו את פנייתך – לולו מטבח סיני";
        const customerHtml = \`<p>שלום \${record.name || ''},</p><p>תודה על פנייתך. זו העתק ההודעה/הזמנה:</p><pre>\${JSON.stringify(record, null, 2)}</pre>\`;
        await sendEmail(record.email, customerSubject, customerHtml);
      }

      // mark job as sent
      await supabase
        .from("email_queue")
        .update({ status: "sent", last_attempt_at: new Date().toISOString() })
        .eq("id", job.id);

    } catch (err) {
      console.error("Error processing job", job.id, err);
      await supabase
        .from("email_queue")
        .update({
          status: "error",
          last_error: String(err),
          last_attempt_at: new Date().toISOString(),
          attempts: (job.attempts || 0) + 1
        })
        .eq("id", job.id);
    }
  }

  return new Response("Processed", { status: 200 });
});
