// =====================================================
// DASHBOARD CARD - Reusable section card component
// =====================================================

import { ReactNode } from 'react';

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  badge?: string;
  isProOnly?: boolean;
  isPro?: boolean;
}

export default function DashboardCard({
  icon,
  title,
  description,
  onClick,
  badge,
  isProOnly = false,
  isPro = true,
}: DashboardCardProps) {
  const isDisabled = isProOnly && !isPro;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`relative w-full p-6 rounded-lg border transition group ${
        isDisabled
          ? 'bg-slate-800/30 border-slate-700/30 cursor-not-allowed opacity-60'
          : 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10'
      }`}
    >
      {/* Icon */}
      <div className={`mb-4 inline-flex p-3 rounded-lg ${
        isDisabled
          ? 'bg-slate-700/30 text-slate-500'
          : 'bg-emerald-600/20 text-emerald-500 group-hover:bg-emerald-600/30'
      }`}>
        {icon}
      </div>

      {/* Pro badge */}
      {isProOnly && !isPro && (
        <div className="absolute top-4 right-4 bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 text-xs px-2 py-1 rounded">
          Pro
        </div>
      )}

      {/* Badge (if provided) */}
      {badge && !isDisabled && (
        <div className="absolute top-4 right-4 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs px-2 py-1 rounded">
          {badge}
        </div>
      )}

      {/* Content */}
      <div className="text-left">
        <h3 className={`text-lg font-semibold mb-2 ${
          isDisabled ? 'text-slate-500' : 'text-white group-hover:text-emerald-400'
        }`}>
          {title}
        </h3>
        <p className={`text-sm ${
          isDisabled ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {description}
        </p>
      </div>

      {/* Lock icon for pro-only */}
      {isDisabled && (
        <div className="absolute bottom-4 right-4 text-slate-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}
