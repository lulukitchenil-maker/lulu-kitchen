import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");

    if (!orderId) {
      console.error("No order_id provided");
      return new Response(
        JSON.stringify({ error: "Missing order_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    console.log("Bit webhook received:", JSON.stringify(payload, null, 2));

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

    if (order.payment_status === 'paid') {
      console.log("Order already paid, ignoring duplicate webhook");
      return new Response(
        JSON.stringify({ success: true, message: "Order already paid" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: "bit",
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

    console.log(`Order ${orderId} updated successfully. Payment status: paid`);

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

    return new Response(
      JSON.stringify({ success: true, order_id: orderId, payment_status: "paid" }),
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