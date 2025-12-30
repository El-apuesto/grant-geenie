import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  // Log all headers to debug
  console.log('All request headers:', Object.fromEntries(req.headers.entries()))
  
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  console.log('Signature present:', !!signature)
  console.log('Webhook secret present:', !!webhookSecret)

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret')
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Webhook event:', event.type)

    // Handle successful subscription payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id || session.client_reference_id

      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'premium',
            subscription_status: 'active',
            stripe_customer_id: session.customer,
          })
          .eq('id', userId)

        if (error) {
          console.error('Database update error:', error)
          throw error
        }

        console.log(`✅ Activated premium for user: ${userId}`)
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
        })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Database update error:', error)
        throw error
      }

      console.log(`❌ Canceled subscription for customer: ${customerId}`)
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})