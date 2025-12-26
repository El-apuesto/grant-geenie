import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Missing sessionId or userId' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

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
      return NextResponse.json(
        { error: 'Invalid or unpaid session' },
        { status: 400 }
      );
    }

    // Update the user's profile to Pro tier
    const { error, data } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: 'pro',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Database update failed:', error);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    console.log(`✅ User ${userId} successfully upgraded to Pro`);
    console.log('Updated profile:', data);

    return NextResponse.json({ 
      success: true,
      subscription_tier: 'pro',
      message: 'Successfully upgraded to Pro'
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
