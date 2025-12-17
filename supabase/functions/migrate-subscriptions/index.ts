// supabase/functions/migrate-subscriptions/index.ts
// One-time migration script to update existing subscriptions to new prices
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@15.12.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });

// Price ID mapping
const PRICE_MIGRATIONS = {
  // Old price -> New price
  "price_1Sa9CtG85r4wkmwWNVjMLlVy": "price_1SbWyQG85r4wkmwWKFT2dwlf", // Old yearly -> 199.99 yearly
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adminKey } = await req.json();

    // Simple auth check - you should use a secure admin key
    if (adminKey !== Deno.env.get("ADMIN_MIGRATION_KEY")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      processed: 0,
      updated: 0,
      errors: [] as string[],
    };

    // Process each old price
    for (const [oldPriceId, newPriceId] of Object.entries(PRICE_MIGRATIONS)) {
      console.log(`Migrating subscriptions from ${oldPriceId} to ${newPriceId}`);

      // List all active subscriptions with the old price
      const subscriptions = await stripe.subscriptions.list({
        price: oldPriceId,
        status: "active",
        limit: 100,
      });

      console.log(`Found ${subscriptions.data.length} subscriptions to migrate`);

      for (const subscription of subscriptions.data) {
        results.processed++;

        try {
          // Find the subscription item with the old price
          const oldItem = subscription.items.data.find(
            (item) => item.price.id === oldPriceId
          );

          if (!oldItem) {
            console.warn(`Subscription ${subscription.id} doesn't have old price`);
            continue;
          }

          // Update the subscription to use the new price at the end of current billing period
          await stripe.subscriptions.update(subscription.id, {
            items: [
              {
                id: oldItem.id,
                price: newPriceId,
                quantity: oldItem.quantity,
              },
            ],
            proration_behavior: "none", // No immediate charge, applies at next renewal
          });

          results.updated++;
          console.log(`✓ Updated subscription ${subscription.id}`);
        } catch (error) {
          const errorMsg = `Failed to update ${subscription.id}: ${error.message}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Migration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
