import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, ClipboardList, Calendar as CalendarIcon, FileText, Building2, BarChart3, Briefcase, LogOut, Crown, Menu, X, Settings as SettingsIcon } from 'lucide-react';
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
import Settings from './Settings';
import ProductTour from './ProductTour';
import { Profile } from '../types';

type ViewType = 'home' | 'grants' | 'pool' | 'tracker' | 'calendar' | 'loi' | 'templates' | 'fiscal' | 'analytics' | 'agency' | 'pricing' | 'settings';

export default function DashboardContainer() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

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
        const newIsPro = profileData.subscription_tier === 'pro' || profileData.subscription_tier === 'enterprise';
        const newIsEnterprise = profileData.subscription_tier === 'enterprise';
        
        // Log subscription status on load
        console.log('Profile loaded:', { 
          tier: profileData.subscription_tier,
          status: profileData.subscription_status,
          isPro: newIsPro,
          isEnterprise: newIsEnterprise
        });
        
        setIsPro(newIsPro);
        setIsEnterprise(newIsEnterprise);
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
    { id: 'home' as ViewType, label: 'Home', icon: Home, proOnly: false, enterpriseOnly: false, isLink: true, href: '/' },
    { id: 'grants' as ViewType, label: 'Find Grants', icon: Search, proOnly: false, enterpriseOnly: false },
    { id: 'tracker' as ViewType, label: 'Applications', icon: ClipboardList, proOnly: true, enterpriseOnly: false },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: CalendarIcon, proOnly: true, enterpriseOnly: false },
    { id: 'loi' as ViewType, label: 'LOI Generator', icon: FileText, proOnly: true, enterpriseOnly: false },
    { id: 'templates' as ViewType, label: 'Templates', icon: FileText, proOnly: true, enterpriseOnly: false },
    { id: 'fiscal' as ViewType, label: 'Fiscal Sponsors', icon: Building2, proOnly: true, enterpriseOnly: false },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3, proOnly: true, enterpriseOnly: false },
    { id: 'agency' as ViewType, label: 'Agency Tools', icon: Briefcase, proOnly: false, enterpriseOnly: true },
    { id: 'settings' as ViewType, label: 'Settings', icon: SettingsIcon, proOnly: false, enterpriseOnly: false },
  ];

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
    setSidebarOpen(false); // Close sidebar on navigation (mobile)
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
        return <AgencyTools isPro={isEnterprise} />;
      case 'pricing':
        return <PricingPage />;
      case 'settings':
        return <Settings onBack={() => handleNavigate('home')} onRestartTour={() => setShowTour(true)} />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex relative">
      {showTour && (
        <ProductTour 
          isActive={showTour} 
          onComplete={() => setShowTour(false)} 
          onSkip={() => setShowTour(false)} 
        />
      )}
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-800/95 backdrop-blur-sm lg:bg-slate-800/50 
        border-r border-slate-700 
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Close Button */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Grant Geenie</h1>
            {isEnterprise ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-purple-400">
                <Crown className="w-4 h-4" />
                <span>Enterprise</span>
              </div>
            ) : isPro ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                <Crown className="w-4 h-4" />
                <span>Pro Member</span>
              </div>
            ) : null}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items - Scrollable if needed */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isLocked = (item.proOnly && !isPro) || (item.enterpriseOnly && !isEnterprise);
            const isActive = currentView === item.id;

            // Special handling for Home link
            if (item.isLink) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all text-sm font-medium"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => !isLocked && handleNavigate(item.id)}
                disabled={isLocked}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium
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
                <span>{item.label}</span>
                {isLocked && (
                  <div className="ml-auto flex items-center gap-1">
                    {item.enterpriseOnly ? (
                      <span className="text-[10px] bg-purple-600/20 text-purple-400 px-1.5 py-0.5 rounded">ENT</span>
                    ) : (
                      <Crown className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions - Fixed at bottom */}
        <div className="p-4 border-t border-slate-700 space-y-2 bg-slate-800/50">
          {!isPro && (
            <button
              onClick={() => handleNavigate('pricing')}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
          )}
          {isPro && !isEnterprise && (
            <button
              onClick={() => alert('Contact sales@granthustle.com for Enterprise access')}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Enterprise
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-slate-800/50 border-b border-slate-700 p-4 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Grant Geenie</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {renderView()}
          </div>
        </div>
      </div>
    </div>
  );
}