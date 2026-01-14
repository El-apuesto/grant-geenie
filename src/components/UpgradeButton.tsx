import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

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
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            priceId,
            userId: user.id,
          },
        }
      );

      if (error) throw error;

      const url = (data as any)?.url;
      if (!url) throw new Error("No checkout URL returned");

      window.location.href = url;
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
