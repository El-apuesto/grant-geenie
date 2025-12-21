import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, TrendingUp, DollarSign, Award, Target, Loader2 } from 'lucide-react';

interface AnalyticsData {
  totalApplications: number;
  submittedApplications: number;
  awardedApplications: number;
  declinedApplications: number;
  totalRequested: number;
  totalAwarded: number;
  winRate: number;
  averageAwardSize: number;
  successByType: { type: string; awarded: number; submitted: number; rate: number }[];
  monthlyTrends: { month: string; requested: number; awarded: number }[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all applications for the user
      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (appsError) throw appsError;

      if (!applications || applications.length === 0) {
        setAnalytics({
          totalApplications: 0,
          submittedApplications: 0,
          awardedApplications: 0,
          declinedApplications: 0,
          totalRequested: 0,
          totalAwarded: 0,
          winRate: 0,
          averageAwardSize: 0,
          successByType: [],
          monthlyTrends: [],
        });
        setLoading(false);
        return;
      }

      // Calculate basic metrics
      const totalApplications = applications.length;
      const submittedApplications = applications.filter(
        app => ['Submitted', 'Under Review', 'Awarded', 'Declined'].includes(app.status)
      ).length;
      const awardedApplications = applications.filter(app => app.status === 'Awarded').length;
      const declinedApplications = applications.filter(app => app.status === 'Declined').length;
      
      const totalRequested = applications
        .filter(app => app.amount_requested)
        .reduce((sum, app) => sum + parseFloat(app.amount_requested || '0'), 0);
      
      const totalAwarded = applications
        .filter(app => app.amount_awarded)
        .reduce((sum, app) => sum + parseFloat(app.amount_awarded || '0'), 0);

      const winRate = submittedApplications > 0 
        ? (awardedApplications / submittedApplications) * 100 
        : 0;

      const averageAwardSize = awardedApplications > 0 
        ? totalAwarded / awardedApplications 
        : 0;

      // Success by application type
      const typeMap = new Map<string, { awarded: number; submitted: number }>();
      
      applications.forEach(app => {
        const type = app.application_type || 'Unknown';
        if (!typeMap.has(type)) {
          typeMap.set(type, { awarded: 0, submitted: 0 });
        }
        
        const stats = typeMap.get(type)!;
        if (['Submitted', 'Under Review', 'Awarded', 'Declined'].includes(app.status)) {
          stats.submitted++;
        }
        if (app.status === 'Awarded') {
          stats.awarded++;
        }
      });

      const successByType = Array.from(typeMap.entries())
        .map(([type, stats]) => ({
          type,
          awarded: stats.awarded,
          submitted: stats.submitted,
          rate: stats.submitted > 0 ? (stats.awarded / stats.submitted) * 100 : 0,
        }))
        .sort((a, b) => b.rate - a.rate);

      // Monthly trends (last 6 months)
      const monthlyMap = new Map<string, { requested: number; awarded: number }>();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      applications
        .filter(app => new Date(app.created_at) >= sixMonthsAgo)
        .forEach(app => {
          const date = new Date(app.created_at);
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          
          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, { requested: 0, awarded: 0 });
          }
          
          const stats = monthlyMap.get(monthKey)!;
          stats.requested += parseFloat(app.amount_requested || '0');
          if (app.status === 'Awarded') {
            stats.awarded += parseFloat(app.amount_awarded || '0');
          }
        });

      const monthlyTrends = Array.from(monthlyMap.entries())
        .map(([month, stats]) => ({ month, ...stats }));

      setAnalytics({
        totalApplications,
        submittedApplications,
        awardedApplications,
        declinedApplications,
        totalRequested,
        totalAwarded,
        winRate,
        averageAwardSize,
        successByType,
        monthlyTrends,
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Error loading analytics: {error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || analytics.totalApplications === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Analytics Yet</h3>
        <p className="text-slate-600">
          Start tracking your grant applications to see insights and success metrics here.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-slate-600 mt-1">Track your grant success and funding trends</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Win Rate */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-8 w-8 opacity-90" />
            <span className="text-3xl font-bold">{analytics.winRate.toFixed(1)}%</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Win Rate</h3>
          <p className="text-xs opacity-75 mt-1">
            {analytics.awardedApplications} awarded / {analytics.submittedApplications} submitted
          </p>
        </div>

        {/* Total Awarded */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8 opacity-90" />
            <span className="text-3xl font-bold">{formatCurrency(analytics.totalAwarded)}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Awarded</h3>
          <p className="text-xs opacity-75 mt-1">
            From {analytics.awardedApplications} successful applications
          </p>
        </div>

        {/* Average Award */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-90" />
            <span className="text-3xl font-bold">{formatCurrency(analytics.averageAwardSize)}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Average Award</h3>
          <p className="text-xs opacity-75 mt-1">
            Per successful application
          </p>
        </div>

        {/* Total Requested */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 opacity-90" />
            <span className="text-3xl font-bold">{formatCurrency(analytics.totalRequested)}</span>
          </div>
          <h3 className="text-sm font-medium opacity-90">Total Requested</h3>
          <p className="text-xs opacity-75 mt-1">
            Across {analytics.totalApplications} applications
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate by Type */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Success Rate by Type</h3>
          
          {analytics.successByType.length === 0 ? (
            <p className="text-slate-500 text-sm">No data available yet</p>
          ) : (
            <div className="space-y-4">
              {analytics.successByType.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.type}</span>
                    <span className="text-sm text-slate-600">
                      {item.awarded}/{item.submitted} ({item.rate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Funding Trends */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Funding Trends (6 Months)</h3>
          
          {analytics.monthlyTrends.length === 0 ? (
            <p className="text-slate-500 text-sm">No data available yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.monthlyTrends.map((trend) => (
                <div key={trend.month} className="border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{trend.month}</span>
                    <div className="text-xs text-slate-500">
                      <span className="text-emerald-600 font-medium">
                        {formatCurrency(trend.awarded)}
                      </span>
                      {' / '}
                      <span>{formatCurrency(trend.requested)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div
                      className="bg-emerald-500 h-2 rounded"
                      style={{ 
                        width: trend.requested > 0 
                          ? `${(trend.awarded / trend.requested) * 100}%` 
                          : '0%' 
                      }}
                      title={`Awarded: ${formatCurrency(trend.awarded)}`}
                    />
                    <div
                      className="bg-slate-200 h-2 rounded"
                      style={{ 
                        width: trend.requested > 0 
                          ? `${((trend.requested - trend.awarded) / trend.requested) * 100}%` 
                          : '100%' 
                      }}
                      title={`Requested: ${formatCurrency(trend.requested - trend.awarded)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Status Overview</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-3xl font-bold text-slate-900">{analytics.totalApplications}</div>
            <div className="text-sm text-slate-600 mt-1">Total Apps</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{analytics.submittedApplications}</div>
            <div className="text-sm text-slate-600 mt-1">Submitted</div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-3xl font-bold text-emerald-600">{analytics.awardedApplications}</div>
            <div className="text-sm text-slate-600 mt-1">Awarded</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{analytics.declinedApplications}</div>
            <div className="text-sm text-slate-600 mt-1">Declined</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      {analytics.submittedApplications > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Key Insights
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5" />
              <div>
                <p className="text-slate-700">
                  Your win rate of <strong>{analytics.winRate.toFixed(1)}%</strong> shows 
                  {analytics.winRate >= 30 ? ' strong' : ' developing'} grant success.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
              <div>
                <p className="text-slate-700">
                  You've secured <strong>{formatCurrency(analytics.totalAwarded)}</strong> in total funding
                  {analytics.totalRequested > 0 && 
                    ` (${((analytics.totalAwarded / analytics.totalRequested) * 100).toFixed(1)}% of requested)`
                  }.
                </p>
              </div>
            </div>
            
            {analytics.successByType.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                <div>
                  <p className="text-slate-700">
                    <strong>{analytics.successByType[0].type}</strong> applications have your highest 
                    success rate at {analytics.successByType[0].rate.toFixed(1)}%.
                  </p>
                </div>
              </div>
            )}
            
            {analytics.averageAwardSize > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5" />
                <div>
                  <p className="text-slate-700">
                    Your average award size is <strong>{formatCurrency(analytics.averageAwardSize)}</strong> 
                    per successful application.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
