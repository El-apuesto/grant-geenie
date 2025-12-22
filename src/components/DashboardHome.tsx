import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, TrendingUp, Award, XCircle, Clock, DollarSign } from 'lucide-react';
import Calendar from './Calendar';

interface Stats {
  pending: number;
  submitted: number;
  awarded: number;
  declined: number;
  totalAwarded: number;
  winRate: number;
}

interface DashboardHomeProps {
  isPro: boolean;
}

export default function DashboardHome({ isPro }: DashboardHomeProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    submitted: 0,
    awarded: 0,
    declined: 0,
    totalAwarded: 0,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isPro) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [user, isPro]);

  const loadStats = async () => {
    if (!user) return;
    
    try {
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (applications) {
        const pending = applications.filter(a => a.status === 'Draft' || a.status === 'In Progress').length;
        const submitted = applications.filter(a => ['Submitted', 'Under Review'].includes(a.status)).length;
        const awarded = applications.filter(a => a.status === 'Awarded').length;
        const declined = applications.filter(a => a.status === 'Declined').length;
        const totalAwarded = applications
          .filter(a => a.status === 'Awarded')
          .reduce((sum, a) => sum + (a.amount_awarded || 0), 0);
        
        const totalSubmitted = submitted + awarded + declined;
        const winRate = totalSubmitted > 0 ? (awarded / totalSubmitted) * 100 : 0;

        setStats({
          pending,
          submitted,
          awarded,
          declined,
          totalAwarded,
          winRate
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isPro) {
    return (
      <div className="p-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Dashboard Home</h3>
          <p className="text-slate-400 mb-6">
            Track your applications, view upcoming deadlines, and monitor your success rate.
          </p>
          <p className="text-slate-500">
            Available with Pro subscription
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const hasActivity = stats.pending + stats.submitted + stats.awarded + stats.declined > 0;

  return (
    <div className="p-8">
      {/* Compact Stats Cards - Less vertical space */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
            </div>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Submitted</div>
              <div className="text-2xl font-bold text-white">{stats.submitted}</div>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Awarded</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.awarded}</div>
            </div>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 mb-1">Total</div>
              <div className="text-2xl font-bold text-emerald-400">
                {stats.totalAwarded > 0 ? formatCurrency(stats.totalAwarded).replace('.00', '') : '$0'}
              </div>
            </div>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Calendar Section - BIGGER, more prominent */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <CalendarIcon className="w-6 h-6 text-emerald-500" />
          <h2 className="text-2xl font-bold text-white">Upcoming Deadlines</h2>
        </div>
        <Calendar />
      </div>

      {/* Recent Activity - More compact */}
      {hasActivity ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-white mb-3">Quick Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {stats.submitted > 0 && (
              <div className="flex items-center gap-2 text-slate-300">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>{stats.submitted} under review</span>
              </div>
            )}
            {stats.pending > 0 && (
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span>{stats.pending} in progress</span>
              </div>
            )}
            {stats.awarded > 0 && (
              <div className="flex items-center gap-2 text-slate-300">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>{stats.winRate.toFixed(0)}% win rate</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No Activity Yet</h3>
          <p className="text-slate-400 text-sm">
            Start by finding grants, creating applications, or generating LOIs.
          </p>
        </div>
      )}
    </div>
  );
}