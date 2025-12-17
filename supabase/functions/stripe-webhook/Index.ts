// grant-geenie/supabase/functions/stripe-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@15.12.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

type StripeUserMetadata = {
  user_id?: string; // Supabase auth user id
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const bodyText = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        await handleBillingEvent(event);
        break;
      }
      default:
        // Ignore unhandled events but still return 200 so Stripe is happy
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error handling Stripe event:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
});

async function handleBillingEvent(event: Stripe.Event) {
  // Normalize some fields from different event types
  let userId: string | undefined;
  let status: string | undefined;
  let currentPeriodEnd: number | undefined;
  let cancelAtPeriodEnd: boolean | undefined;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = (session.metadata || {}) as StripeUserMetadata;
    userId = meta.user_id;
    status = session.subscription ? "active" : undefined;
  } else if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const meta = (sub.metadata || {}) as StripeUserMetadata;
    userId = meta.user_id;
    status = sub.status;
    currentPeriodEnd = sub.current_period_end;
    cancelAtPeriodEnd = sub.cancel_at_period_end ?? undefined;
  } else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const sub = invoice.subscription as Stripe.Subscription | string | null;

    if (typeof sub === "string" || sub === null) {
      // Optionally fetch subscription to get metadata.user_id if (typeof sub === "string") {
      if (typeof sub === "string") {
        const fetched = await stripe.subscriptions.retrieve(sub);
        const meta = (fetched.metadata || {}) as StripeUserMetadata;
        userId = meta.user_id;
        status = "past_due";
      }
    } else {
      const meta = (sub.metadata || {}) as StripeUserMetadata;
      userId = meta.user_id;
      status = "past_due";
    }
  }

  if (!userId) {
    console.warn("Stripe event missing user_id metadata; skipping profile update");
    return;
  }

  const updates: Record<string, unknown> = {
    stripe_event_type: event.type,
    updated_at: new Date().toISOString(),
  };

  if (status) updates.subscription_status = status;
  if (currentPeriodEnd) updates.subscription_current_period_end = new Date(currentPeriodEnd * 1000).toISOString();
  if (cancelAtPeriodEnd !== undefined) updates.subscription_cancel_at_period_end = cancelAtPeriodEnd;

  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Failed to update profiles from Stripe webhook:", error);
    throw error;
  }
}
