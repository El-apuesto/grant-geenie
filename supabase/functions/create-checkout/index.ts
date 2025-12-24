import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'npm:stripe@15.12.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PRICE_IDS = {
  intro: 'price_1Sa8yzG85r4wkmwW8CGlyij4',  // $9.99 intro
  monthly: 'price_1Sa918G85r4wkmwW786cBMaH', // $27.99 monthly
  seasonal: 'price_1SaA0aG85r4wkmwWYzNLaIBk', // $79.99 seasonal  
  annual: 'price_1SaA1NG85r4wkmwWzJvkaKLC'   // $149.99 annual
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { priceType, userId } = await req.json()

    if (!priceType || !userId) {
      throw new Error('Missing priceType or userId')
    }

    const priceId = PRICE_IDS[priceType as keyof typeof PRICE_IDS]
    if (!priceId) {
      throw new Error('Invalid price type')
    }

    // Get user email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL')}/dashboard?success=true`,
      cancel_url: `${Deno.env.get('APP_URL')}/pricing?canceled=true`,
      customer_email: profile?.email,
      metadata: {
        user_id: userId,
        pricing_type: priceType === 'intro' ? 'scheduled' : 'standard',
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})