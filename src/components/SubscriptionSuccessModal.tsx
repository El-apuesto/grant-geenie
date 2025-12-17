import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SubscriptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function SubscriptionSuccessModal({
  isOpen,
  onClose,
  userEmail,
}: SubscriptionSuccessModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-slate-800 border-2 border-emerald-500/50 rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-emerald-600/20 border-2 border-emerald-500 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Welcome to Grant Hustle!
          </h2>

          {/* Content */}
          <div className="space-y-4 text-slate-300">
            <p className="text-center">
              Your subscription is confirmed. Check your inbox at:
            </p>

            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-center">
              <p className="text-emerald-400 font-semibold break-all">
                {userEmail}
              </p>
            </div>

            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-sm text-emerald-100">
                <strong>What to expect:</strong>
              </p>
              <ul className="text-sm text-slate-300 mt-2 space-y-2 list-disc list-inside">
                <li>
                  <strong>Email 1 (now):</strong> Your welcome email and receipt from Grant Hustle
                </li>
                <li>
                  <strong>Email 2 (soon):</strong> A guided tour link to meet <strong>The Grant Genie</strong> on your dashboard
                </li>
              </ul>
            </div>

            <p className="text-sm text-slate-400 text-center">
              The Grant Genie will walk you through grant matches, templates, tracking, and more!
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </>
  );
}
