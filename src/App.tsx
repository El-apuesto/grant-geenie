import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Questionnaire from './components/Questionnaire';
import PricingPage from './components/PricingPage';
import Dashboard from './components/Dashboard';

type AppState = 'landing' | 'auth' | 'questionnaire' | 'pricing' | 'dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>('landing');
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);

  useEffect(() => {
    if (loading) return;

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

  const handlePricing = () => {
    setAppState('pricing');
  };

  const handleAuthSuccess = () => {
    checkQuestionnaireStatus();
  };

  const handleQuestionnaireComplete = () => {
    setQuestionnaireCompleted(true);
    setAppState('dashboard');
  };

  const handleSelectPlan = (plan: string) => {
    console.log('Selected plan:', plan);
    setAppState('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (appState === 'landing') {
    return <Landing onGetStarted={handleGetStarted} onPricing={handlePricing} />;
  }

  if (appState === 'auth') {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  if (appState === 'questionnaire') {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
  }

  if (appState === 'pricing') {
    return <PricingPage onSelectPlan={handleSelectPlan} />;
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
