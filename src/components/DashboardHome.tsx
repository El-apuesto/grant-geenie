import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, TrendingUp, Award, Clock, DollarSign } from 'lucide-react';
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

  return (
    <div className="relative min-h-screen p-8">
      {/* Faded Logo Background */}
      <div 
        className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-5"
        style={{ 
          backgroundImage: 'url(/Logo.png.PNG)',
          backgroundSize: '600px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Compact Stats Bar - All 4 across */}
        <div className="flex items-center gap-6 mb-8 bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 flex-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <div>
              <div className="text-xs text-slate-500">Pending</div>
              <div className="text-lg font-bold text-white">{stats.pending}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="flex items-center gap-2 flex-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <div>
              <div className="text-xs text-slate-500">Submitted</div>
              <div className="text-lg font-bold text-white">{stats.submitted}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="flex items-center gap-2 flex-1">
            <Award className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-xs text-slate-500">Awarded</div>
              <div className="text-lg font-bold text-emerald-400">{stats.awarded}</div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="flex items-center gap-2 flex-1">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-xs text-slate-500">Total Awarded</div>
              <div className="text-lg font-bold text-emerald-400">
                {stats.totalAwarded > 0 ? formatCurrency(stats.totalAwarded).replace('.00', '') : '$0'}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar - Clean and Spacious */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <CalendarIcon className="w-7 h-7 text-emerald-500" />
            <h2 className="text-3xl font-bold text-white">Upcoming Deadlines</h2>
          </div>
          <Calendar />
        </div>
      </div>
    </div>
  );
}