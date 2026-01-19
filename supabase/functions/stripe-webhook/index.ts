import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Webhook Error: Missing signature or secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle successful checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id || session.client_reference_id

      if (userId) {
        // Update database
        const { data: profile } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'pro',
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', userId)
          .select('email, full_name')
          .single()

        // Send welcome email
        if (profile && RESEND_API_KEY) {
          await sendEmail({
            to: profile.email,
            subject: "Your Grant Hustle receipt and what's next",
            html: generateWelcomeEmail(
              profile.full_name || 'there',
              'Pro',
              `${Deno.env.get('SITE_URL')}/dashboard`
            ),
          })
        }
      }
    }

    // Handle successful payment (renewal)
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      // Restore access immediately on successful payment
      const { data: profile } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_tier: 'pro',
        })
        .eq('stripe_customer_id', customerId)
        .select('email, full_name')
        .single()

      if (profile && RESEND_API_KEY) {
        await sendEmail({
          to: profile.email,
          subject: 'Payment successful - Grant Hustle',
          html: `<p>Hi ${profile.full_name || 'there'},</p><p>Your payment was successful. Thank you for being a Grant Hustle subscriber!</p>`,
        })
      }
    }

    // Handle failed payment (immediate downgrade)
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const { data: profile } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'payment_failed',
        })
        .eq('stripe_customer_id', customerId)
        .select('email, full_name')
        .single()

      if (profile && RESEND_API_KEY) {
        await sendEmail({
          to: profile.email,
          subject: 'Payment failed - Grant Hustle',
          html: `<p>Hi ${profile.full_name || 'there'},</p><p>We couldn't process your payment. Your account has been downgraded to Free. Update your payment method to restore Pro access.</p>`,
        })
      }
    }

    // Handle subscription update
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile && RESEND_API_KEY) {
        await sendEmail({
          to: profile.email,
          subject: 'Subscription updated - Grant Hustle',
          html: `<p>Hi ${profile.full_name || 'there'},</p><p>Your Grant Hustle subscription has been updated.</p>`,
        })
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Update database
      const { data: profile } = await supabase
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
        })
        .eq('stripe_customer_id', customerId)
        .select('email, full_name')
        .single()

      // Send cancellation email
      if (profile && RESEND_API_KEY) {
        await sendEmail({
          to: profile.email,
          subject: 'Subscription canceled - Grant Hustle',
          html: `<p>Hi ${profile.full_name || 'there'},</p><p>Your Grant Hustle subscription has been canceled. We're sorry to see you go!</p>`,
        })
      }
    }

    // Handle trial ending
    if (event.type === 'customer.subscription.trial_will_end') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('stripe_customer_id', customerId)
        .single()

      if (profile && RESEND_API_KEY) {
        await sendEmail({
          to: profile.email,
          subject: 'Your trial is ending soon - Grant Hustle',
          html: `<p>Hi ${profile.full_name || 'there'},</p><p>Your Grant Hustle trial will end in 3 days. Update your payment method to continue using all features.</p>`,
        })
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Grant Hustle <onboarding@granthustle.com>',
        to,
        subject,
        html,
      }),
    })
  } catch (error) {
    console.error('Email send error:', error)
  }
}

function generateWelcomeEmail(firstName: string, planName: string, dashboardUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
.content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
.button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
.footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1 style="margin: 0; font-size: 28px;">Welcome to Grant Hustle</h1>
</div>
<div class="content">
<p>Hi ${firstName},</p>
<p>Thank you for subscribing to Grant Hustle. This email confirms your subscription to the <strong>${planName}</strong> plan. Your account is now ready!</p>
<div style="text-align: center;">
<a href="${dashboardUrl}" class="button">Go to your dashboard</a>
</div>
<p>Thanks again,<br>The Grant Hustle Team</p>
</div>
<div class="footer">
<p>You received this email because you subscribed to Grant Hustle.</p>
</div>
</div>
</body>
</html>`
}