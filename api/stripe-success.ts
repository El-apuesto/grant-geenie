import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const userId = session.metadata?.user_id;

    if (!userId) {
      return res.status(400).json({ error: 'No user ID in session metadata' });
    }

    // Get subscription details
    const subscriptionId = session.subscription as string;
    let subscriptionData = null;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionData = {
        subscription_status: subscription.status,
        subscription_tier: 'pro', // Set tier to pro
        subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        subscription_cancel_at_period_end: subscription.cancel_at_period_end || false,
      };
    } else {
      // Fallback if no subscription (shouldn't happen)
      subscriptionData = {
        subscription_status: 'active',
        subscription_tier: 'pro',
      };
    }

    console.log('Updating user profile with:', subscriptionData);

    // Update user subscription status in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update(subscriptionData)
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ error: error.message });
  }
}
