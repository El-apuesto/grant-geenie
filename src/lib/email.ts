import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend
 * @param options Email configuration
 * @returns Promise with email response
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Grant Hustle <onboarding@granthustle.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email service error:', err);
    throw err;
  }
}

interface WelcomeEmailParams {
  firstName: string;
  email: string;
  planName: string;
  dashboardUrl: string;
}

/**
 * Send welcome email (Email 1) after subscription
 */
export async function sendWelcomeEmail({
  firstName,
  email,
  planName,
  dashboardUrl,
}: WelcomeEmailParams) {
  const subject = 'Your Grant Hustle receipt & what's next';
  
  const html = `
    <!DOCTYPE html>
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
            
            <p>Thank you for subscribing to Grant Hustle — your new helper for finding and managing grants across the U.S. This email confirms your subscription to the <strong>${planName}</strong> plan and serves as your receipt. Your account is now ready so you can explore grant matches, track applications, and stay ahead of every deadline from one simple dashboard.</p>
            
            <p>In a little while, you'll receive a second email from Grant Hustle that walks you through your dashboard and shows you how to get more out of your matches. That short tour email will include a link that takes you straight into the app, where <strong>The Grant Genie</strong> (our small green mascot) will guide you step‑by‑step.</p>
            
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
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

interface MatchesEmailParams {
  firstName: string;
  email: string;
  matchesCount: number;
  dashboardTourUrl: string;
}

/**
 * Send matches + tour invitation email (Email 2) after questionnaire completion
 */
export async function sendMatchesEmail({
  firstName,
  email,
  matchesCount,
  dashboardTourUrl,
}: MatchesEmailParams) {
  const subject = 'Your first grant matches are waiting in Grant Hustle';
  
  const matchesText = matchesCount > 0 ? ` (you have ${matchesCount} so far)` : '';
  
  const html = `
    <!DOCTYPE html>
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
            
            <p>Thanks again for joining Grant Hustle — you've already completed your questionnaire and started seeing your first grant matches${matchesText}. Those matches are now saved on your dashboard, where you can track each opportunity from first idea to post‑award reporting.</p>
            
            <div class="feature-list">
              <p style="margin-top: 0; font-weight: 600;">On the guided tour, you'll see:</p>
              <ul>
                <li><strong>Grant pool</strong> – all of your matched and saved grants in one place, with statuses like Researching, LOI, Application, Awarded, or Declined.</li>
                <li><strong>Fiscal sponsor partners</strong> – which fiscal sponsor is connected to each grant, so you can keep relationships and requirements straight.</li>
                <li><strong>LOIs & applications</strong> – track every LOI and full proposal from "Not started" through "Submitted," with due dates, decision dates, and key documents.</li>
                <li><strong>Templates library</strong> – best‑practice starting points for LOIs, full proposals, budgets, and simple reports that you can copy, customize, and attach to grants.</li>
                <li><strong>Wins & records</strong> – how many grants you've submitted, awarded, and declined, plus your success rate and total dollars requested and awarded.</li>
                <li><strong>Calendar</strong> – LOI, application, and reporting deadlines automatically added so you can see all your key dates at a glance.</li>
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
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
