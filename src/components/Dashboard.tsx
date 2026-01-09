import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, Search, BarChart3, FileText, Building2, Calendar as CalendarIcon, ClipboardList, Settings as SettingsIcon, LogOut, Crown, Menu, X, Briefcase } from 'lucide-react';
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
import Sidebar from './Sidebar';
import ShadowProfileGenerator from './ShadowProfileGenerator'; // Import Agency Tool
import { useTour } from '../hooks/useTour';
import { getStateName } from '../lib/states';

interface Profile {
  id: string;
  state: string;
  organization_type: string;
  questionnaire_completed: boolean;
  subscription_status: string | null;
}

interface DashboardProps {
  onGoHome?: () => void;
}

type ViewType = 'home' | 'grants' | 'tracker' | 'calendar' | 'loi' | 'fiscal' | 'templates' | 'analytics' | 'settings' | 'pricing' | 'agency';

export default function Dashboard({ onGoHome }: DashboardProps) {
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
      if (onGoHome) onGoHome();
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

    // Agency Tools View
    if (currentView === 'agency') {
        return (
            <div className="space-y-6">
                <ShadowProfileGenerator onProfileGenerated={(shadowProfile) => {
                    alert("Shadow Profile Created! Go to LOI Generator and enable 'Agency Mode' to use these details.");
                }} />
            </div>
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

    const lockedViews = ['tracker', 'calendar', 'loi', 'fiscal', 'templates', 'analytics'];
    if (!isPro && lockedViews.includes(currentView)) {
         return (
        <div className="p-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <Crown className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Pro Feature</h3>
            <p className="text-slate-400 mb-6">
              This feature is available exclusively to Pro subscribers.
            </p>
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
      <Sidebar
        isPro={isPro}
        onNavigate={(view) => setCurrentView(view as any)}
        onSignOut={handleSignOut}
        onStartTour={startTour}
        onGoHome={onGoHome || (() => {})}
        profile={profile}
        currentView={currentView}
      />

      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-16 lg:ml-0">
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderView()}
        </div>
      </main>

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