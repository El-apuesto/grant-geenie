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

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ priceId, userId: user.id }),
      });

      const { url } = await res.json();
      window.location.href = url;
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
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}