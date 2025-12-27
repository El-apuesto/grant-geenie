import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* NAVIGATION */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/Logo.png.PNG" 
              alt="Grant Geenie Logo" 
              className="h-10 w-auto"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onGetStarted}
              className="px-6 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Get Started Free
            </button>
          </div>
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

        {/* MAIN CTA BUTTON */}
        <button
          onClick={onGetStarted}
          className="px-12 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xl rounded-2xl shadow-2xl transition transform hover:scale-105 mb-4"
        >
          Start Finding Grants (Free)
        </button>

        <p className="text-slate-400 mt-6 text-lg">
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
          <div className="flex justify-center mb-4">
            <img 
              src="/Logo.png.PNG" 
              alt="Grant Geenie" 
              className="h-8 w-auto opacity-50"
            />
          </div>
          <p className="mb-2">Grant Geenie - Find the grants you deserve.</p>
          <p>No nonsense, no spam, just real opportunities.</p>
        </div>
      </footer>
    </div>
  );
}