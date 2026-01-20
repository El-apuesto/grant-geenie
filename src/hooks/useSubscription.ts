import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Subscription {
  id: string;
  user_id: string;
  subscription_id: string;
  variant_id: string;
  status: string;
  renews_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Check profiles table for subscription status
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_tier, lemon_squeezy_subscription_id, subscription_ends_at')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching subscription:', error);
          setSubscription(null);
        } else if (data) {
          // Convert profiles data to subscription format
          const isActive = data.subscription_status === 'active' && data.subscription_tier === 'pro';
          
          if (isActive) {
            setSubscription({
              id: data.lemon_squeezy_subscription_id || '',
              user_id: userId,
              subscription_id: data.lemon_squeezy_subscription_id || '',
              variant_id: '',
              status: data.subscription_status || 'inactive',
              renews_at: data.subscription_ends_at,
              ends_at: data.subscription_ends_at,
              created_at: '',
              updated_at: '',
            });
          } else {
            setSubscription(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [userId]);

  return { 
    subscription, 
    loading, 
    isSubscribed: !!subscription,
    isPro: subscription?.status === 'active',
  };
}