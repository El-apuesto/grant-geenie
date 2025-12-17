import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { US_STATES } from '../lib/states';
import { sendMatchesEmail } from '../lib/email';

interface QuestionnaireProps {
  onComplete: () => void;
}

const QUESTIONS = [
  {
    id: 'org_type',
    label: 'What type of organization are you?',
    options: ['Nonprofit', 'Small Business', 'Freelancer/Solo', 'Artist/Creator', 'Other'],
  },
  {
    id: 'focus_area',
    label: 'What\'s your primary focus area?',
    options: ['Arts & Culture', 'Education', 'Environment', 'Health', 'Technology', 'Community', 'Other'],
  },
  {
    id: 'funding_need',
    label: 'How much funding are you seeking?',
    options: ['Under $10K', '$10K - $50K', '$50K - $100K', '$100K - $500K', '$500K+'],
  },
  {
    id: 'timeline',
    label: 'When do you need the funding?',
    options: ['ASAP (Next 30 days)', 'Soon (1-3 months)', 'Flexible (3+ months)', 'No specific timeline'],
  },
  {
    id: 'experience',
    label: 'Have you received grants before?',
    options: ['No, first time', 'Yes, 1-2 times', 'Yes, 3+ times'],
  },
];

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    org_type: '',
    focus_area: '',
    funding_need: '',
    timeline: '',
    experience: '',
    state: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnswer = (value: string) => {
    const question = QUESTIONS[currentQuestion];
    setAnswers(prev => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleStateChange = (state: string) => {
    setAnswers(prev => ({
      ...prev,
      state,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleComplete = async () => {
    if (!user || !answers.state) {
      setError('Please select a state');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save profile
      await supabase.from('profiles').upsert({
        id: user.id,
        org_type: answers.org_type,
        state: answers.state,
        questionnaire_completed: true,
      });

      // Get user profile for first name and email
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      // Count grant matches for the user's state
      const { count: matchesCount } = await supabase
        .from('grants')
        .select('*', { count: 'exact', head: true })
        .or(`state.eq.${answers.state},state.is.null`);

      // Send matches email with tour invitation
      const firstName = profile?.first_name || 'there';
      const dashboardTourUrl = `${window.location.origin}/dashboard?tour=genie`;

      try {
        await sendMatchesEmail({
          firstName,
          email: user.email!,
          matchesCount: matchesCount || 0,
          dashboardTourUrl,
        });
      } catch (emailError) {
        // Log email error but don't block completion
        console.error('Failed to send matches email:', emailError);
      }

      // Complete questionnaire and navigate to dashboard
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answers');
    } finally {
      setLoading(false);
    }
  };

  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / (QUESTIONS.length + 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-white">Grant Questionnaire</h1>
            <span className="text-slate-400">{currentQuestion + 1} of {QUESTIONS.length + 1}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Question or State Selection */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          {isLastQuestion ? (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">What state are you in?</h2>
              <select
                value={answers.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select your state...</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">{question.label}</h2>
              <div className="space-y-3">
                {question.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition ${
                      answers[question.id] === option
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold rounded-lg transition"
          >
            Back
          </button>
          {isLastQuestion ? (
            <button
              onClick={handleComplete}
              disabled={!answers.state || loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Completing...' : 'Complete'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[question.id]}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
