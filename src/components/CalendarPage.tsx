import { Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './Calendar';

interface CalendarPageProps {
  onBack?: () => void;
}

export default function CalendarPage({ onBack }: CalendarPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-emerald-500" />
            <h1 className="text-3xl font-bold text-white">Deadline Calendar</h1>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Calendar />
      </div>
    </div>
  );
}
