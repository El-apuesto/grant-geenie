import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import { analytics } from './lib/analytics';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Questionnaire from './components/Questionnaire';
import DashboardContainer from './components/DashboardContainer';
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

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') {
        // We'll let the user/loading effect handle the auth check
        setAppState('dashboard');
      } else if (path === '/') {
        setAppState('landing');
      } else if (path === '/billing/success') {
        setAppState('billing-success');
      } else if (path === '/billing/cancel') {
        setAppState('billing-cancel');
      } else if (path === '/terms') {
        setAppState('terms');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track page views when appState changes
  useEffect(() => {
    const path = window.location.pathname;
    const title = PAGE_TITLES[appState] || 'Grant Geenie';
    analytics.trackPageView({ path, title });
    
    // Update document title
    document.title = title;
  }, [appState]);

  // Initial Routing Logic & Auth Protection
  useEffect(() => {
    if (loading) return;

    const path = window.location.pathname;

    // Public Routes
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

    // Dashboard Route - Protected
    if (path === '/dashboard') {
      if (user) {
        checkQuestionnaireStatus();
      } else {
        // If trying to access dashboard while logged out, redirect to landing (or auth)
        setAppState('landing');
        window.history.replaceState(null, '', '/');
      }
      return;
    }

    // Landing Route (/)
    if (path === '/' || path === '') {
      // Even if logged in, we allow staying on landing page now
      setAppState('landing');
      return;
    }

    // Default fallback
    setAppState('landing');

  }, [user, loading]);

  const checkQuestionnaireStatus = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (data?.onboarding_completed) {
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
    if (user) {
      setAppState('dashboard');
      window.history.pushState(null, '', '/dashboard');
    } else {
      setAppState('auth');
    }
  };

  const handleGoHome = () => {
    setAppState('landing');
    window.history.pushState(null, '', '/');
  };

  const handleAuthSuccess = () => {
    analytics.trackAuth('login');
    // On success, go to dashboard
    setAppState('dashboard');
    window.history.pushState(null, '', '/dashboard');
    checkQuestionnaireStatus();
  };

  const handleQuestionnaireComplete = () => {
    analytics.trackQuestionnaireComplete();
    setQuestionnaireCompleted(true);
    setAppState('dashboard');
    window.history.pushState(null, '', '/dashboard');
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
    return <DashboardContainer />;
  }

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}