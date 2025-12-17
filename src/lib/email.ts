// Email service using Resend for Grant Genie onboarding
// This module handles transactional emails sent during user onboarding

interface WelcomeEmailParams {
  firstName: string;
  email: string;
  planName: string;
  dashboardUrl: string;
}

interface MatchesEmailParams {
  firstName: string;
  email: string;
  matchesCount: number;
  dashboardTourUrl: string;
}

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const FROM_EMAIL = 'Grant Genie <noreply@grantgeenie.com>';

// Email subject options for welcome email
const WELCOME_SUBJECTS = [
  'Your Grant Genie receipt & what\'s next',
  'Welcome to Grant Genie — your grant helper is ready',
  'You\'re in! Grant Genie is now working for you',
  'Grant Genie receipt inside + a quick heads-up',
  'Thanks for subscribing to Grant Genie'
];

// Email subject options for matches email
const MATCHES_SUBJECTS = [
  'Your first grant matches are waiting in Grant Genie',
  'Grant Genie found matches — ready for a quick tour?',
  'See your grant pool, calendar, and more',
  'Meet the Grant Genie on your dashboard',
  'Take a 2-minute tour of your Grant Genie dashboard',
  'Your Grant Genie tour: see matches, templates, and wins',
  'Come back to your Grant Genie dashboard for a guided walkthrough'
];

// Generate welcome email HTML
function generateWelcomeEmailHTML(params: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
    .genie-icon { width: 80px; height: 80px; margin: 0 auto 20px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content p { margin: 0 0 16px 0; color: #374151; }
    .cta-button { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .cta-button:hover { background-color: #059669; }
    .footer { padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="genie-icon">
        <!-- Placeholder for Grant Genie icon/image -->
        <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">🧞</div>
      </div>
      <h1>Welcome to Grant Genie!</h1>
    </div>
    <div class="content">
      <p>Hi ${params.firstName},</p>
      
      <p>Thank you for subscribing to Grant Genie — your new helper for finding and managing grants across the U.S. This email confirms your subscription to the <strong>${params.planName}</strong> plan and serves as your receipt. Your account is now ready so you can explore grant matches, track applications, and stay ahead of every deadline from one simple dashboard.</p>
      
      <p>In a little while, you'll receive a second email from Grant Genie that walks you through your dashboard and shows you how to get more out of your matches. That short tour email will include a link that takes you straight into the app, where the Grant Genie (our helpful mascot) will guide you step-by-step.</p>
      
      <p>For now, you can log in anytime to start browsing your matches and saving promising grants:</p>
      
      <div style="text-align: center;">
        <a href="${params.dashboardUrl}" class="cta-button">Go to your Grant Genie dashboard →</a>
      </div>
      
      <p>Thanks again for trusting Grant Genie to simplify your funding process.</p>
      
      <p>Warmly,<br>The Grant Genie Team</p>
    </div>
    <div class="footer">
      <p>This email serves as your receipt for your Grant Genie subscription.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Generate matches email HTML
function generateMatchesEmailHTML(params: MatchesEmailParams): string {
  const matchesText = params.matchesCount > 0 ? ` (you have ${params.matchesCount} so far)` : '';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
    .genie-icon { width: 80px; height: 80px; margin: 0 auto 20px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .content p { margin: 0 0 16px 0; color: #374151; }
    .feature-list { background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; margin: 24px 0; }
    .feature-list ul { margin: 0; padding-left: 20px; }
    .feature-list li { margin-bottom: 12px; color: #374151; }
    .cta-button { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 24px 0; }
    .cta-button:hover { background-color: #059669; }
    .footer { padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="genie-icon">
        <!-- Placeholder for Grant Genie icon/image -->
        <div style="width: 80px; height: 80px; background-color: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px;">🧞</div>
      </div>
      <h1>Your Grant Matches Are Ready!</h1>
    </div>
    <div class="content">
      <p>Hi ${params.firstName},</p>
      
      <p>Thanks again for joining Grant Genie — you've already completed your questionnaire and started seeing your first grant matches${matchesText}. Those matches are now saved on your dashboard, where you can track each opportunity from first idea to post-award reporting.</p>
      
      <div class="feature-list">
        <p style="margin-top: 0; font-weight: 600;">On the guided tour, you'll see:</p>
        <ul>
          <li><strong>Grant pool</strong> – all of your matched and saved grants in one place, with statuses like Researching, LOI, Application, Awarded, or Declined.</li>
          <li><strong>Fiscal sponsor partners</strong> – which fiscal sponsor is connected to each grant, so you can keep relationships and requirements straight.</li>
          <li><strong>LOIs & applications</strong> – track every LOI and full proposal from "Not started" through "Submitted," with due dates, decision dates, and key documents.</li>
          <li><strong>Templates library</strong> – best-practice starting points for LOIs, full proposals, budgets, and simple reports that you can copy, customize, and attach to grants.</li>
          <li><strong>Wins & records</strong> – how many grants you've submitted, awarded, and declined, plus your success rate and total dollars requested and awarded.</li>
          <li><strong>Calendar</strong> – LOI, application, and reporting deadlines automatically added so you can see all your key dates at a glance.</li>
        </ul>
      </div>
      
      <p>When you click the button below, the Grant Genie will appear on your dashboard and guide you through each of these sections with simple "Next" prompts. If you skip the tour now, you can always start it again later from inside the app.</p>
      
      <div style="text-align: center;">
        <a href="${params.dashboardTourUrl}" class="cta-button">Meet the Grant Genie on your dashboard →</a>
      </div>
      
      <p>See you inside Grant Genie,<br>The Grant Genie Team</p>
    </div>
    <div class="footer">
      <p>Questions? Just reply to this email — we're here to help!</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Send welcome email (Email 1)
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = WELCOME_SUBJECTS[0]; // Use first subject as default
    const html = generateWelcomeEmailHTML(params);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: params.email,
        subject: subject,
        html: html
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return { success: false, error: errorData.message || 'Failed to send email' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send matches email (Email 2)
export async function sendMatchesEmail(params: MatchesEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const subject = MATCHES_SUBJECTS[0]; // Use first subject as default
    const html = generateMatchesEmailHTML(params);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: params.email,
        subject: subject,
        html: html
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return { success: false, error: errorData.message || 'Failed to send email' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending matches email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
