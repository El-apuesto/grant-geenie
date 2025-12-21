import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, TrendingUp, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Calendar from './Calendar';

interface Application {
  id: string;
  grant_title: string;
  status: string;
  amount_requested: number;
  amount_awarded: number | null;
  submitted_date: string | null;
  decision_date: string | null;
}

interface Grant {
  id: string;
  title: string;
  funder_name: string;
  deadline: string | null;
  is_rolling: boolean;
  award_max: number;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadApplications();
      loadUpcomingDeadlines();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingDeadlines = async () => {
    if (!user) return;
    
    try {
      // Get saved grants with upcoming deadlines
      const { data: savedGrants, error: savedError } = await supabase
        .from('saved_grants')
        .select('grant_id')
        .eq('user_id', user.id);
      
      if (savedError) throw savedError;
      
      if (savedGrants && savedGrants.length > 0) {
        const grantIds = savedGrants.map(sg => sg.grant_id);
        
        const { data: grants, error: grantsError } = await supabase
          .from('grants')
          .select('id, title, funder_name, deadline, is_rolling, award_max')
          .in('id', grantIds)
          .not('deadline', 'is', null)
          .gte('deadline', new Date().toISOString())
          .order('deadline', { ascending: true })
          .limit(5);
        
        if (grantsError) throw grantsError;
        setUpcomingDeadlines(grants || []);
      }
    } catch (err) {
      console.error('Error loading upcoming deadlines:', err);
    }
  };

  const stats = {
    pending: applications.filter(a => a.status === 'Draft' || a.status === 'In Progress').length,
    submitted: applications.filter(a => ['Submitted', 'Under Review'].includes(a.status)).length,
    awarded: applications.filter(a => a.status === 'Awarded').length,
    declined: applications.filter(a => a.status === 'Declined').length,
    totalAwarded: applications
      .filter(a => a.status === 'Awarded')
      .reduce((sum, a) => sum + (a.amount_awarded || 0), 0),
    winRate: applications.filter(a => ['Awarded', 'Declined'].includes(a.status)).length > 0
      ? (applications.filter(a => a.status === 'Awarded').length / 
         applications.filter(a => ['Awarded', 'Declined'].includes(a.status)).length) * 100
      : 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Awarded': return 'text-emerald-400 bg-emerald-900/20';
      case 'Declined': return 'text-slate-400 bg-slate-800/50';
      case 'Submitted':
      case 'Under Review': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-yellow-400 bg-yellow-900/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Pending</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.pending}</div>
          <p className="text-slate-500 text-xs mt-1">In progress</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Submitted</h3>
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.submitted}</div>
          <p className="text-slate-500 text-xs mt-1">Under review</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Win Rate</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-white">
            {stats.winRate.toFixed(0)}%
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {stats.awarded} of {stats.awarded + stats.declined} decided
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-400 text-sm font-medium">Total Awarded</h3>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {formatCurrency(stats.totalAwarded)}
          </div>
          <p className="text-slate-500 text-xs mt-1">{stats.awarded} grants won</p>
        </div>
      </div>

      {/* Calendar and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-emerald-500" />
            <h2 className="text-xl font-bold text-white">Grant Deadlines</h2>
          </div>
          <Calendar />
        </div>

        {/* Upcoming Deadlines Sidebar */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
          
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No upcoming deadlines</p>
              <p className="text-slate-500 text-xs mt-1">Save grants to track their deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map(grant => (
                <div key={grant.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                  <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
                    {grant.title}
                  </h4>
                  <p className="text-slate-400 text-xs mb-2">{grant.funder_name}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Due: {grant.deadline ? formatDate(grant.deadline) : 'Rolling'}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {formatCurrency(grant.award_max)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No applications yet</h3>
            <p className="text-slate-400 mb-6">Start by browsing grants and creating your first application</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 5).map(app => (
              <div key={app.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-1">{app.grant_title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      {app.submitted_date && (
                        <span className="text-slate-500 text-xs">
                          Submitted {formatDate(app.submitted_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {app.status === 'Awarded' && app.amount_awarded ? (
                      <div>
                        <div className="text-emerald-400 font-semibold">
                          {formatCurrency(app.amount_awarded)}
                        </div>
                        <div className="text-slate-500 text-xs">Awarded</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-slate-400 font-medium">
                          {formatCurrency(app.amount_requested)}
                        </div>
                        <div className="text-slate-500 text-xs">Requested</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}