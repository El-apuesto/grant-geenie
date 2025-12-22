import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Award, TrendingUp, XCircle, DollarSign, Calendar as CalendarIcon, Clock, Bookmark } from 'lucide-react';
import Calendar from './Calendar';

interface Application {
  id: string;
  grant_title: string;
  status: string;
  amount_awarded: number | null;
  submitted_date: string | null;
  deadline: string | null;
}

interface Grant {
  id: string;
  title: string;
  funder_name: string;
  deadline: string | null;
  is_rolling: boolean;
  award_max: number;
}

interface DashboardHomeProps {
  isPro: boolean;
}

export default function DashboardHome({ isPro }: DashboardHomeProps) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedGrants, setSavedGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadApplications();
      loadSavedGrants();
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
    }
  };

  const loadSavedGrants = async () => {
    if (!user) return;
    try {
      const { data: savedData, error: savedError } = await supabase
        .from('saved_grants')
        .select('grant_id')
        .eq('user_id', user.id);

      if (savedError) throw savedError;

      if (savedData && savedData.length > 0) {
        const grantIds = savedData.map(sg => sg.grant_id);
        const { data: grantsData, error: grantsError } = await supabase
          .from('grants')
          .select('*')
          .in('id', grantIds)
          .order('deadline', { ascending: true })
          .limit(5);

        if (grantsError) throw grantsError;
        setSavedGrants(grantsData || []);
      }
    } catch (err) {
      console.error('Error loading saved grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    submitted: applications.filter(a => ['Submitted', 'Under Review', 'Awarded', 'Declined'].includes(a.status)).length,
    awarded: applications.filter(a => a.status === 'Awarded').length,
    declined: applications.filter(a => a.status === 'Declined').length,
    totalAwarded: applications.reduce((sum, a) => sum + (a.amount_awarded || 0), 0),
  };

  const upcomingDeadlines = savedGrants
    .filter(g => !g.is_rolling && g.deadline)
    .slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (deadline: string | null) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
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
            <div className="text-slate-400 text-sm font-medium">Submitted</div>
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.submitted}</div>
          <div className="text-slate-500 text-xs mt-1">Total applications</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm font-medium">Awarded</div>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{stats.awarded}</div>
          <div className="text-slate-500 text-xs mt-1">
            {stats.submitted > 0 ? `${((stats.awarded / stats.submitted) * 100).toFixed(1)}% win rate` : 'No submissions yet'}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm font-medium">Declined</div>
            <XCircle className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.declined}</div>
          <div className="text-slate-500 text-xs mt-1">Keep applying!</div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-slate-400 text-sm font-medium">Total Awarded</div>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{formatCurrency(stats.totalAwarded)}</div>
          <div className="text-slate-500 text-xs mt-1">Lifetime funding</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold text-white">Grant Deadlines</h2>
            </div>
            {isPro ? (
              <Calendar />
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Upgrade to Pro to view grant deadlines on calendar</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Upcoming</h2>
            </div>
            
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map(grant => {
                  const daysUntil = getDaysUntil(grant.deadline);
                  const isUrgent = daysUntil !== null && daysUntil <= 7;
                  
                  return (
                    <div key={grant.id} className="border-l-2 border-emerald-500 pl-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-white font-medium text-sm line-clamp-2">
                          {grant.title}
                        </h3>
                        {isUrgent && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded flex-shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs">{grant.funder_name}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className={`text-sm ${isUrgent ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>
                          {formatDate(grant.deadline)}
                        </div>
                        {daysUntil !== null && (
                          <div className="text-xs text-slate-500">
                            {daysUntil > 0 ? `${daysUntil} days left` : 'Due today'}
                          </div>
                        )}
                      </div>
                      <div className="text-emerald-400 text-sm mt-1">
                        Up to {formatCurrency(grant.award_max)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm mb-2">No saved grants yet</p>
                <p className="text-slate-500 text-xs">
                  Bookmark grants to track their deadlines here
                </p>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {applications.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-3">
                {applications.slice(0, 3).map(app => (
                  <div key={app.id} className="text-sm">
                    <div className="text-white font-medium line-clamp-1">{app.grant_title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        app.status === 'Awarded' ? 'bg-emerald-500/20 text-emerald-400' :
                        app.status === 'Declined' ? 'bg-slate-600/20 text-slate-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {app.status}
                      </span>
                      {app.submitted_date && (
                        <span className="text-slate-500 text-xs">
                          {formatDate(app.submitted_date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty State for New Users */}
      {applications.length === 0 && savedGrants.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Welcome to Grant Geenie!</h3>
          <p className="text-slate-400 mb-6">
            Start by browsing grants and saving ones that interest you. Track your applications and watch your success grow.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition">
              Browse Grants
            </button>
          </div>
        </div>
      )}
    </div>
  );
}