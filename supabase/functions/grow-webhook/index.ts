import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROW_WEBHOOK_KEY = "8b436765-e9b5-1efc-c923-13269b8a1ab1";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const urlOrderId = url.searchParams.get("order_id");

    const payload = await req.json();
    console.log("Grow webhook received:", JSON.stringify(payload, null, 2));

    let orderId: string | null = null;
    let transactionId: string | null = null;
    let paymentStatus = "pending";
    let webhookKeyFromPayload: string | null = null;

    if (payload.data && payload.status) {
      webhookKeyFromPayload = payload.webhookKey || null;
      const data = payload.data;
      transactionId = data.transactionId || data.transactionToken || null;
      const statusCode = data.statusCode;
      if (statusCode === "2" || data.status === "שולם") {
        paymentStatus = "paid";
      }
      orderId = urlOrderId;
    } else if (payload.webhookKey) {
      webhookKeyFromPayload = payload.webhookKey;
      transactionId = payload.transactionCode || null;
      const paymentType = payload.paymentType;
      if (payload.paymentDate) {
        paymentStatus = "paid";
      }
      orderId = urlOrderId;
    } else {
      orderId = payload.order_id || urlOrderId;
      transactionId = payload.transaction_id || payload.transactionCode || null;
      const status = payload.status;
      if (status === "completed" || status === "success" || status === "paid") {
        paymentStatus = "paid";
      }
    }

    if (webhookKeyFromPayload && webhookKeyFromPayload !== GROW_WEBHOOK_KEY) {
      console.error("Invalid webhook key from payload");
      return new Response(
        JSON.stringify({ error: "Invalid webhook key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!orderId) {
      console.error("No order_id found in URL or payload");
      return new Response(
        JSON.stringify({ error: "Missing order_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching order:", fetchError);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order) {
      console.error("Order not found:", orderId);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        payment_method: "grow",
        grow_transaction_id: transactionId,
        raw_webhook_data: payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Order ${orderId} updated successfully. Payment status: ${paymentStatus}`);

    if (paymentStatus === "paid") {
      try {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-payment-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ orderId }),
        });

        if (!emailRes.ok) {
          console.error("Failed to send confirmation emails:", await emailRes.text());
        } else {
          console.log("Confirmation emails sent successfully");
        }
      } catch (emailError) {
        console.error("Error triggering email function:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, order_id: orderId, payment_status: paymentStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});