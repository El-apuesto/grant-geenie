import { useState } from 'react';
import { Menu, X, Home, ClipboardList, Calendar, FileText, Building2, Settings as SettingsIcon, LogOut, BarChart3 } from 'lucide-react';
import { Profile } from '../types';
import { getStateName } from '../lib/states';

interface SidebarProps {
  isPro: boolean;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  onStartTour: () => void;
  profile: Profile | null;
  currentView: string;
}

export default function Sidebar({ isPro, onNavigate, onSignOut, onStartTour, profile, currentView }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', view: 'dashboard', icon: Home, prOnly: false },
    { name: 'Application Tracker', view: 'tracker', icon: ClipboardList, prOnly: true },
    { name: 'Calendar', view: 'calendar', icon: Calendar, prOnly: true },
    { name: 'LOI Generator', view: 'loi', icon: FileText, prOnly: true },
    { name: 'Templates', view: 'templates', icon: FileText, prOnly: true },
    { name: 'Fiscal Sponsors', view: 'fiscalSponsors', icon: Building2, prOnly: true },
    { name: 'Analytics', view: 'analytics', icon: BarChart3, prOnly: true },
  ];

  const handleNavigate = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const isActive = (view: string) => currentView === view;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 shadow-lg border border-slate-700"
      >
        {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-slate-900 shadow-xl z-40 border-r border-slate-700
          w-64 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <video
              src="/copy_5652D782-A5FB-43F0-A6C6-DCB56BB35546 2.webm"
              autoPlay
              loop
              muted
              playsInline
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold text-white">Grant Geenie</h2>
              {!isPro && (
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Free Tier</span>
              )}
              {isPro && (
                <span className="text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">Pro</span>
              )}
            </div>
          </div>
          {profile && profile.state && profile.org_type && (
            <p className="text-slate-400 text-xs">
              {getStateName(profile.state)} • {profile.org_type}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.view);
            const locked = item.prOnly && !isPro;
            
            return (
              <button
                key={item.name}
                onClick={() => !locked && handleNavigate(item.view)}
                disabled={locked}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-200 text-left text-sm
                  ${active
                    ? 'bg-emerald-600 text-white'
                    : locked
                    ? 'text-slate-500 cursor-not-allowed opacity-50'
                    : 'text-slate-300 hover:bg-slate-800'
                  }
                `}
              >
                <Icon size={18} />
                <span className="font-medium">{item.name}</span>
                {locked && (
                  <span className="ml-auto text-xs bg-slate-700 px-1.5 py-0.5 rounded">Pro</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-900">
          {isPro && (
            <button
              onClick={onStartTour}
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-300 hover:bg-slate-800 transition-colors text-sm"
              title="Product Tour"
            >
              <span className="text-2xl">🪔</span>
              <span className="font-medium">Product Tour</span>
            </button>
          )}
          {isPro && (
            <button
              onClick={() => handleNavigate('settings')}
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-300 hover:bg-slate-800 transition-colors text-sm border-t border-slate-700"
            >
              <SettingsIcon size={18} />
              <span className="font-medium">Settings</span>
            </button>
          )}
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-6 py-3 text-slate-300 hover:bg-slate-800 transition-colors text-sm border-t border-slate-700"
          >
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
          {!isPro && (
            <div className="p-4 bg-slate-800/50">
              <button
                onClick={() => window.open('https://buy.stripe.com/test_4gw5lmdQa3S42NW4gi', '_blank')}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold text-sm"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spacer for desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  );
}