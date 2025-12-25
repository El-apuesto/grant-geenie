import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update user to Pro
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'pro',
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.metadata?.user_id);

      if (error) {
        console.error('Database update failed:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      console.log(`✅ User ${session.metadata?.user_id} upgraded to Pro`);
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      
      // Downgrade user back to free
      await supabase
        .from('profiles')
        .update({ 
          subscription_tier: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', subscription.customer as string);

      console.log(`❌ Subscription cancelled for customer ${subscription.customer}`);
      break;
  }

  return NextResponse.json({ received: true });
}
