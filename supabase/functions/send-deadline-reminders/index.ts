import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@3.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface UpcomingDeadline {
  grant_id: string;
  grant_title: string;
  funder_name: string;
  deadline: string;
  days_until: number;
  apply_url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all Pro users
    const { data: proUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, user_id, state, org_type')
      .eq('subscription_status', 'active');

    if (usersError) throw usersError;
    if (!proUsers || proUsers.length === 0) {
      return new Response(JSON.stringify({ message: 'No Pro users to notify' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let totalEmailsSent = 0;

    // For each Pro user, check their saved grants
    for (const profile of proUsers) {
      // Get user's email
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
      if (!authUser?.user?.email) continue;

      const userEmail = authUser.user.email;

      // Get user's saved grants
      const { data: savedGrants, error: savedError } = await supabase
        .from('saved_grants')
        .select('grant_id')
        .eq('user_id', profile.user_id);

      if (savedError || !savedGrants || savedGrants.length === 0) continue;

      const grantIds = savedGrants.map(sg => sg.grant_id);

      // Get grants with deadlines in next 7 days
      const today = new Date();
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const { data: grants, error: grantsError } = await supabase
        .from('grants')
        .select('id, title, funder_name, deadline, apply_url')
        .in('id', grantIds)
        .eq('is_active', true)
        .eq('is_rolling', false)
        .not('deadline', 'is', null)
        .gte('deadline', today.toISOString())
        .lte('deadline', sevenDaysFromNow.toISOString());

      if (grantsError || !grants || grants.length === 0) continue;

      // Calculate days until deadline and filter for 7, 3, or 1 day reminders
      const upcomingDeadlines: UpcomingDeadline[] = [];
      
      for (const grant of grants) {
        const deadline = new Date(grant.deadline!);
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only send reminders at 7, 3, or 1 day marks
        if (daysUntil === 7 || daysUntil === 3 || daysUntil === 1) {
          upcomingDeadlines.push({
            grant_id: grant.id,
            grant_title: grant.title,
            funder_name: grant.funder_name,
            deadline: grant.deadline!,
            days_until: daysUntil,
            apply_url: grant.apply_url,
          });
        }
      }

      if (upcomingDeadlines.length === 0) continue;

      // Sort by days until deadline
      upcomingDeadlines.sort((a, b) => a.days_until - b.days_until);

      // Generate email HTML
      const deadlinesList = upcomingDeadlines.map(d => {
        const deadlineDate = new Date(d.deadline).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
        const urgency = d.days_until === 1 ? '🔴 URGENT' : d.days_until === 3 ? '🟡' : '🟢';
        
        return `
          <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 12px; border-left: 4px solid ${d.days_until === 1 ? '#ef4444' : d.days_until === 3 ? '#f59e0b' : '#10b981'};">
            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
              <h3 style="margin: 0; font-size: 18px; color: #1e293b;">${urgency} ${d.grant_title}</h3>
            </div>
            <p style="margin: 4px 0; color: #64748b; font-size: 14px;"><strong>${d.funder_name}</strong></p>
            <p style="margin: 8px 0; color: #334155;"><strong>Deadline:</strong> ${deadlineDate} (${d.days_until} day${d.days_until === 1 ? '' : 's'} away)</p>
            <a href="${d.apply_url}" style="display: inline-block; background: #10b981; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; margin-top: 8px;">View Application</a>
          </div>
        `;
      }).join('');

      const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
.content { background: #ffffff; padding: 30px 20px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
.footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1 style="margin: 0; font-size: 28px;">⏰ Grant Deadline Reminder</h1>
</div>
<div class="content">
<p>Hi there,</p>
<p>You have <strong>${upcomingDeadlines.length} grant deadline${upcomingDeadlines.length === 1 ? '' : 's'}</strong> coming up soon for grants you've saved:</p>
${deadlinesList}
<p style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">Don't forget to:</p>
<ul style="color: #475569;">
<li>Review application requirements</li>
<li>Prepare required documents</li>
<li>Submit before the deadline!</li>
</ul>
<p>Good luck with your applications! 🍀</p>
<p>- The Grant Geenie Team</p>
</div>
<div class="footer">
<p>You received this because you have saved grants with upcoming deadlines.</p>
<p><a href="https://grantgeenie.com/dashboard" style="color: #10b981;">View Dashboard</a></p>
</div>
</div>
</body>
</html>`;

      // Send email
      const { data, error } = await resend.emails.send({
        from: 'Grant Geenie <reminders@grantgeenie.com>',
        to: userEmail,
        subject: `⏰ ${upcomingDeadlines.length} grant deadline${upcomingDeadlines.length === 1 ? '' : 's'} coming up!`,
        html,
      });

      if (!error) {
        totalEmailsSent++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${totalEmailsSent} deadline reminder emails` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending deadline reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
