import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId, userId: claimedUserId } = await req.json();

    if (!sessionId) throw new Error("Missing sessionId");

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Allow both paid and unpaid (for $0.00 promo codes)
    if (session.payment_status !== "paid" && session.payment_status !== "unpaid") {
      throw new Error("Payment not completed");
    }

    const sessionUserId = session.metadata?.user_id;
    const userId = claimedUserId || sessionUserId;

    if (!userId) throw new Error("Missing userId");

    if (sessionUserId && claimedUserId && sessionUserId !== claimedUserId) {
      throw new Error("User mismatch");
    }

    // Get user profile for email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    // Update subscription status
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_tier: "pro",
        subscription_status: "active",
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
      })
      .eq("id", userId);

    if (error) throw error;

    // Send welcome email via edge function (optional)
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://granthustle.org";
    const planName = session.metadata?.plan_name || "Pro";

    await fetch(`${SUPABASE_URL}/functions/v1/send-welcome-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        firstName: profile.first_name || "there",
        email: profile.email,
        planName,
        dashboardUrl: `${frontendUrl}/dashboard`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
