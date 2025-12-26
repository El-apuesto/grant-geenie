import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function usePaymentVerification() {
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const isSuccess = params.get('success') === 'true';

    if (isSuccess && sessionId && user?.id && !verifying && !success) {
      verifyPayment(sessionId, user.id);
    }
  }, [user]);

  const verifyPayment = async (sessionId: string, userId: string) => {
    setVerifying(true);
    setError(null);

    try {
      // Call the Vercel serverless function
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        
        // Refresh the profile to get updated subscription_tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', userId)
          .single();

        console.log('✅ Payment verified! New tier:', profile?.subscription_tier);

        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('session_id');
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url.toString());
      } else {
        setError(data.error || 'Payment verification failed');
        console.error('Payment verification failed:', data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Network error during verification');
      console.error('Payment verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  return { verifying, error, success };
}
