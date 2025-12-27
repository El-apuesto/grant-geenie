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
    if (!user) {
      alert("Please sign in first");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          priceId, 
          userId: user.id,
          email: user.email 
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
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