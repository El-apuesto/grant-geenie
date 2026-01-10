import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function BillingSuccess() {
  const [countdown, setCountdown] = useState(3);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Countdown redirect
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = "/dashboard";
    }
  }, [countdown]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-white">Loading...</p>
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
          Your subscription is being activated. This may take a few moments.
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
          Note: If your Pro features don't appear immediately, please refresh your browser.
        </p>
      </div>
    </div>
  );
}