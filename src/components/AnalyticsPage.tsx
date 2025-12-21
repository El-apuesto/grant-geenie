import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          </div>
          <p className="text-slate-600 ml-14">
            Visualize your grant success, track funding trends, and identify winning strategies.
          </p>
        </div>

        {/* Dashboard Component */}
        <AnalyticsDashboard />

        {/* Footer Tips */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">💡 Pro Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Track all applications to build historical data and identify patterns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>A win rate above 30% is considered strong in the grant world</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Focus on application types with higher success rates to maximize impact</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>Review monthly trends to optimize your application timing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
