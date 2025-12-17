// supabase/functions/create-subscription-schedule/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@15.12.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const INTRO_PRICE_ID = "price_1Sa8yzG85r4wkmwW8CGlyij4"; // 9.99
const REGULAR_PRICE_ID = "price_1Sa918G85r4wkmwW786cBMaH"; // 27.99

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email from Supabase auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError || !authData.user) {
      throw new Error("User not found");
    }

    const userEmail = authData.user.email!;

    // Create or retrieve Stripe customer
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { user_id: userId },
      });
    }

    // Create the initial subscription with intro price
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: INTRO_PRICE_ID }],
      metadata: { user_id: userId },
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    // Create a subscription schedule from the subscription
    let schedule = await stripe.subscriptionSchedules.create({
      from_subscription: subscription.id,
      end_behavior: "release",
    });

    // Get current phase info
    const currentPhase = schedule.phases[0];
    const currentQuantity = currentPhase.items[0].quantity || 1;

    // Update schedule with two phases: intro price then regular price
    schedule = await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          // Phase 1: 9.99 intro price for first month
          items: [{ price: INTRO_PRICE_ID, quantity: currentQuantity }],
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
          proration_behavior: "none",
        },
        {
          // Phase 2: 27.99 regular price, recurring monthly
          items: [{ price: REGULAR_PRICE_ID, quantity: currentQuantity }],
          proration_behavior: "none",
          // Omit end_date to make it continue indefinitely
        },
      ],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
        scheduleId: schedule.id,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error creating subscription schedule:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
