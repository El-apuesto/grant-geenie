import { useState } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PromoPopup from './PromoPopup';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  const stats = [
    { label: 'Live grant opportunities tracked', value: '79,000+' },
    { label: 'Fiscal sponsors in directory', value: '401' },
    { label: 'States + territories covered', value: '56' },
  ];

  return (
    <div className={darkMode ? 'min-h-screen bg-slate-950 text-slate-50' : 'min-h-screen bg-slate-50 text-slate-900'}>
      {/* PROMO POPUP – should already handle free vs paid internally */}
      <PromoPopup />

      {/* NAVIGATION */}
      <nav className={(darkMode
        ? 'border-b border-slate-800 bg-slate-950/80'
        : 'border-b border-slate-200 bg-white/80') + ' backdrop-blur-sm sticky top-0 z-20'}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png.PNG"
              alt="Grant Geenie Logo"
              className="h-10 w-auto"
            />
            <div className="text-left">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Grant Geenie</p>
              <p className={darkMode ? 'text-xs text-slate-400' : 'text-xs text-slate-500'}>
                79K+ grants · 401 fiscal sponsors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className={
                (darkMode
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200') +
                ' inline-flex items-center gap-2 px-3 py-2 text-xs rounded-full border border-slate-600/40 transition-colors'
              }
            >
              {darkMode ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              <span>{darkMode ? 'Light' : 'Dark'} mode</span>
            </button>

            <button
              onClick={onGetStarted}
              className={
                (darkMode
                  ? 'text-slate-200 hover:text-white'
                  : 'text-slate-700 hover:text-slate-900') + ' px-4 py-2 text-sm font-medium transition-colors'
              }
            >
              {user ? 'Open app' : 'Sign in'}
            </button>
            <button
              onClick={onGetStarted}
              className="px-5 py-2 bg-emerald-600 text-white text-sm rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* DESKTOP SPLIT HERO */}
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-stretch">
        {/* Left: Copy + CTA */}
        <section className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-xs font-medium text-emerald-300 mb-5 w-fit">
            <Sparkles className="w-3 h-3" />
            <span>AI-assisted grant discovery for real humans</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            Stop doom‑scrolling<br className="hidden sm:block" />
            <span className="text-emerald-500">grant databases.</span>
          </h1>

          <p className={
            (darkMode ? 'text-slate-300' : 'text-slate-600') +
            ' text-lg sm:text-xl leading-relaxed max-w-xl mb-6'
          }>
            Grant Geenie cross‑references your profile against 79,000+ live opportunities and
            401 fiscal sponsors, then surfaces the ones that actually fit you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
            <button
              onClick={onGetStarted}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xl shadow-emerald-600/30 text-base sm:text-lg"
            >
              Start Matching Me (Free)
            </button>
            <p className={(darkMode ? 'text-slate-400' : 'text-slate-500') + ' text-sm'}>
              Free tier: 5 matched grants / month · No card required
            </p>
          </div>

          {/* Stats */}
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mt-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className={
                  (darkMode
                    ? 'bg-slate-900/70 border-slate-700'
                    : 'bg-white border-slate-200') +
                  ' rounded-xl border p-4 text-left'
                }
              >
                <dt className={darkMode ? 'text-slate-400 text-xs mb-1' : 'text-slate-500 text-xs mb-1'}>
                  {item.label}
                </dt>
                <dd className="text-xl font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Right: App preview card */}
        <section
          className={
            (darkMode
              ? 'bg-slate-900/80 border-slate-700'
              : 'bg-white border-slate-200 shadow-lg') +
            ' rounded-2xl border p-5 flex flex-col justify-between min-h-[320px]'
          }
        >
          <div className="mb-4">
            <p className={(darkMode ? 'text-slate-300' : 'text-slate-700') + ' text-sm font-medium mb-1'}>
              Your grant inbox
            </p>
            <p className={(darkMode ? 'text-slate-400' : 'text-slate-500') + ' text-xs'}>
              Personalized matches ranked by fit, deadline, and effort.
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <div className={(darkMode ? 'bg-slate-800' : 'bg-slate-100') + ' rounded-xl p-3 flex justify-between items-start gap-3'}>
              <div>
                <p className="font-semibold">NEA Small Grants for Organizations</p>
                <p className={darkMode ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                  Arts & culture · Up to $25,000 · National
                </p>
              </div>
              <span className="px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">
                Best fit
              </span>
            </div>

            <div className={(darkMode ? 'bg-slate-800/80' : 'bg-slate-100') + ' rounded-xl p-3 flex justify-between items-start gap-3'}>
              <div>
                <p className="font-semibold">State Arts Recovery Micro‑grants</p>
                <p className={darkMode ? 'text-slate-400 text-xs' : 'text-slate-600 text-xs'}>
                  Your state · Rolling deadline · $2,500–$10,000
                </p>
              </div>
              <span className="px-2 py-1 rounded-full bg-slate-500/10 text-slate-300 text-[11px]">
                Easy win
              </span>
            </div>

            <div className={(darkMode ? 'bg-slate-900/70 border border-slate-700' : 'bg-slate-50 border border-slate-200') + ' rounded-xl p-3'}>
              <p className={darkMode ? 'text-slate-300 text-xs' : 'text-slate-700 text-xs'}>
                Answer 9 quick questions, we throw out the noise: expired calls, wrong geography,
                wrong entity type, and grants that only want giant 501(c)(3)s.
              </p>
            </div>
          </div>

          <button
            onClick={onGetStarted}
            className="mt-5 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
          >
            See my matches
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className={
        (darkMode ? 'border-t border-slate-800 bg-slate-950/90' : 'border-t border-slate-200 bg-slate-50') +
        ' mt-10'
      }>
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png.PNG"
              alt="Grant Geenie"
              className="h-7 w-auto opacity-60"
            />
            <div>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Grant Geenie — Find the grants you actually qualify for.</p>
              <p className={darkMode ? 'text-slate-600' : 'text-slate-500'}>No spam. No "maybe" grants. Just real matches.</p>
            </div>
          </div>
          <p className={darkMode ? 'text-slate-600' : 'text-slate-500'}>
            Made for small nonprofits, artists, and scrappy founders.
          </p>
        </div>
      </footer>
    </div>
  );
}
