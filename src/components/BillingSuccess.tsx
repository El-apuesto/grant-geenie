import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function BillingSuccess() {
  const [countdown, setCountdown] = useState(5);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Get session_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found. Please contact support.');
      setVerifying(false);
      return;
    }

    // Call the stripe-success API to verify payment and update subscription
    const verifyPayment = async () => {
      try {
        console.log('Verifying payment with session ID:', sessionId);
        const response = await fetch('/api/stripe-success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        console.log('Payment verification response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        if (data.success) {
          console.log('Payment verified successfully, profile updated:', data.profile);
          setVerifying(false);
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Failed to verify payment');
        setVerifying(false);
      }
    };

    verifyPayment();
  }, []);

  useEffect(() => {
    // Countdown redirect only after verification is complete
    if (!verifying && !error && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!verifying && !error && countdown === 0) {
      window.location.href = "/dashboard";
    }
  }, [countdown, verifying, error]);

  if (authLoading || verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-white mb-2">Verifying your payment...</p>
          <p className="text-sm text-slate-400">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-6xl mb-6">✗</div>
          <h1 className="text-3xl font-bold text-white mb-4">Verification Error</h1>
          <p className="text-slate-300 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            <p className="text-slate-500 text-xs">
              If you continue to have issues, please contact support@grantgeenie.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-emerald-500 text-6xl mb-6">✓</div>
        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-slate-300 mb-2">Thank you for upgrading to Pro!</p>
        <p className="text-slate-400 mb-8">
          Your subscription has been activated successfully.
        </p>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <p className="text-white font-semibold mb-2">What's Next?</p>
          <p className="text-slate-400 text-sm">
            Redirecting to your dashboard in {countdown} seconds...
          </p>
        </div>

        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Go to Dashboard Now
        </button>

        <p className="text-slate-500 text-xs mt-6">
          Your Pro features are now active!
        </p>
      </div>
    </div>
  );
}