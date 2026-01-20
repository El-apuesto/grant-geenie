import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the signature from headers
    const signature = req.headers.get('X-Signature');
    const signingSecret = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET');

    if (!signingSecret) {
      throw new Error('Missing LEMON_SQUEEZY_WEBHOOK_SECRET');
    }

    // Get the raw body
    const rawBody = await req.text();
    
    // Verify the signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(signingSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== computedSignature) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const subscriptionData = payload.data?.attributes;
    const customData = payload.meta?.custom_data;

    console.log('Webhook event:', eventName);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const userId = customData?.user_id;

    if (!userId) {
      console.error('No user_id in webhook payload');
      return new Response('No user_id provided', { status: 400, headers: corsHeaders });
    }

    // Handle different subscription events
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_payment_success':
      case 'subscription_resumed':
      case 'subscription_unpaused': {
        // Activate Pro subscription
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_tier: 'pro',
            lemon_squeezy_subscription_id: subscriptionData?.subscription_id || payload.data?.id,
            lemon_squeezy_variant_id: subscriptionData?.variant_id,
            subscription_ends_at: subscriptionData?.renews_at || subscriptionData?.ends_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }

        console.log(`User ${userId} subscription activated`);
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_payment_failed': {
        // Downgrade to free
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: eventName === 'subscription_cancelled' ? 'cancelled' : 'expired',
            subscription_tier: 'free',
            subscription_ends_at: subscriptionData?.ends_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }

        console.log(`User ${userId} subscription ${eventName}`);
        break;
      }

      case 'subscription_paused': {
        // Mark as paused
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'paused',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }

        console.log(`User ${userId} subscription paused`);
        break;
      }

      default:
        console.log(`Unhandled event: ${eventName}`);
    }

    return new Response(
      JSON.stringify({ success: true, event: eventName }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
