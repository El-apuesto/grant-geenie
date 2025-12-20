import { useState } from 'react';
import { DollarSign, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LandingProps {
  onGetStarted: () => void;
  onPricing: () => void;
}

export default function Landing({ onGetStarted, onPricing }: LandingProps) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleUpgradeClick = () => {
    if (user) {
      // User is logged in, go to pricing
      onPricing();
    } else {
      // User not logged in, show modal
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Sign In to Upgrade</h2>
            <p className="text-slate-300 mb-6">
              Create a free account to access Pro features and start finding grants.
            </p>
            <button
              onClick={() => {
                setShowLoginModal(false);
                onGetStarted();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
            >
              Sign In / Create Account
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-white">Grant Geenie</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Find Grants That Want<br />
          <span className="text-emerald-500">to Give You Money</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
          Stop searching grant databases forever. We match you with real opportunities for your nonprofit, business, or creative project.
        </p>

        {/* FREE TIER BUTTON */}
        <button
          onClick={onGetStarted}
          className="px-10 py-5 bg-white text-emerald-700 text-2xl rounded-xl font-bold hover:bg-gray-100 transition mb-6"
        >
          Find My Grants (Free)
        </button>

        {/* SUBSCRIBE BUTTON */}
        <button
          onClick={handleUpgradeClick}
          className="block mx-auto px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xl rounded-2xl shadow-2xl transition transform hover:scale-105 mb-4"
        >
          Upgrade Now – $9.99 first month<br />
          <span className="text-lg">then $27.99/month (cancel anytime)</span>
        </button>

        <p className="text-slate-400 mt-8 text-lg">
          Free tier: 5 matches/month · No credit card required
        </p>
      </div>

      {/* FEATURES */}
      <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-3 gap-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-3">Smart Matching</h3>
          <p className="text-slate-300">Answer a questionnaire, get matched with grants that fit your profile.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-3">Local + Federal</h3>
          <p className="text-slate-300">Access state-specific grants plus all federal opportunities.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-3">Real Opportunities</h3>
          <p className="text-slate-300">Verified grant listings from government and foundation sources.</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-32">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          <p className="mb-2">Grant Geenie - Find the grants you deserve.</p>
          <p>No nonsense, no spam, just real opportunities.</p>
        </div>
      </footer>
    </div>
  );
}