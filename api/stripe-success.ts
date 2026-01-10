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

    console.log('=== Payment Verification Started ===');
    console.log('Session ID:', sessionId);

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    // Retrieve the checkout session from Stripe
    console.log('Fetching session from Stripe...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session retrieved:', {
      payment_status: session.payment_status,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata
    });

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed', payment_status: session?.payment_status });
    }

    const userId = session.metadata?.user_id;
    console.log('User ID from metadata:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'No user ID in session metadata' });
    }

    // Check if user exists first
    console.log('Checking if user profile exists...');
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user profile:', fetchError);
      return res.status(500).json({ error: 'User profile not found', details: fetchError.message });
    }

    console.log('Existing profile found:', existingProfile.id);

    // Simple update - only core fields that MUST exist
    const subscriptionData = {
      subscription_tier: 'pro',
      subscription_status: 'active',
    };

    console.log('Updating profile with:', subscriptionData);

    // Update user subscription status in Supabase
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(subscriptionData)
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Supabase update error:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      return res.status(500).json({ 
        error: 'Failed to update subscription', 
        message: updateError.message,
        code: updateError.code,
        hint: updateError.hint,
        details: updateError.details
      });
    }

    console.log('Profile updated successfully:', updatedProfile);
    console.log('=== Payment Verification Complete ===');

    return res.status(200).json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: error.message, 
      details: error.toString(),
      stack: error.stack 
    });
  }
}