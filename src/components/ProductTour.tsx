import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    content:
      "Welcome — I'm The Grant Genie, here to help you keep every grant organized in one place. This dashboard is where all your matches, applications, and deadlines live so you always know what's next. This tour is just a few quick steps, and you can skip it now or come back to it anytime.",
    position: 'center',
  },
  {
    id: 'grant-pool',
    title: 'Grant Pool',
    content:
      'This is your Grant pool, where all your matched and saved grants live together. Use statuses like Researching, LOI, Application, Awarded, and Declined to see exactly where each opportunity stands.',
    targetId: 'grant-pool-section',
    position: 'bottom',
  },
  {
    id: 'fiscal-sponsors',
    title: 'Fiscal Sponsor Partners',
    content:
      "Fiscal sponsors are organizations that help you receive and manage grant funds if you don't have your own nonprofit status yet. In this section, you can see which sponsor is connected to which grant and keep those relationships up to date.",
    targetId: 'fiscal-sponsors-section',
    position: 'bottom',
  },
  {
    id: 'lois-applications',
    title: 'LOIs & Applications',
    content:
      'Here is where you track every LOI and full application, including status, due dates, and submitted dates. You can also link your documents so everything you need to apply is just a click away.',
    targetId: 'lois-applications-section',
    position: 'bottom',
  },
  {
    id: 'templates',
    title: 'Templates Library',
    content:
      "This Templates library gives you best‑practice examples for LOIs, full proposals, budgets, and simple reports. Start from a template, customize it for your project, and attach it to the grant you're working on.",
    targetId: 'templates-section',
    position: 'bottom',
  },
  {
    id: 'wins-records',
    title: 'Wins & Records',
    content:
      "Your Wins & records area shows how many grants you've submitted, awarded, and declined, plus your overall success rate. You'll also see total dollars requested and awarded so you can track your funding progress over time.",
    targetId: 'wins-records-section',
    position: 'bottom',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    content:
      'This Calendar fills in LOI, application, and reporting deadlines automatically as you save and update your grants. Use it to plan your workload and avoid last‑minute rushes on important submissions.',
    targetId: 'calendar-section',
    position: 'bottom',
  },
  {
    id: 'lamp-icon',
    title: 'Need Help?',
    content:
      'Anytime you see this lamp icon, you can click it to "summon" The Grant Genie for guidance or to rerun this tour. Whenever you feel stuck or want a refresher on any part of the dashboard, just tap the lamp and I\'ll be here to help.',
    targetId: 'genie-lamp-icon',
    position: 'left',
  },
];

interface ProductTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function ProductTour({
  isActive,
  onComplete,
  onSkip,
}: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!isActive) return;

    // Calculate position based on target element
    if (step.targetId) {
      const target = document.getElementById(step.targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        let top = 0;
        let left = 0;

        switch (step.position) {
          case 'bottom':
            top = rect.bottom + scrollTop + 10;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'top':
            top = rect.top + scrollTop - 10;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case 'left':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.left + scrollLeft - 10;
            break;
          case 'right':
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.right + scrollLeft + 10;
            break;
          default:
            top = rect.bottom + scrollTop + 10;
            left = rect.left + scrollLeft + rect.width / 2;
        }

        setPosition({ top, left });

        // Scroll target into view
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Center position for welcome screen
      setPosition({
        top: window.innerHeight / 2 + (window.pageYOffset || document.documentElement.scrollTop),
        left: window.innerWidth / 2,
      });
    }
  }, [currentStep, step, isActive]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isActive) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

      {/* Tour tooltip */}
      <div
        className="fixed z-50 transform -translate-x-1/2 -translate-y-1/2"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        <div className="bg-slate-800 border-2 border-emerald-500 rounded-lg shadow-2xl max-w-md w-screen mx-4 p-6 animate-in fade-in zoom-in duration-200">
          {/* Genie icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🧞</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {step.content}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Skip tour
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Highlight target element */}
      {step.targetId && (
        <style>
          {`
            #${step.targetId} {
              position: relative;
              z-index: 45;
              box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.5);
              border-radius: 8px;
            }
          `}
        </style>
      )}
    </>
  );
}
