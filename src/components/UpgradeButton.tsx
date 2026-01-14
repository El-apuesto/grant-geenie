import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface UpgradeButtonProps {
  priceId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function UpgradeButton({
  priceId,
  children = "Upgrade",
  disabled = false,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (disabled) return;

    if (!user) {
      alert("Please sign in first");
      return;
    }

    setLoading(true);
    try {
      // FIXED: Call the Vercel API endpoint instead of Supabase Edge Function
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <button
      onClick={handleUpgrade}
      disabled={isDisabled}
      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
