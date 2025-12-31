import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function BillingSuccess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      
      if (!sessionId) {
        setStatus("error");
        setErrorMessage("No session ID found in URL");
        return;
      }

      if (!user) {
        setStatus("error");
        setErrorMessage("User not authenticated");
        return;
      }

      try {
        // Call your existing Vercel API endpoint
        const response = await fetch("/api/stripe-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Payment verification failed");
        }

        // Refresh the session to get updated profile data
        await supabase.auth.refreshSession();
        
        setStatus("success");
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => window.location.href = "/", 3000);
        
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setStatus("error");
        setErrorMessage(error.message || "An unexpected error occurred");
      }
    };

    verifyPayment();
  }, [user]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-white">Verifying your payment...</p>
          <p className="text-sm text-slate-400 mt-2">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h1>
          <p className="text-slate-400 mb-2">{errorMessage}</p>
          <p className="text-sm text-slate-500 mb-6">
            If you were charged, your payment will be processed. Contact support if issues persist.
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-emerald-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-slate-400 mb-2">Your subscription has been activated.</p>
        <p className="text-sm text-slate-500">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
