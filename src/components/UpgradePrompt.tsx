import { Zap, X } from 'lucide-react';

interface UpgradePromptProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export default function UpgradePrompt({ onClose, onUpgrade }: UpgradePromptProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 border-2 border-emerald-500/50 rounded-lg shadow-2xl max-w-md w-full p-6 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            You've Reached Your Free Limit
          </h2>

          {/* Content */}
          <div className="space-y-4 text-slate-300 mb-6">
            <p className="text-center">
              You've viewed <strong className="text-white">5 grant matches</strong> this month on the Free tier.
            </p>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-sm font-semibold text-emerald-100 mb-2">
                Upgrade to Pro to get:
              </p>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Unlimited grant matches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Track applications and deadlines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Access to templates library</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-center text-slate-400">
              Starting at just <strong className="text-emerald-400">$9.99</strong> for your first month
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              Maybe Later
            </button>
            <button
              onClick={onUpgrade}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
