import { Check } from 'lucide-react';
import UpgradeButton from './UpgradeButton';

export default function PricingPage() {
  // Live Stripe Price IDs - THREE SEPARATE RECURRING SUBSCRIPTIONS
  const STRIPE_PRICE_IDS = {
    monthly: 'price_1Sa918G85r4wkmwW786cBMaH',     // $27.99/month recurring
    season: 'price_1Sa9BPG85r4wkmwWd0BQE2vz',      // $79.99 / 4 months recurring
    annual: 'price_1Sa9CtG85r4wkmwWNVjMLlVy',      // $149.99 / year recurring
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose Your Pro Plan</h1>
          <p className="text-xl text-slate-400">All plans unlock full Pro access to Grant Geenie</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
              disabled
            >
              Current Plan
            </button>
          </div>

          {/* Monthly - Best Value */}
          <div className="bg-slate-800/50 border-2 border-emerald-500 rounded-lg p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Best Value
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Monthly (Pro)</h3>
            <div className="mb-4">
              <div>
                <span className="text-4xl font-bold text-white">$27.99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <div className="text-sm text-emerald-400 font-semibold mt-2">
                Use code FIRSTMONTH for $9.99 first month.
              </div>
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
                <span className="text-4xl font-bold text-white">$79.99</span>
                <span className="text-slate-400">/4 months</span>
              </div>
              <div className="text-sm text-emerald-400 mt-2">~$20/month • Use code FIRSTMONTH</div>
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
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Annual (Pro)</h3>
            <div className="mb-4">
              <div>
                <span className="text-4xl font-bold text-white">$149.99</span>
                <span className="text-slate-400">/year</span>
              </div>
              <div className="text-sm text-emerald-400 mt-2">~$12.50/month • Use code FIRSTMONTH</div>
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

          {/* Agency Tools */}
          <div className="bg-slate-800/50 border border-amber-500/40 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Agency Tools</h3>
            <div className="mb-4">
              <div>
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <div className="text-sm text-amber-300 mt-2">Invite-only. Enabled manually.</div>
            </div>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
                <span>Multi-client management</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
                <span>Advanced search & filtering</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <Check className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
                <span>White-label options</span>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <span className="w-5 h-5 flex-shrink-0" />
                <span>Contact us for pricing</span>
              </li>
            </ul>
            <button
              type="button"
              disabled
              className="w-full py-3 rounded-lg font-semibold text-slate-900 bg-amber-400 transition shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/40 opacity-60 cursor-not-allowed"
            >
              Coming Soon
            </button>
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
