import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface UpgradeButtonProps {
  priceId: string;
  children?: React.ReactNode;
}

export default function UpgradeButton({ priceId, children = "Upgrade" }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_DB_URL}/functions/v1/stripe-checkout`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ priceId, userId: user.id, email: user.email }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpgrade} 
      disabled={loading}
      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}