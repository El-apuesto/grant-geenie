import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';
import { Bookmark, Search, ArrowRight, Zap, Target, Briefcase } from 'lucide-react';
import { Grant } from '../types';

interface DashboardProps {
  onNavigate?: (view: string) => void;
  profile?: Profile | null;
  onGoHome?: () => void;
}

export default function Dashboard({ onNavigate = () => {}, profile, onGoHome }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    savedGrants: 0,
    matchedGrants: 0,
    upcomingDeadlines: 0
  });
  const [recentGrants, setRecentGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  // Use optional chaining for safe access
  const isAgency = profile?.organization_type === 'Agency'; // Reverted to organization_type

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Get saved grants count
      const { count: savedCount } = await supabase
        .from('saved_grants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get recent grants (simulated matching logic for dashboard)
      const { data: grants } = await supabase
        .from('grants')
        .select('*')
        .limit(3);

      setStats({
        savedGrants: savedCount || 0,
        matchedGrants: 150, // This would be dynamic in production
        upcomingDeadlines: 5
      });

      if (grants) setRecentGrants(grants);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.organization_type || 'User'}! {/* Reverted to organization_type */}
          </h1>
          <p className="text-slate-400">
            {isAgency 
              ? "Here's what's happening with your client grant portfolio."
              : "Here's your grant funding overview for the week."}
          </p>
        </div>
        <button 
          onClick={() => onNavigate('pool')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Find New Grants
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Saved Grants</p>
              <h3 className="text-2xl font-bold text-white">{stats.savedGrants}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">New Matches</p>
              <h3 className="text-2xl font-bold text-white">{stats.matchedGrants}</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Closing Soon</p>
              <h3 className="text-2xl font-bold text-white">{stats.upcomingDeadlines}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Quick Actions (Only visible to Agencies) */}
      {isAgency && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Agency Quick Actions</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('agency')}
              className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors group"
            >
              <h3 className="text-white font-medium mb-1 group-hover:text-emerald-400 transition-colors">Client Readiness Audit</h3>
              <p className="text-sm text-slate-400">Run a quick check for a new client.</p>
            </button>
            <button 
              onClick={() => onNavigate('pool')}
              className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors group"
            >
              <h3 className="text-white font-medium mb-1 group-hover:text-emerald-400 transition-colors">National Search</h3>
              <p className="text-sm text-slate-400">Find grants outside your home state.</p>
            </button>
          </div>
        </div>
      )}

      {/* Recent Opportunities */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Top Recommendations</h2>
          <button 
            onClick={() => onNavigate('pool')}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="divide-y divide-slate-800">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading recommendations...</div>
          ) : recentGrants.map((grant) => (
            <div key={grant.id} className="p-6 hover:bg-slate-800/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">{grant.title}</h3>
                <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-900/50">
                  98% Match
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{grant.description}</p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>{grant.agency_name}</span>
                <span>•</span>
                <span>Deadline: {new Date(grant.close_date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}