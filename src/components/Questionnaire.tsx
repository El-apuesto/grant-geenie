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
    id: 'state',
    label: 'What state/province are you located in?',
    type: 'select',
    options: US_STATES.map(s => s.name),
  },
  {
    id: 'business_location',
    label: 'Where does the majority of your work/business take place?',
    type: 'single',
    options: [
      'In-person in my local community',
      'In-person across my state/region',
      'Primarily online/virtual',
      'Mix of in-person and online',
    ],
  },
  {
    id: 'legal_entity',
    label: 'What is your legal entity type?',
    type: 'single',
    options: [
      'Individual',
      'Unincorporated group',
      '501(c)(3) or equivalent nonprofit',
      'For-profit business',
      'Other',
    ],
  },
  {
    id: 'annual_revenue',
    label: 'What was your annual revenue/budget last year?',
    type: 'single',
    options: [
      'Under $50,000',
      '$50,000 - $250,000',
      '$250,000 - $1,000,000',
      'Over $1,000,000',
      'Not founded yet',
    ],
  },
  {
    id: 'grant_amount',
    label: 'How much funding are you seeking? (select all that apply)',
    type: 'multi',
    options: [
      'Under $10,000',
      '$10,000 - $50,000',
      '$50,000 - $100,000',
      '$100,000 - $250,000',
      'Over $250,000',
    ],
  },
  {
    id: 'primary_fields',
    label: 'Select your primary field(s) (choose up to 3):',
    type: 'multi',
    maxSelections: 3,
    options: [
      'Arts & Culture',
      'Environment',
      'Health',
      'Education',
      'Housing',
      'Technology',
      'Social Justice',
      'Other',
    ],
  },
  {
    id: 'demographic_focus',
    label: 'Select any that apply to your organization/leadership:',
    type: 'multi',
    options: [
      'Women-led',
      'BIPOC-led',
      'LGBTQ+-led',
      'Rural',
      'Veterans',
      'Disabled-led',
      'Immigrant-led',
      'Youth-led',
      'None of these',
    ],
  },
  {
    id: 'project_stage',
    label: 'What stage is your project/organization?',
    type: 'single',
    options: [
      'Idea phase',
      'Prototype/pilot',
      'Operating 1-3 years',
      'Scaling/established',
    ],
  },
  {
    id: 'fiscal_sponsor',
    label: 'Do you have (or can you get) a 501(c)(3) fiscal sponsor?',
    type: 'single',
    options: ['Yes', 'No', 'Maybe / Not sure'],
  },
];

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    state: '',
    business_location: '',
    legal_entity: '',
    annual_revenue: '',
    grant_amount: [],
    primary_fields: [],
    demographic_focus: [],
    project_stage: '',
    fiscal_sponsor: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const question = QUESTIONS[currentQuestion];

  const handleSingleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const handleMultiAnswer = (value: string) => {
    const current = answers[question.id] as string[];
    const maxSelections = question.maxSelections || 99;

    if (current.includes(value)) {
      setAnswers(prev => ({
        ...prev,
        [question.id]: current.filter(v => v !== value),
      }));
    } else if (current.length < maxSelections) {
      setAnswers(prev => ({
        ...prev,
        [question.id]: [...current, value],
      }));
    }
  };

  const handleStateChange = (stateName: string) => {
    const stateCode = US_STATES.find(s => s.name === stateName)?.code || '';
    setAnswers(prev => ({
      ...prev,
      state: stateCode,
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

  const isQuestionAnswered = () => {
    const answer = answers[question.id];
    if (question.type === 'multi') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const handleComplete = async () => {
    if (!user || !answers.state) {
      setError('Please complete all questions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const primaryFields = answers.primary_fields as string[];
      const orgType = primaryFields[0] || 'Other';

      await supabase.from('profiles').upsert({
        id: user.id,
        state: answers.state,
        org_type: orgType,
        business_location: answers.business_location,
        legal_entity: answers.legal_entity,
        annual_revenue: answers.annual_revenue,
        grant_amount: answers.grant_amount,
        primary_fields: primaryFields,
        demographic_focus: answers.demographic_focus,
        project_stage: answers.project_stage,
        fiscal_sponsor: answers.fiscal_sponsor,
        questionnaire_completed: true,
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      const { count: matchesCount } = await supabase
        .from('grants')
        .select('*', { count: 'exact', head: true })
        .or(`state.eq.${answers.state},state.is.null`);

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
        console.error('Failed to send matches email:', emailError);
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save answers');
    } finally {
      setLoading(false);
    }
  };

  const isLastQuestion = currentQuestion === QUESTIONS.length - 1;
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Eligibility Questionnaire</h1>
          <p className="text-slate-400">9 questions • One-time setup</p>
          <p className="text-slate-400 text-sm mt-1">Your answers will be saved and used to match you with grants</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Progress</span>
            <span className="text-slate-400 text-sm">
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </span>
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

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">{question.label}</h2>

          {question.type === 'select' && (
            <select
              value={US_STATES.find(s => s.code === answers.state)?.name || ''}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select your state...</option>
              {US_STATES.map(state => (
                <option key={state.code} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          )}

          {question.type === 'single' && (
            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSingleAnswer(option)}
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
          )}

          {question.type === 'multi' && (
            <>
              {question.maxSelections && (
                <p className="text-slate-400 text-sm mb-4">
                  Selected: {(answers[question.id] as string[]).length} / {question.maxSelections}
                </p>
              )}
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = (answers[question.id] as string[]).includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleMultiAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition ${
                        isSelected
                          ? 'bg-emerald-600/20 border-emerald-500 text-white'
                          : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="mr-3">{isSelected ? '✓' : '○'}</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Info box on last question */}
        {isLastQuestion && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              ℹ️ You can update your answers anytime in Settings after completing the questionnaire.
            </p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            Back
          </button>
          {isLastQuestion ? (
            <button
              onClick={handleComplete}
              disabled={!isQuestionAnswered() || loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Saving & Finding Grants...' : 'Complete & Find Grants'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isQuestionAnswered()}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}