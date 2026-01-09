import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { ArrowRight, Sparkles, Target, Zap, Clock, TrendingUp, CheckCircle, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardProps {
  profile: Profile | null;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ profile, onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    matchesFound: 0,
    applicationsStarted: 0,
    deadlinesThisMonth: 0,
    totalPotentialFunding: 0
  });

  // Agency Specific State
  const [agencyStats, setAgencyStats] = useState({
    clientsManaged: 0,
    activeGrants: 0,
    pendingReports: 0,
    complianceScore: 0
  });

  // Use organization_type instead of org_type
  const isAgency = profile?.organization_type === 'Agency';

  useEffect(() => {
    if (user && profile) {
      loadStats();
      if (isAgency) loadAgencyStats();
      checkQuestionnaireCompletion();
    }
  }, [user, profile]);

  const checkQuestionnaireCompletion = () => {
    // Only trigger confetti if explicitly just finished questionnaire (could use a flag or just do it on first load if completed)
    // For now, let's just trigger it if they have matches but low app usage to encourage them
    if (profile?.questionnaire_completed && stats.matchesFound > 0 && stats.applicationsStarted === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const loadStats = async () => {
    if (!profile) return;
    
    // In a real app, these would be separate DB queries
    // For now, we'll simulate based on profile data
    const mockPotentialFunding = profile.annual_revenue === '$1M - $5M' ? 500000 : 
                                profile.annual_revenue === '$100k - $500k' ? 100000 : 50000;

    setStats({
      matchesFound: isAgency ? 124 : 12, // Agencies see more
      applicationsStarted: 3,
      deadlinesThisMonth: 2,
      totalPotentialFunding: mockPotentialFunding
    });
  };

  const loadAgencyStats = async () => {
    // Simulate fetching agency-specific metrics
    setAgencyStats({
      clientsManaged: 5,
      activeGrants: 8,
      pendingReports: 2,
      complianceScore: 94
    });
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className="text-slate-400 text-sm font-medium">Expected</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {profile?.organization_type || 'Partner'}!
          </h1>
          <p className="text-slate-400">
            {isAgency 
              ? "Here's the status of your managed grants and clients." 
              : "Here's your grant funding overview for this month."}
          </p>
        </div>
        <button 
          onClick={() => onNavigate(isAgency ? 'agency' : 'pool')}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-emerald-900/20"
        >
          {isAgency ? (
            <>
              <ShieldCheck className="w-5 h-5" />
              Go to Agency Tools
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Find New Grants
            </>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Target} 
          label="Grant Matches" 
          value={stats.matchesFound}
          color="text-emerald-400 bg-emerald-400" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Potential Funding" 
          value={`$${(stats.totalPotentialFunding / 1000).toFixed(0)}k`}
          color="text-blue-400 bg-blue-400" 
        />
        <StatCard 
          icon={Zap} 
          label="Active Applications" 
          value={stats.applicationsStarted}
          color="text-purple-400 bg-purple-400" 
        />
        <StatCard 
          icon={Clock} 
          label="Deadlines (30 Days)" 
          value={stats.deadlinesThisMonth}
          color="text-orange-400 bg-orange-400" 
        />
      </div>

      {/* AGENCY DASHBOARD SECTION */}
      {isAgency && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Agency Overview
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Status */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Client Portfolio</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400">Active Clients</span>
                <span className="text-white font-bold">{agencyStats.clientsManaged}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400">Active Grants</span>
                <span className="text-white font-bold">{agencyStats.activeGrants}</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[75%]"></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">75% capacity utilized</p>
            </div>

            {/* Compliance / Reporting */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Compliance Watch</h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <span className="block text-3xl font-bold text-white">{agencyStats.complianceScore}%</span>
                  <span className="text-xs text-slate-400">Audit Score</span>
                </div>
                <div className="h-12 w-12 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              {agencyStats.pendingReports > 0 ? (
                <div className="p-3 bg-orange-900/30 border border-orange-500/30 rounded flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-orange-200 text-sm font-medium">{agencyStats.pendingReports} Reports Due</p>
                    <p className="text-orange-300/60 text-xs">Due within 14 days</p>
                  </div>
                </div>
              ) : (
                 <div className="p-3 bg-emerald-900/30 border border-emerald-500/30 rounded flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <p className="text-emerald-200 text-sm">All reports up to date</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
               <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
               <div className="space-y-3">
                 <button 
                  onClick={() => onNavigate('agency')}
                  className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded transition text-sm flex items-center justify-between"
                 >
                   <span>New Client Audit</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
                 <button className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded transition text-sm flex items-center justify-between">
                   <span>Submit Monthly Report</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
                 <button className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded transition text-sm flex items-center justify-between">
                   <span>Add Team Member</span>
                   <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Feed (Placeholder) */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500"></div>
                <div>
                  <p className="text-slate-300">New grant match found: "Rural Business Development Grant"</p>
                  <p className="text-sm text-slate-500">{i * 2 + 1} hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}