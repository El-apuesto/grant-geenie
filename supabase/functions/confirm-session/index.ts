import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
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
    console.log("=== CONFIRM SESSION START ===");
    
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));
    
    const { sessionId, userId: claimedUserId } = body;

    if (!sessionId) {
      console.error("Missing sessionId in request");
      throw new Error("Missing sessionId");
    }

    console.log("Fetching Stripe session:", sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Stripe session payment_status:", session.payment_status);
    console.log("Stripe session metadata:", JSON.stringify(session.metadata));

    // Allow both paid and unpaid (for $0.00 promo codes)
    if (session.payment_status !== "paid" && session.payment_status !== "unpaid") {
      console.error("Payment not completed. Status:", session.payment_status);
      throw new Error("Payment not completed");
    }

    const sessionUserId = session.metadata?.user_id;
    const userId = claimedUserId || sessionUserId;

    console.log("User IDs - claimed:", claimedUserId, "session:", sessionUserId, "final:", userId);

    if (!userId) {
      console.error("Missing userId - no userId found in request or Stripe metadata");
      throw new Error("Missing userId");
    }

    if (sessionUserId && claimedUserId && sessionUserId !== claimedUserId) {
      console.error("User mismatch - session:", sessionUserId, "claimed:", claimedUserId);
      throw new Error("User mismatch");
    }

    console.log("Fetching user profile for:", userId);
    // Get user profile for email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw profileError;
    }
    
    console.log("Profile found:", profile?.email);

    console.log("Updating subscription status...");
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

    if (error) {
      console.error("Database update error:", error);
      throw error;
    }
    
    console.log("Subscription updated successfully");

    // Send welcome email via edge function (optional, don't fail if this errors)
    try {
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
      console.log("Welcome email sent");
    } catch (emailError) {
      console.warn("Welcome email failed (non-critical):", emailError);
    }

    console.log("=== CONFIRM SESSION SUCCESS ===");
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("=== CONFIRM SESSION ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown error",
      details: error.toString()
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
