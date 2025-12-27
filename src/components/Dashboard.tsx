import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, Search, BarChart3, FileText, Building2, Calendar as CalendarIcon, ClipboardList, Settings as SettingsIcon, LogOut, Crown, Menu, X } from 'lucide-react';
import DashboardHome from './DashboardHome';
import GrantPool from './GrantPool';
import ApplicationTracker from './ApplicationTracker';
import CalendarPage from './CalendarPage';
import LOIGenerator from './LOIGenerator';
import FiscalSponsorsPage from './FiscalSponsorsPage';
import ApplicationWizard from './ApplicationWizard';
import AnalyticsPage from './AnalyticsPage';
import Settings from './Settings';
import Questionnaire from './Questionnaire';
import PricingPage from './PricingPage';
import ProductTour from './ProductTour';
import { useTour } from '../hooks/useTour';
import { getStateName } from '../lib/states';

interface Profile {
  id: string;
  state: string;
  organization_type: string;
  questionnaire_completed: boolean;
  subscription_status: string | null;
}

type ViewType = 'home' | 'grants' | 'tracker' | 'calendar' | 'loi' | 'fiscal' | 'templates' | 'analytics' | 'settings' | 'pricing';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const { isTourActive, startTour, completeTour, skipTour } = useTour();

  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (err) throw err;
        if (data) {
          setProfile(data);
          if (!data.state || !data.organization_type) {
            setShowQuestionnaire(true);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleQuestionnaireComplete = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
      setShowQuestionnaire(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const handleUpgrade = () => {
    setCurrentView('pricing');
    setSidebarOpen(false);
  };

  const handleRestartTour = () => {
    setCurrentView('home');
    startTour();
  };

  const handleRetakeQuestionnaire = () => {
    setCurrentView('home');
    setShowQuestionnaire(true);
  };

  const isPro = profile?.subscription_status === 'active';
  const hasCompletedQuestionnaire = profile?.state && profile?.organization_type;

  if (showQuestionnaire) {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { id: 'home' as ViewType, label: 'Home', icon: Home, prOnly: false },
    { id: 'grants' as ViewType, label: 'Find Grants', icon: Search, prOnly: false },
    { id: 'tracker' as ViewType, label: 'Application Tracker', icon: ClipboardList, prOnly: true },
    { id: 'calendar' as ViewType, label: 'Calendar', icon: CalendarIcon, prOnly: true },
    { id: 'loi' as ViewType, label: 'LOI Generator', icon: FileText, prOnly: true },
    { id: 'fiscal' as ViewType, label: 'Fiscal Sponsors', icon: Building2, prOnly: true },
    { id: 'templates' as ViewType, label: 'Templates', icon: FileText, prOnly: true },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3, prOnly: true },
  ];

  const renderView = () => {
    if (currentView === 'pricing') {
      return <PricingPage />;
    }

    if (currentView === 'settings') {
      return (
        <Settings
          onBack={() => setCurrentView('home')}
          onRestartTour={handleRestartTour}
          onRetakeQuestionnaire={handleRetakeQuestionnaire}
        />
      );
    }

    if (!hasCompletedQuestionnaire) {
      return (
        <div className="p-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Complete Your Profile</h3>
            <p className="text-slate-400 mb-6">
              Please complete the questionnaire to get personalized grant recommendations.
            </p>
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
            >
              Start Questionnaire
            </button>
          </div>
        </div>
      );
    }

    // Show upgrade prompt for pro-only features
    const currentNavItem = navItems.find(item => item.id === currentView);
    if (!isPro && currentNavItem?.prOnly) {
      return (
        <div className="p-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <Crown className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Pro Feature</h3>
            <p className="text-slate-400 mb-6">
              {currentNavItem.label} is available exclusively to Pro subscribers.
            </p>
            <ul className="text-slate-300 space-y-2 mb-6 text-left max-w-md mx-auto">
              <li>• <strong>Unlimited grants</strong> with full details</li>
              <li>• Application tracking & pipeline</li>
              <li>• LOI Generator with auto-fill</li>
              <li>• 265+ Fiscal Sponsor database</li>
              <li>• Professional templates</li>
              <li>• Deadline calendar</li>
              <li>• Analytics & insights</li>
            </ul>
            <button
              onClick={handleUpgrade}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition text-lg"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return <DashboardHome isPro={isPro} onNavigate={(view) => setCurrentView(view as ViewType)} />;
      case 'grants':
        return <GrantPool isPro={isPro} profile={profile} />;
      case 'tracker':
        return <ApplicationTracker isPro={isPro} />;
      case 'calendar':
        return <CalendarPage onBack={() => setCurrentView('home')} />;
      case 'loi':
        return <LOIGenerator isPro={isPro} />;
      case 'fiscal':
        return <FiscalSponsorsPage onBack={() => setCurrentView('home')} />;
      case 'templates':
        return <ApplicationWizard isPro={isPro} />;
      case 'analytics':
        return <AnalyticsPage />;
      default:
        return <DashboardHome isPro={isPro} onNavigate={(view) => setCurrentView(view as ViewType)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900/50 border-r border-slate-700">
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src="/Logo.png.PNG" 
              alt="Grant Geenie Logo" 
              className="h-10 w-auto"
            />
          </div>
          {isPro ? (
            <span className="flex items-center gap-1 text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded w-fit">
              <Crown className="w-3 h-3" />
              Pro
            </span>
          ) : (
            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded w-fit">
              Free Tier
            </span>
          )}
          {hasCompletedQuestionnaire && profile && (
            <p className="text-slate-400 text-xs mt-2">
              {getStateName(profile.state)} • {profile.organization_type}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isLocked = !isPro && item.prOnly;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : isLocked
                        ? 'text-slate-500 hover:bg-slate-800/50 cursor-not-allowed'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                    disabled={isLocked}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isLocked && <Crown className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {isPro && (
            <button
              onClick={() => setCurrentView('settings')}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition"
            >
              <SettingsIcon className="w-5 h-5" />
              <span>Settings</span>
            </button>
          )}
          {isPro && (
            <button
              onClick={startTour}
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition"
              title="Summon the Genie for help"
            >
              <img src="/genie.png.PNG" alt="Genie" className="w-5 h-5 object-contain" />
              <span>Help Tour</span>
            </button>
          )}
          {!isPro && (
            <button
              onClick={handleUpgrade}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="w-64 h-full bg-slate-900 border-r border-slate-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <img 
                  src="/Logo.png.PNG" 
                  alt="Grant Geenie Logo" 
                  className="h-8 w-auto mb-2"
                />
                {isPro ? (
                  <span className="flex items-center gap-1 text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded w-fit">
                    <Crown className="w-3 h-3" />
                    Pro
                  </span>
                ) : (
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded w-fit">
                    Free Tier
                  </span>
                )}
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  const isLocked = !isPro && item.prOnly;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setCurrentView(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : isLocked
                            ? 'text-slate-500 hover:bg-slate-800/50 cursor-not-allowed'
                            : 'text-slate-300 hover:bg-slate-800/50'
                        }`}
                        disabled={isLocked}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isLocked && <Crown className="w-4 h-4" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="p-4 border-t border-slate-700 space-y-2">
              {isPro && (
                <button
                  onClick={() => {
                    setCurrentView('settings');
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition"
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              )}
              {isPro && (
                <button
                  onClick={() => {
                    startTour();
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition"
                >
                  <img src="/genie.png.PNG" alt="Genie" className="w-5 h-5 object-contain" />
                  <span>Help Tour</span>
                </button>
              )}
              {!isPro && (
                <button
                  onClick={handleUpgrade}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800/50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img 
              src="/Logo.png.PNG" 
              alt="Grant Geenie" 
              className="h-8 w-auto"
            />
            {isPro && (
              <button
                onClick={startTour}
                className="p-2 text-emerald-400 hover:text-emerald-300"
              >
                <img src="/genie.png.PNG" alt="Genie" className="w-6 h-6 object-contain" />
              </button>
            )}
            {!isPro && <div className="w-10" />}
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>

      {/* Product Tour */}
      {isPro && isTourActive && (
        <ProductTour
          isActive={isTourActive}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
    </div>
  );
}