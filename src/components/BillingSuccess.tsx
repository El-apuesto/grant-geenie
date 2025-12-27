import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function BillingSuccess() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const { user } = useAuth();

  useEffect(() => {
    const confirmPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      
      if (!sessionId) {
        setStatus("error");
        return;
      }

      if (!user) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_DB_URL}/functions/v1/confirm-session`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ sessionId, userId: user.id }),
        });

        const data = await res.json();
        if (data.success) {
          setStatus("success");
          // Redirect to dashboard after 3 seconds
          setTimeout(() => window.location.href = "/", 3000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    confirmPayment();
  }, [user]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-lg text-white">Processing your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h1>
          <p className="text-slate-400 mb-4">There was an issue verifying your payment. Please contact support.</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-emerald-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-slate-400 mb-4">Your account has been upgraded. Redirecting to dashboard...</p>
      </div>
    </div>
  );
}