import { Check } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import SubscriptionSuccessModal from './SubscriptionSuccessModal';
import { sendWelcomeEmail } from '../lib/email';

interface PricingPageProps {
  onSelectPlan: (plan: 'free' | 'intro' | 'season' | 'annual') => void;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSubscriptionSuccess = async (
    user: any,
    planName: string
  ) => {
    try {
      // Get user profile for first name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      const firstName = profile?.first_name || 'there';
      const dashboardUrl = `${window.location.origin}/dashboard`;

      // Send welcome email
      await sendWelcomeEmail({
        firstName,
        email: user.email,
        planName,
        dashboardUrl,
      });

      // Show success modal
      setUserEmail(user.email);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Still show modal even if email fails
      setUserEmail(user.email);
      setShowSuccessModal(true);
    }
  };

  const handleProMonthly = async () => {
    setIsLoading(true);
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to auth if not logged in
        alert('Please sign in first to subscribe');
        onSelectPlan('intro');
        setIsLoading(false);
        return;
      }

      // Call the Edge Function to create subscription schedule
      const { data, error } = await supabase.functions.invoke(
        'create-subscription-schedule',
        {
          body: { userId: user.id },
        }
      );

      if (error) {
        console.error('Error creating subscription:', error);
        alert('Failed to start subscription. Please try again.');
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout with the client secret
      if (data.clientSecret) {
        // Load Stripe.js
        const stripe = await loadStripe();
        if (stripe) {
          window.location.href = `https://checkout.stripe.com/pay/${data.clientSecret}`;
        }
      }

      // Note: In production, you'd handle the success callback from Stripe
      // For now, we'll trigger success on button click for demo purposes
      // In real implementation, this should happen after Stripe confirms payment
      await handleSubscriptionSuccess(user, 'Pro Monthly');
    } catch (err) {
      console.error('Subscription error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeasonPass = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Trigger success flow for season pass
      // In production, this would happen after Stripe webhook confirms payment
      await handleSubscriptionSuccess(user, 'Season Pass (4 months)');
    }
  };

  const handleAnnualPass = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Trigger success flow for annual pass
      // In production, this would happen after Stripe webhook confirms payment
      await handleSubscriptionSuccess(user, 'Annual Pass (12 months)');
    }
  };

  // Helper to load Stripe (using their publishable key from payment links)
  const loadStripe = async () => {
    // For now, just redirect to a working payment link
    // You can add Stripe.js library later for embedded checkout
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Unlock Unlimited Grant Matches
          </h1>
          <p className="text-xl text-slate-300">
            Choose the plan that fits your grant hunting needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Free Tier */}
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">Free Tier</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>5 grant matches/month</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Your state + federal</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-5 h-5 flex-shrink-0"></span>
                <span>No grant tracking</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-5 h-5 flex-shrink-0"></span>
                <span>No templates</span>
              </li>
            </ul>
            <button
              onClick={() => onSelectPlan('free')}
              className="w-full py-3 bg-slate-700 text-white rounded font-semibold hover:bg-slate-600 transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Intro Offer - Best Deal */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-2 border-emerald-500 rounded-lg p-6 flex flex-col relative lg:col-span-2 lg:scale-105 lg:shadow-2xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
              BEST DEAL
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Pro Monthly</h3>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-white/80">first month</span>
              </div>
              <div className="text-white/90 text-sm mt-1">Then $27.99/month</div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">Unlimited matches</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Save your favorites</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Application templates</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Deadline reminders</span>
              </li>
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
            <button
              onClick={handleProMonthly}
              disabled={isLoading}
              className="w-full py-4 bg-white text-emerald-700 rounded font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Start Pro for $9.99'}
            </button>
          </div>

          {/* Season Pass */}
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-2">Season Pass</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">$79.99</span>
              <span className="text-slate-400 block text-sm">one-time</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">4 months Pro access</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>All Pro features</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Perfect for grant season</span>
              </li>
            </ul>
            <a
              href="https://buy.stripe.com/aFafZhfw31TNciE8Yj"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSeasonPass}
              className="w-full py-3 bg-slate-700 text-white rounded font-semibold hover:bg-slate-600 transition-colors text-center block"
            >
              Buy Season Pass
            </a>
          </div>
        </div>

        {/* Annual Plan */}
        <div className="max-w-md mx-auto mb-12">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Annual Pass</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">$199.99</span>
              <span className="text-slate-400 block text-sm">one-time payment</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">12 months Pro access</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>All Pro features</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Save $135/year vs monthly</span>
              </li>
            </ul>
            <a
              href="https://buy.stripe.com/7sY8wP1Fd7e75Ug4I3"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAnnualPass}
              className="w-full py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors text-center block"
            >
              Buy Annual Pass
            </a>
          </div>
        </div>

        {/* Info */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            All plans include unlimited grant matches, state-specific + federal opportunities, and priority support.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>

      {/* Subscription Success Modal */}
      <SubscriptionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userEmail={userEmail}
      />
    </div>
  );
}
