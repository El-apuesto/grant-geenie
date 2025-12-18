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
    const { firstName, email, matchesCount, dashboardTourUrl } = await req.json();
    const matchesText = matchesCount > 0 ? ` (you have ${matchesCount} so far)` : '';

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
.feature-list { background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; }
.feature-list ul { margin: 0; padding-left: 20px; }
.feature-list li { margin: 10px 0; }
.button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
.footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1 style="margin: 0; font-size: 28px;">Your Grant Matches Are Ready!</h1>
</div>
<div class="content">
<p>Hi ${firstName},</p>
<p>Thanks again for joining Grant Hustle - you've already completed your questionnaire and started seeing your first grant matches${matchesText}. Those matches are now saved on your dashboard, where you can track each opportunity from first idea to post-award reporting.</p>
<div class="feature-list">
<p style="margin-top: 0; font-weight: 600;">On the guided tour, you'll see:</p>
<ul>
<li><strong>Grant pool</strong> - all of your matched and saved grants in one place, with statuses like Researching, LOI, Application, Awarded, or Declined.</li>
<li><strong>Fiscal sponsor partners</strong> - which fiscal sponsor is connected to each grant, so you can keep relationships and requirements straight.</li>
<li><strong>LOIs &amp; applications</strong> - track every LOI and full proposal from "Not started" through "Submitted," with due dates, decision dates, and key documents.</li>
<li><strong>Templates library</strong> - best-practice starting points for LOIs, full proposals, budgets, and simple reports that you can copy, customize, and attach to grants.</li>
<li><strong>Wins &amp; records</strong> - how many grants you've submitted, awarded, and declined, plus your success rate and total dollars requested and awarded.</li>
<li><strong>Calendar</strong> - LOI, application, and reporting deadlines automatically added so you can see all your key dates at a glance.</li>
</ul>
</div>
<p>When you click the button below, <strong>The Grant Genie</strong> will appear on your dashboard and guide you through each of these sections with simple "Next" prompts. If you skip the tour now, you can always start it again later from inside the app.</p>
<div style="text-align: center;">
<a href="${dashboardTourUrl}" class="button">Meet The Grant Genie on your dashboard</a>
</div>
<p>See you inside Grant Hustle,<br>The Grant Hustle Team</p>
</div>
<div class="footer">
<p>You received this email because you completed the Grant Hustle questionnaire.</p>
</div>
</div>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'Grant Hustle <onboarding@granthustle.com>',
      to: email,
      subject: 'Your first grant matches are waiting in Grant Hustle',
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
