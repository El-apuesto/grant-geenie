// supabase/functions/stripe-webhook/index.ts
// Enhanced to handle checkout.session.completed and create subscription schedules
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@15.12.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const REGULAR_PRICE_ID = "price_1Sa918G85r4wkmwW786cBMaH"; // 27.99

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
        console.log("Checkout session completed:", session.id);
        console.log("Payment status:", session.payment_status);

        // CRITICAL: Only fulfill order if payment was successful
        if (session.payment_status !== "paid") {
          console.log(`Payment not completed yet. Status: ${session.payment_status}`);
          break;
        }

        // Check for duplicate processing using idempotency
        if (session.metadata?.user_id) {
          const alreadyProcessed = await checkIfSessionProcessed(session.id);
          if (alreadyProcessed) {
            console.log(`Session ${session.id} already processed. Skipping.`);
            break;
          }

          // Mark session as processed
          await markSessionAsProcessed(session.id, session.metadata.user_id);

          // If this session has scheduled pricing metadata, create a subscription schedule
          if (session.metadata?.pricing_type === "scheduled" && session.subscription) {
            await createSubscriptionSchedule(session.subscription as string);
          }

          // Update user subscription status in database
          await updateUserSubscription(session.metadata.user_id, session);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}:`, subscription.id);
        
        if (subscription.metadata?.user_id) {
          await syncSubscriptionToDatabase(subscription.metadata.user_id, subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription deleted:", subscription.id);
        
        if (subscription.metadata?.user_id) {
          await handleSubscriptionCancellation(subscription.metadata.user_id, subscription);
        }
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice ${event.type}:`, invoice.id);
        // Handle invoice events if needed
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkIfSessionProcessed(sessionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from("processed_checkout_sessions")
      .select("session_id")
      .eq("session_id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking session:", error);
    }

    return !!data;
  } catch (error) {
    console.error("Error in checkIfSessionProcessed:", error);
    return false;
  }
}

async function markSessionAsProcessed(sessionId: string, userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("processed_checkout_sessions")
      .insert({
        session_id: sessionId,
        user_id: userId,
        processed_at: new Date().toISOString(),
      });

    if (error) {
      console.error("Error marking session as processed:", error);
    }
  } catch (error) {
    console.error("Error in markSessionAsProcessed:", error);
  }
}

async function createSubscriptionSchedule(subscriptionId: string) {
  try {
    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Create a subscription schedule from the subscription
    let schedule = await stripe.subscriptionSchedules.create({
      from_subscription: subscriptionId,
      end_behavior: "release",
    });

    // Get current phase info
    const currentPhase = schedule.phases[0];
    const currentQuantity = currentPhase.items[0].quantity || 1;

    // Update schedule with two phases: intro price then regular price
    schedule = await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          // Phase 1: Current intro price for first billing period
          items: [{ price: currentPhase.items[0].price as string, quantity: currentQuantity }],
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
          proration_behavior: "none",
        },
        {
          // Phase 2: Regular price, recurring monthly
          items: [{ price: REGULAR_PRICE_ID, quantity: currentQuantity }],
          proration_behavior: "none",
        },
      ],
    });

    console.log(`Created subscription schedule: ${schedule.id}`);
    return schedule;
  } catch (error) {
    console.error("Error creating subscription schedule:", error);
    throw error;
  }
}

async function updateUserSubscription(userId: string, session: Stripe.Checkout.Session) {
  try {
    // Update user profile or subscription table in Supabase
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_status: "active",
        subscription_tier: "pro",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user subscription:", error);
      throw error;
    }
    
    console.log(`Successfully updated user ${userId} to pro tier`);
  } catch (error) {
    console.error("Error in updateUserSubscription:", error);
    throw error;
  }
}

async function syncSubscriptionToDatabase(userId: string, subscription: Stripe.Subscription) {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Error syncing subscription:", error);
    }
  } catch (error) {
    console.error("Error in syncSubscriptionToDatabase:", error);
  }
}

async function handleSubscriptionCancellation(userId: string, subscription: Stripe.Subscription) {
  try {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "cancelled",
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