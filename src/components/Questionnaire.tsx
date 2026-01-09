import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { US_STATES } from '../lib/states';

interface QuestionnaireProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'org_type',
    question: 'What describes you best?',
    options: ['Nonprofit', 'Small Business', 'Freelancer/Solo', 'Artist/Creator', 'Agency', 'Other']
  },
  {
    id: 'state',
    question: 'Where are you located?',
    type: 'select',
    options: US_STATES
  },
  {
    id: 'focus',
    question: 'What is your main focus area?',
    options: ['Arts & Culture', 'Education', 'Environment', 'Health', 'Social Justice', 'Technology', 'Community Development']
  }
];

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [STEPS[currentStep].id]: answer }));
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitAnswers({ ...answers, [STEPS[currentStep].id]: answer });
    }
  };

  const submitAnswers = async (finalAnswers: Record<string, string>) => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          organization_type: finalAnswers.org_type,
          state: finalAnswers.state,
          focus_area: finalAnswers.focus,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save your answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 animate-fade-in">
          {step.question}
        </h2>

        <div className="space-y-3">
          {step.type === 'select' ? (
            <div className="space-y-4">
              <select
                className="w-full p-4 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                onChange={(e) => handleAnswer(e.target.value)}
                value={answers[step.id] || ''}
              >
                <option value="">Select an option...</option>
                {(step.options as Array<{name: string, code: string}>).map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            (step.options as string[]).map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={loading}
                className="w-full p-4 text-left bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-emerald-500 rounded-lg text-slate-200 hover:text-white transition-all duration-200 group flex items-center justify-between"
              >
                <span className="font-medium">{option}</span>
                <span className="opacity-0 group-hover:opacity-100 text-emerald-500 transition-opacity">→</span>
              </button>
            ))
          )}
        </div>

        {loading && (
          <div className="mt-6 text-center text-slate-400 text-sm animate-pulse">
            Saving your profile...
          </div>
        )}
      </div>
    </div>
  );
}