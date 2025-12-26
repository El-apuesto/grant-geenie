import { Check } from 'lucide-react';
import UpgradeButton from './UpgradeButton';

interface PricingPageProps {
  onSelectPlan: (plan: 'monthly' | 'season' | 'annual') => void;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  // Live Stripe Price IDs
  const STRIPE_PRICE_IDS = {
    monthly: 'price_1Sa8yzG85r4wkmwW8CGlyij4',    // $9.99 intro, renews at $79.99
    season: 'price_1Sa918G85r4wkmwW786cBMaH',    // $27.99 (4-month season pass)
    annual: 'price_1Sa9BPG85r4wkmwWd0BQE2vz'     // $149.99 year 1, $249.99 year 2+
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Pro Plan
          </h1>
          <p className="text-xl text-slate-400">
            All plans unlock full Pro access to Grant Geenie
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">$0</span>
              <span className="text-slate-400">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>5 grant matches per month</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Basic grant search</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Community support</span>
              </li>
            </ul>
            <button
              onClick={() => onSelectPlan('monthly')}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              Current Plan
            </button>
          </div>

          {/* Monthly - Intro Offer */}
          <div className="bg-slate-800/50 border-2 border-emerald-500 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Best Value
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Monthly (Pro)</h3>
            <div className="mb-4">
              <div>
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <div className="text-sm text-emerald-400 mt-2">First month only</div>
              <div className="text-sm text-slate-400 mt-1">Renews at $79.99/month</div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Unlimited grant matches</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Application tracker</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>LOI Generator</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Fiscal Sponsors database</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Calendar & deadlines</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <UpgradeButton priceId={STRIPE_PRICE_IDS.monthly}>
              Subscribe Now
            </UpgradeButton>
          </div>

          {/* Season Pass - 4 Months */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Season Pass (Pro)</h3>
            <div className="mb-4">
              <div>
                <span className="text-4xl font-bold text-white">$27.99</span>
                <span className="text-slate-400">/4 months</span>
              </div>
              <div className="text-sm text-slate-400 mt-2">One-time charge</div>
              <div className="text-sm text-emerald-400 mt-1">~$7/month</div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Unlimited grant matches</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Application tracker</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>LOI Generator</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Fiscal Sponsors database</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Calendar & deadlines</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <UpgradeButton priceId={STRIPE_PRICE_IDS.season}>
              Subscribe Now
            </UpgradeButton>
          </div>

          {/* Annual */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 md:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-2">Annual (Pro)</h3>
            <div className="mb-4">
              <div>
                <span className="text-4xl font-bold text-white">$149.99</span>
                <span className="text-slate-400">/year</span>
              </div>
              <div className="text-sm text-emerald-400 mt-2">Year 1</div>
              <div className="text-sm text-slate-400 mt-1">Renews at $249.99/year</div>
              <div className="text-sm text-slate-400 mt-1">Or switch to $27.99/month</div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Unlimited grant matches</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Application tracker</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>LOI Generator</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Fiscal Sponsors database</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Calendar & deadlines</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>
            <UpgradeButton priceId={STRIPE_PRICE_IDS.annual}>
              Subscribe Now
            </UpgradeButton>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-slate-400 text-sm">
          <p>All plans include full Pro access and 30-day money-back guarantee</p>
          <p className="mt-2">Cancel anytime, no questions asked</p>
        </div>
      </div>
    </div>
  );
}