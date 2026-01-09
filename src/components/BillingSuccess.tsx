import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function BillingSuccess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to initialize
    if (authLoading) return;

    const verifyPayment = async () => {
      console.log("🔍 Starting payment verification...");
      
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      
      if (!sessionId) {
        console.error("❌ No session ID found");
        setStatus("error");
        setErrorMessage("No session ID found in URL");
        return;
      }

      if (!user) {
        console.error("❌ User not authenticated");
        setStatus("error");
        setErrorMessage("Please log in to verify your payment");
        return;
      }

      try {
        console.log("📞 Calling /api/stripe-success...");
        
        const response = await fetch("/api/stripe-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Payment verification failed");
        }

        console.log("✅ Payment verified! Refreshing session...");
        
        // Refresh the session to get updated profile data
        await supabase.auth.refreshSession();
        
        console.log("✅ Session refreshed!");
        setStatus("success");
        
        // Redirect to dashboard immediately
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
        
      } catch (error: any) {
        console.error("❌ Payment verification error:", error);
        // If the error is that it was already processed, we can consider it a success
        if (error.message?.includes('already processed')) {
           setStatus("success");
           setTimeout(() => {
             window.location.href = "/dashboard";
           }, 1500);
           return;
        }
        
        setStatus("error");
        setErrorMessage(error.message || "An unexpected error occurred");
      }
    };

    verifyPayment();
  }, [user, authLoading]);

  if (status === "loading" || authLoading) {
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
          <div className="flex gap-3 justify-center mt-6">
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded transition-colors"
            >
              Go to Dashboard
            </button>
            <a 
              href="mailto:support@grantgeenie.com"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="text-emerald-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-slate-400 mb-2">Your subscription is active.</p>
        <p className="text-sm text-slate-500 mb-6">Redirecting to dashboard...</p>
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}