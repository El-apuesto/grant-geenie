import { useEffect, useState } from 'react';

interface LemonSqueezyCheckoutProps {
  variantId?: string;
  buttonText?: string;
  className?: string;
}

declare global {
  interface Window {
    createLemonSqueezy: () => void;
    LemonSqueezy: {
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

export default function LemonSqueezyCheckout({
  variantId = import.meta.env.VITE_LEMON_SQUEEZY_VARIANT_ID,
  buttonText = 'Subscribe Now',
  className = ''
}: LemonSqueezyCheckoutProps) {
  const [checkoutUrl, setCheckoutUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const storeId = import.meta.env.VITE_LEMON_SQUEEZY_STORE_ID;

  useEffect(() => {
    // Load Lemon.js script
    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.async = true;
    
    script.onload = () => {
      if (window.createLemonSqueezy) {
        window.createLemonSqueezy();
      }
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Generate checkout URL
    if (storeId && variantId) {
      const url = `https://store.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=USER_ID_HERE`;
      setCheckoutUrl(url);
    }
  }, [storeId, variantId]);

  const handleClick = (e: React.MouseEvent) => {
    if (!checkoutUrl) {
      e.preventDefault();
      console.error('Lemon Squeezy checkout URL not configured');
      return;
    }
  };

  if (!storeId || !variantId) {
    return (
      <div className="text-red-500">
        Lemon Squeezy not configured. Please set VITE_LEMON_SQUEEZY_STORE_ID and VITE_LEMON_SQUEEZY_VARIANT_ID
      </div>
    );
  }

  return (
    <a
      href={checkoutUrl}
      className={`lemonsqueezy-button ${className} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      onClick={handleClick}
      data-variant-id={variantId}
    >
      {buttonText}
    </a>
  );
}
