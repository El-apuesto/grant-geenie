import { supabase } from './supabase';

interface WelcomeEmailParams {
  firstName: string;
  email: string;
  planName: string;
  dashboardUrl: string;
}

/**
 * Send welcome email (Email 1) after subscription via Supabase Edge Function
 */
export async function sendWelcomeEmail({
  firstName,
  email,
  planName,
  dashboardUrl,
}: WelcomeEmailParams) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'welcome',
        to: email,
        firstName,
        planName,
        dashboardUrl,
      },
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Welcome email error:', err);
    throw err;
  }
}

interface MatchesEmailParams {
  firstName: string;
  email: string;
  matchesCount: number;
  dashboardTourUrl: string;
}

/**
 * Send matches + tour invitation email (Email 2) after questionnaire completion via Supabase Edge Function
 */
export async function sendMatchesEmail({
  firstName,
  email,
  matchesCount,
  dashboardTourUrl,
}: MatchesEmailParams) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'matches',
        to: email,
        firstName,
        matchesCount,
        dashboardTourUrl,
      },
    });

    if (error) {
      console.error('Error sending matches email:', error);
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    console.error('Matches email error:', err);
    throw err;
  }
}
