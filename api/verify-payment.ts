import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, userId } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ error: 'Missing sessionId or userId' });
    }

    console.log(`Verifying payment for user ${userId}, session ${sessionId}`);

    // Retrieve the checkout session from Stripe to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('Session retrieved:', {
      mode: session.mode,
      payment_status: session.payment_status,
      metadata: session.metadata,
    });

    // Verify the session is valid, paid, and matches the user
    if (
      session.mode !== 'subscription' ||
      session.payment_status !== 'paid' ||
      session.metadata?.user_id !== userId
    ) {
      console.error('Invalid session:', {
        mode: session.mode,
        payment_status: session.payment_status,
        metadata_user: session.metadata?.user_id,
        requested_user: userId,
      });
      return res.status(400).json({ error: 'Invalid or unpaid session' });
    }

    // Update the user's profile to active Pro subscription
    const { error, data } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Database update failed:', error);
      return res.status(500).json({ error: 'Failed to update subscription' });
    }

    console.log(`✅ User ${userId} successfully upgraded to Pro (active)`);
    console.log('Updated profile:', data);

    return res.status(200).json({
      success: true,
      subscription_status: 'active',
      message: 'Successfully upgraded to Pro',
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: error.message });
  }
}
