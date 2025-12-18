import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { firstName, email, planName, dashboardUrl } = await req.json();

    const html = `<!DOCTYPE html>
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
<p>Thank you for subscribing to Grant Hustle - your new helper for finding and managing grants across the U.S. This email confirms your subscription to the <strong>${planName}</strong> plan and serves as your receipt. Your account is now ready so you can explore grant matches, track applications, and stay ahead of every deadline from one simple dashboard.</p>
<p>In a little while, you'll receive a second email from Grant Hustle that walks you through your dashboard and shows you how to get more out of your matches. That short tour email will include a link that takes you straight into the app, where <strong>The Grant Genie</strong> (our small green mascot) will guide you step-by-step.</p>
<p>For now, you can log in anytime to start browsing your matches and saving promising grants:</p>
<div style="text-align: center;">
<a href="${dashboardUrl}" class="button">Go to your Grant Hustle dashboard</a>
</div>
<p>Thanks again for trusting Grant Hustle to simplify your funding process.</p>
<p>Warmly,<br>The Grant Hustle Team</p>
</div>
<div class="footer">
<p>You received this email because you subscribed to Grant Hustle.</p>
</div>
</div>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'Grant Hustle <onboarding@granthustle.com>',
      to: email,
      subject: "Your Grant Hustle receipt and what's next",
      html,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
