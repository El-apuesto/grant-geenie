import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, TrendingUp, Award, XCircle, Clock, DollarSign } from 'lucide-react';
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
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Pending</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.pending}</div>
          <p className="text-xs text-slate-500 mt-1">In progress</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Submitted</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.submitted}</div>
          <p className="text-xs text-slate-500 mt-1">Under review</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Awarded</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{stats.awarded}</div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.winRate > 0 ? `${stats.winRate.toFixed(1)}% win rate` : 'No wins yet'}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total Awarded</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {formatCurrency(stats.totalAwarded)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{stats.declined} declined</p>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-500" />
            Upcoming Deadlines
          </h2>
        </div>
        <Calendar />
      </div>

      {/* Recent Activity */}
      {hasActivity ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.submitted > 0 && (
              <div className="flex items-center gap-3 text-slate-300">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>{stats.submitted} application{stats.submitted !== 1 ? 's' : ''} submitted and under review</span>
              </div>
            )}
            {stats.pending > 0 && (
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span>{stats.pending} application{stats.pending !== 1 ? 's' : ''} in progress</span>
              </div>
            )}
            {stats.awarded > 0 && (
              <div className="flex items-center gap-3 text-slate-300">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>{stats.awarded} grant{stats.awarded !== 1 ? 's' : ''} awarded</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Activity Yet</h3>
          <p className="text-slate-400 mb-6">
            Start by finding grants, creating applications, or generating LOIs.
          </p>
        </div>
      )}
    </div>
  );
}