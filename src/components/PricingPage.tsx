import { Crown, Check } from 'lucide-react';

interface PricingPageProps {
  onSelectPlan: (plan: 'free' | 'intro' | 'season' | 'annual') => void;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  const handleUpgrade = (plan: 'intro' | 'season' | 'annual') => {
    // TEST MODE PAYMENT LINK - Replace with your actual links for each plan
    const links = {
      intro: 'https://buy.stripe.com/test_fZu8wP3Nl0PJ4Qc2zV7AI00', // Your test link
      season: 'https://buy.stripe.com/test_fZu8wP3Nl0PJ4Qc2zV7AI00', // Replace when you create seasonal plan
      annual: 'https://buy.stripe.com/test_fZu8wP3Nl0PJ4Qc2zV7AI00'  // Replace when you create annual plan
    };
    window.open(links[plan], '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-slate-300 text-lg">
            Start free, upgrade anytime to unlock unlimited grants and pro features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* FREE TIER */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Free Tier</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $0<span className="text-lg text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>5 grant matches/month</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Your state + federal grants</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span>No grant tracking</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span>No templates</span>
              </li>
            </ul>
            <button
              onClick={() => onSelectPlan('free')}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Current Plan
            </button>
          </div>

          {/* INTRO OFFER */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold">
              BEST VALUE
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro Monthly</h3>
            <div className="text-3xl font-bold text-white mb-1">
              $9.99<span className="text-lg text-emerald-200">/first month</span>
            </div>
            <p className="text-emerald-100 text-sm mb-4">Then $27.99/month</p>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-white">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited matches</strong></span>
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
              onClick={() => handleUpgrade('intro')}
              className="w-full py-3 bg-white hover:bg-gray-100 text-emerald-700 rounded-lg font-bold transition flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Start Trial
            </button>
          </div>

          {/* SEASONAL */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Pro Seasonal</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $79.99<span className="text-lg text-slate-400">/3 months</span>
            </div>
            <p className="text-slate-400 text-sm mb-4">Save 5% vs monthly</p>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>All Pro features</strong></span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>3-month commitment</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Perfect for grant season</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('season')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Get Seasonal
            </button>
          </div>

          {/* ANNUAL */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Pro Annual</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $149.99<span className="text-lg text-slate-400">/year</span>
            </div>
            <p className="text-emerald-400 text-sm mb-4 font-semibold">Save 55% vs monthly!</p>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span><strong>All Pro features</strong></span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Best price per month</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>12 months coverage</span>
              </li>
            </ul>
            <button
              onClick={() => handleUpgrade('annual')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Get Annual
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            All plans include a 7-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
