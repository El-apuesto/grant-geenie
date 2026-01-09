import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, ClipboardList, Calendar as CalendarIcon, FileText, Building2, BarChart3, Briefcase, LogOut, Crown } from 'lucide-react';
import DashboardHome from './DashboardHome';
import GrantPool from './GrantPool';
import ApplicationTracker from './ApplicationTracker';
import CalendarPage from './CalendarPage';
import LOIGenerator from './LOIGenerator';
import TemplatesPage from './TemplatesPage';
import FiscalSponsors from './FiscalSponsors';
import Analytics from './AnalyticsPage';
import AgencyTools from './AgencyTools';
import PricingPage from './PricingPage';
import { Profile } from '../types';

type ViewType = 'home' | 'grants' | 'pool' | 'tracker' | 'calendar' | 'loi' | 'templates' | 'fiscal' | 'analytics' | 'agency' | 'pricing';

export default function DashboardContainer() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setIsPro(profileData.subscription_tier === 'pro');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'home' as ViewType, label: 'Home', icon: Home, proOnly: false },
    { id: 'grants' as ViewType, label: 'Find Grants', icon: Search, proOnly: false },
    { id: 'tracker' as ViewType, label: 'Applications', icon: ClipboardList, proOnly: true },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: CalendarIcon, proOnly: true },
    { id: 'loi' as ViewType, label: 'LOI Generator', icon: FileText, proOnly: true },
    { id: 'templates' as ViewType, label: 'Templates', icon: FileText, proOnly: true },
    { id: 'fiscal' as ViewType, label: 'Fiscal Sponsors', icon: Building2, proOnly: true },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3, proOnly: true },
    { id: 'agency' as ViewType, label: 'Agency Tools', icon: Briefcase, proOnly: false },
  ];

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <DashboardHome isPro={isPro} onNavigate={handleNavigate} />;
      case 'grants':
      case 'pool':
        return <GrantPool isPro={isPro} profile={profile} />;
      case 'tracker':
        return <ApplicationTracker isPro={isPro} />;
      case 'calendar':
        return <CalendarPage />;
      case 'loi':
        return <LOIGenerator isPro={isPro} />;
      case 'templates':
        return <TemplatesPage isPro={isPro} />;
      case 'fiscal':
        return <FiscalSponsors isPro={isPro} />;
      case 'analytics':
        return <Analytics />;
      case 'agency':
        return <AgencyTools isPro={isPro} />;
      case 'pricing':
        return <PricingPage />;
      default:
        return <DashboardHome isPro={isPro} onNavigate={handleNavigate} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800/50 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">Grant Geenie</h1>
          {isPro && (
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
              <Crown className="w-4 h-4" />
              <span>Pro Member</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isLocked = item.proOnly && !isPro;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => !isLocked && setCurrentView(item.id)}
                disabled={isLocked}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : isLocked
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isLocked && <Crown className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {!isPro && (
            <button
              onClick={() => setCurrentView('pricing')}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
}