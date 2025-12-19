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
    id: 'legal_status',
    label: 'Your legal status is best described as:',
    section: 'SECTION 1: ORGANIZATIONAL IDENTITY',
    options: [
      'A registered 501(c)(3) nonprofit organization',
      'A public entity (school, university, government agency)',
      'A for-profit business or corporation',
      'An individual artist, researcher, or entrepreneur',
      'A religious or faith-based organization without 501(c)(3) status',
      'A tribal entity or Native-led organization',
    ],
  },
  {
    id: 'headquarters_location',
    label: 'The physical headquarters of your organization is located in:',
    section: 'SECTION 2: GEOGRAPHIC SCOPE',
    options: [
      'A major metropolitan area (population 500,000+)',
      'A suburban or mid-sized city',
      'A rural area or small town',
      'Multiple locations across different states',
    ],
  },
  {
    id: 'geographic_impact',
    label: 'The primary geographic impact of your project will be:',
    section: 'SECTION 2: GEOGRAPHIC SCOPE',
    options: [
      'Confined to our immediate city/county',
      'Statewide within our home state',
      'Regional (multiple specific states)',
      'National or entirely virtual/online',
      'International',
    ],
  },
  {
    id: 'primary_field',
    label: "Your project's primary field aligns most closely with:",
    section: 'SECTION 3: PROGRAMMATIC FOCUS',
    options: [
      'Arts, Culture, and Humanities',
      'Education (K-12 or Higher Education)',
      'Health, Medicine, or Mental Health Services',
      'Environment, Conservation, or Animal Welfare',
      'Human Services (housing, hunger, poverty alleviation)',
      'Community Development or Economic Empowerment',
      'Scientific Research or Technology Innovation',
      'Youth Development or Sports',
    ],
  },
  {
    id: 'annual_budget',
    label: "Your organization's approximate annual operating budget is:",
    section: 'SECTION 4: FINANCIAL PARAMETERS',
    options: [
      'Under $100,000',
      '$100,000 - $500,000',
      '$500,000 - $1,000,000',
      'Over $1,000,000',
      'Not applicable (individual or new project)',
    ],
  },
  {
    id: 'grant_amount',
    label: 'The specific grant amount you are seeking is approximately:',
    section: 'SECTION 4: FINANCIAL PARAMETERS',
    options: [
      'Under $10,000',
      '$10,000 - $50,000',
      '$50,000 - $250,000',
      'Over $250,000',
    ],
  },
  {
    id: 'funding_use',
    label: 'These funds will be used primarily for:',
    section: 'SECTION 5: FUNDING TYPE',
    options: [
      'General operating support (utilities, salaries, overhead)',
      'A specific new program or project',
      'Capacity building (staff training, technology, planning)',
      'Capital expenses (building, renovation, equipment)',
      'Research or pilot program development',
      'Emergency or bridge funding',
    ],
  },
  {
    id: 'funding_start_date',
    label: 'Your ideal funding start date is:',
    section: 'SECTION 6: TIMELINE',
    options: [
      'Immediately (within 3 months - emergency/urgent needs)',
      'Within the next 6-12 months (standard planning cycle)',
      '12+ months from now (long-term strategic planning)',
      "Flexible / dependent on funder's timeline",
    ],
  },
];

export default function Questionnaire({ onComplete }: QuestionnaireProps) {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    legal_status: '',
    headquarters_location: '',
    geographic_impact: '',
    primary_field: '',
    annual_budget: '',
    grant_amount: '',
    funding_use: '',
    funding_start_date: '',
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
      // Save profile with all answers
      await supabase.from('profiles').upsert({
        id: user.id,
        // Store primary field as org_type for backward compatibility
        org_type: answers.primary_field,
        state: answers.state,
        // Store all eligibility data
        legal_status: answers.legal_status,
        headquarters_location: answers.headquarters_location,
        geographic_impact: answers.geographic_impact,
        primary_field: answers.primary_field,
        annual_budget: answers.annual_budget,
        grant_amount: answers.grant_amount,
        funding_use: answers.funding_use,
        funding_start_date: answers.funding_start_date,
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

  // Show section header if it's different from previous question
  const showSectionHeader = currentQuestion === 0 || 
    question.section !== QUESTIONS[currentQuestion - 1]?.section;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Grant Eligibility Assessment</h1>
          <p className="text-slate-400">Time: ~5 minutes</p>
          <p className="text-slate-400 text-sm mt-1">Select ONE answer per question</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Progress</span>
            <span className="text-slate-400 text-sm">{currentQuestion + 1} of {QUESTIONS.length + 1}</span>
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
              <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded">
                <p className="text-emerald-400 text-sm font-semibold">FINAL QUESTION</p>
              </div>
              <h2 className="text-2xl font-bold text-white mb-6">What state are you located in?</h2>
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
              {showSectionHeader && (
                <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded">
                  <p className="text-emerald-400 text-sm font-semibold">{question.section}</p>
                </div>
              )}
              <h2 className="text-xl font-bold text-white mb-6">{question.label}</h2>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition ${
                      answers[question.id] === option
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="font-mono text-emerald-400 mr-3">({String.fromCharCode(65 + index)})</span>
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
            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            Back
          </button>
          {isLastQuestion ? (
            <button
              onClick={handleComplete}
              disabled={!answers.state || loading}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Completing...' : 'Complete Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[question.id]}
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