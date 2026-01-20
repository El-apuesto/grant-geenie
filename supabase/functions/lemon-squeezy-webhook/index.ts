import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LEMON_SQUEEZY_WEBHOOK_SECRET = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface WebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      store_id: number;
      customer_id: number;
      order_id: number;
      status: string;
      user_email: string;
      user_name: string;
      renews_at?: string;
      ends_at?: string;
      created_at: string;
      updated_at: string;
    };
  };
}

serve(async (req) => {
  try {
    // Verify webhook signature
    const signature = req.headers.get('X-Signature');
    if (!signature) {
      return new Response('Missing signature', { status: 401 });
    }

    const body = await req.text();
    
    // Verify the signature using HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(LEMON_SQUEEZY_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(
      signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(body)
    );

    if (!isValid) {
      return new Response('Invalid signature', { status: 401 });
    }

    const payload: WebhookPayload = JSON.parse(body);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;
    const subscriptionData = payload.data.attributes;

    console.log('Processing event:', eventName);

    // Handle different event types
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        // Update user subscription status
        if (customData?.user_id) {
          const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: customData.user_id,
              lemon_squeezy_subscription_id: payload.data.id,
              status: subscriptionData.status,
              customer_email: subscriptionData.user_email,
              renews_at: subscriptionData.renews_at,
              ends_at: subscriptionData.ends_at,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error('Error updating subscription:', error);
            throw error;
          }
        }
        break;

      case 'subscription_cancelled':
      case 'subscription_expired':
        if (customData?.user_id) {
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              status: 'cancelled',
              ends_at: subscriptionData.ends_at,
              updated_at: new Date().toISOString(),
            })
            .eq('lemon_squeezy_subscription_id', payload.data.id);

          if (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
          }
        }
        break;

      case 'order_created':
        // Handle one-time purchases if needed
        console.log('Order created:', payload.data.id);
        break;

      default:
        console.log('Unhandled event type:', eventName);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
