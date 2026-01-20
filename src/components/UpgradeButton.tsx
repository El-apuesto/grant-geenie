import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface UpgradeButtonProps {
  variantId: string;
  storeId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function UpgradeButton({
  variantId,
  storeId,
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
      // Get store slug from environment or use default
      const storeSlug = import.meta.env.VITE_LEMON_SQUEEZY_STORE_SLUG || 'icap.io';
      
      // Get current domain for redirects
      const baseUrl = window.location.origin;
      
      // Create Lemon Squeezy checkout URL with redirect URLs
      const checkoutUrl = `https://${storeSlug}.lemonsqueezy.com/checkout/buy/${variantId}?checkout[email]=${encodeURIComponent(user.email || '')}&checkout[custom][user_id]=${user.id}&checkout[success_url]=${encodeURIComponent(baseUrl + '/billing/success')}&checkout[cancel_url]=${encodeURIComponent(baseUrl + '/billing/cancel')}`;
      
      // Redirect to Lemon Squeezy checkout
      window.location.href = checkoutUrl;
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