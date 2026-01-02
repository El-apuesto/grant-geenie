import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { analytics } from './lib/analytics';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Questionnaire from './components/Questionnaire';
import Dashboard from './components/Dashboard';
import BillingSuccess from './components/BillingSuccess';
import BillingCancel from './components/BillingCancel';
import TermsOfService from './pages/TermsOfService';

type AppState = 'landing' | 'auth' | 'questionnaire' | 'dashboard' | 'billing-success' | 'billing-cancel' | 'terms';

const PAGE_TITLES: Record<AppState, string> = {
  'landing': 'Grant Geenie - Find Perfect Grants',
  'auth': 'Sign In - Grant Geenie',
  'questionnaire': 'Setup - Grant Geenie',
  'dashboard': 'Dashboard - Grant Geenie',
  'billing-success': 'Payment Success - Grant Geenie',
  'billing-cancel': 'Payment Cancelled - Grant Geenie',
  'terms': 'Terms of Service - Grant Geenie',
};

function AppContent() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>('landing');
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);

  // Initialize analytics on mount
  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      analytics.initGA4(gaId);
    }
  }, []);

  // Track page views when appState changes
  useEffect(() => {
    const path = window.location.pathname;
    const title = PAGE_TITLES[appState] || 'Grant Geenie';
    analytics.trackPageView({ path, title });
  }, [appState]);

  useEffect(() => {
    if (loading) return;

    // Check URL for routes
    const path = window.location.pathname;
    if (path === '/billing/success') {
      setAppState('billing-success');
      return;
    }
    if (path === '/billing/cancel') {
      setAppState('billing-cancel');
      return;
    }
    if (path === '/terms') {
      setAppState('terms');
      return;
    }

    if (!user) {
      setAppState('landing');
      return;
    }

    checkQuestionnaireStatus();
  }, [user, loading]);

  const checkQuestionnaireStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('questionnaire_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.questionnaire_completed) {
        setQuestionnaireCompleted(true);
        setAppState('dashboard');
      } else {
        setQuestionnaireCompleted(false);
        setAppState('questionnaire');
      }
    } catch (err) {
      console.error('Error checking questionnaire status:', err);
    }
  };

  const handleGetStarted = () => {
    setAppState('auth');
  };

  const handleAuthSuccess = () => {
    analytics.trackAuth('login');
    checkQuestionnaireStatus();
  };

  const handleQuestionnaireComplete = () => {
    analytics.trackQuestionnaireComplete();
    setQuestionnaireCompleted(true);
    setAppState('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (appState === 'terms') {
    return <TermsOfService />;
  }

  if (appState === 'billing-success') {
    return <BillingSuccess />;
  }

  if (appState === 'billing-cancel') {
    return <BillingCancel />;
  }

  if (appState === 'landing') {
    return <Landing onGetStarted={handleGetStarted} />;
  }

  if (appState === 'auth') {
    return <Auth onSuccess={handleAuthSuccess} />
  }

  if (appState === 'questionnaire') {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
  }

  if (appState === 'dashboard') {
    return <Dashboard />;
  }

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}