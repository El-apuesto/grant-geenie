import { HelpCircle, X } from 'lucide-react';
import { useState } from 'react';

interface HelpButtonProps {
  content: string;
  sectionName: string;
}

export default function HelpButton({ content, sectionName }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-slate-700/50"
        aria-label={`Help for ${sectionName}`}
        title="Help"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-10 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-2 z-20 w-80 max-w-[calc(100vw-2rem)]">
            <div className="bg-slate-800 border-2 border-emerald-500/50 rounded-lg shadow-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Genie icon */}
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🧞</span>
                </div>
                <h4 className="text-sm font-semibold text-white pt-1">
                  {sectionName}
                </h4>
              </div>

              {/* Content */}
              <p className="text-sm text-slate-300 leading-relaxed pl-11">
                {content}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
