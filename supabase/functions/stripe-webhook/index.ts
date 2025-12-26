import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@^17.4.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { 
  apiVersion: "2024-12-18.acacia" as any
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") || "https://ooxkwrnmnygatsxahspd.supabase.co",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(
      JSON.stringify({ error: "No signature" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout completed:", session.id);

        if (session.metadata?.user_id) {
          await updateUserSubscription(session.metadata.user_id, session);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);
        
        if (subscription.metadata?.user_id) {
          await handleSubscriptionCancellation(subscription.metadata.user_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateUserSubscription(userId: string, session: Stripe.Checkout.Session) {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_tier: "pro",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }
    
    console.log(`User ${userId} upgraded to Pro`);
  } catch (error) {
    console.error("Error in updateUserSubscription:", error);
    throw error;
  }
}

async function handleSubscriptionCancellation(userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_tier: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error handling cancellation:", error);
    }
  } catch (error) {
    console.error("Error in handleSubscriptionCancellation:", error);
  }
}
