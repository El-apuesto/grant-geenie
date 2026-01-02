import { Search, ClipboardList, Calendar as CalendarIcon, FileText, Building2, BarChart3, Settings as SettingsIcon, Crown, ArrowRight, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PromoPopup from './PromoPopup';

interface DashboardHomeProps {
  isPro: boolean;
  onNavigate: (view: string) => void;
}

interface ApplicationStats {
  total: number;
  won: number;
  lost: number;
  inProgress: number;
  winRate: number;
}

interface Deadline {
  id: string;
  title: string;
  date: Date;
  daysUntil: number;
}

export default function DashboardHome({ isPro, onNavigate }: DashboardHomeProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    won: 0,
    lost: 0,
    inProgress: 0,
    winRate: 0,
  });
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    if (isPro && user) {
      loadStats();
      loadDeadlines();
    }
  }, [isPro, user]);

  const loadStats = async () => {
    try {
      const { data } = await supabase
        .from('applications')
        .select('status')
        .eq('user_id', user?.id);

      if (data) {
        const won = data.filter(a => a.status === 'Won').length;
        const lost = data.filter(a => a.status === 'Rejected').length;
        const inProgress = data.filter(a => ['Draft', 'Submitted', 'Under Review'].includes(a.status)).length;
        const total = data.length;
        const winRate = total > 0 ? Math.round((won / (won + lost)) * 100) || 0 : 0;

        setStats({ total, won, lost, inProgress, winRate });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadDeadlines = async () => {
    try {
      const { data } = await supabase
        .from('applications')
        .select('id, grant_title, deadline')
        .eq('user_id', user?.id)
        .in('status', ['Draft', 'Submitted', 'Under Review'])
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true })
        .limit(5);

      if (data) {
        const deadlines: Deadline[] = data.map(app => {
          const deadlineDate = new Date(app.deadline);
          const today = new Date();
          const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: app.id,
            title: app.grant_title,
            date: deadlineDate,
            daysUntil,
          };
        });

        setUpcomingDeadlines(deadlines.filter(d => d.daysUntil >= 0));
      }
    } catch (err) {
      console.error('Failed to load deadlines:', err);
    }
  };

  const features = [
    {
      id: 'grants',
      title: 'Find Grants',
      description: 'Search and discover grant opportunities',
      icon: Search,
      color: 'emerald',
      prOnly: false,
    },
    {
      id: 'tracker',
      title: 'Application Tracker',
      description: 'Manage your grant applications',
      icon: ClipboardList,
      color: 'blue',
      prOnly: true,
    },
    {
      id: 'calendar',
      title: 'Deadline Calendar',
      description: 'View all upcoming deadlines',
      icon: CalendarIcon,
      color: 'purple',
      prOnly: true,
    },
    {
      id: 'loi',
      title: 'LOI Generator',
      description: 'Create letters of inquiry',
      icon: FileText,
      color: 'orange',
      prOnly: true,
    },
    {
      id: 'templates',
      title: 'Application Templates',
      description: 'Professional grant templates',
      icon: FileText,
      color: 'pink',
      prOnly: true,
    },
    {
      id: 'fiscal',
      title: 'Fiscal Sponsors',
      description: 'Find 265+ fiscal sponsor partners',
      icon: Building2,
      color: 'yellow',
      prOnly: true,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Track your success metrics',
      icon: BarChart3,
      color: 'cyan',
      prOnly: true,
    },
  ];

  const getColorClasses = (color: string, isLocked: boolean) => {
    if (isLocked) {
      return 'bg-slate-800/50 border-slate-700 text-slate-500';
    }
    
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-600/10 border-emerald-500/30 hover:bg-emerald-600/20 hover:border-emerald-500',
      blue: 'bg-blue-600/10 border-blue-500/30 hover:bg-blue-600/20 hover:border-blue-500',
      purple: 'bg-purple-600/10 border-purple-500/30 hover:bg-purple-600/20 hover:border-purple-500',
      orange: 'bg-orange-600/10 border-orange-500/30 hover:bg-orange-600/20 hover:border-orange-500',
      pink: 'bg-pink-600/10 border-pink-500/30 hover:bg-pink-600/20 hover:border-pink-500',
      yellow: 'bg-yellow-600/10 border-yellow-500/30 hover:bg-yellow-600/20 hover:border-yellow-500',
      cyan: 'bg-cyan-600/10 border-cyan-500/30 hover:bg-cyan-600/20 hover:border-cyan-500',
      slate: 'bg-slate-600/10 border-slate-500/30 hover:bg-slate-600/20 hover:border-slate-500',
    };
    
    return colors[color] || colors.emerald;
  };

  const getIconColor = (color: string, isLocked: boolean) => {
    if (isLocked) return 'text-slate-600';
    
    const colors: Record<string, string> = {
      emerald: 'text-emerald-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
      pink: 'text-pink-500',
      yellow: 'text-yellow-500',
      cyan: 'text-cyan-500',
      slate: 'text-slate-400',
    };
    
    return colors[color] || colors.emerald;
  };

  return (
    <div className="relative min-h-screen p-8">
      {/* Promo Popup - Shows after 1 second */}
      <PromoPopup />

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
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Welcome back! Here's your grant activity overview.
          </p>
        </div>

        {/* Stats Cards (Pro Only) */}
        {isPro && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Total Applications</span>
                <ClipboardList className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Won</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-3xl font-bold text-emerald-500">{stats.won}</div>
            </div>

            <div className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Lost</span>
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500">{stats.lost}</div>
            </div>

            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400">Win Rate</span>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-purple-500">{stats.winRate}%</div>
            </div>
          </div>
        )}

        {/* Upcoming Deadlines (Pro Only) */}
        {isPro && upcomingDeadlines.length > 0 && (
          <div className="bg-slate-800/50 border border-orange-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                Upcoming Deadlines
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map(deadline => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">{deadline.title}</div>
                    <div className="text-slate-400 text-sm">
                      {deadline.date.toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    deadline.daysUntil <= 7
                      ? 'bg-red-500/20 text-red-400'
                      : deadline.daysUntil <= 14
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {deadline.daysUntil} days
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isLocked = feature.prOnly && !isPro;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => !isLocked && onNavigate(feature.id)}
                  disabled={isLocked}
                  className={`
                    relative p-6 rounded-xl border-2 transition-all duration-200
                    ${getColorClasses(feature.color, isLocked)}
                    ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer transform hover:scale-105'}
                    group
                  `}
                >
                  {/* Lock Badge */}
                  {isLocked && (
                    <div className="absolute top-3 right-3">
                      <Crown className="w-5 h-5 text-slate-600" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className={`w-10 h-10 ${getIconColor(feature.color, isLocked)}`} />
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-2 ${
                    isLocked ? 'text-slate-500' : 'text-white'
                  }`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className={`text-sm mb-4 ${
                    isLocked ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {feature.description}
                  </p>

                  {/* Arrow or Pro Badge */}
                  <div className="flex items-center justify-between">
                    {isLocked ? (
                      <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">
                        Pro Only
                      </span>
                    ) : (
                      <ArrowRight className={`w-5 h-5 ${getIconColor(feature.color, false)} group-hover:translate-x-1 transition-transform`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Upgrade CTA */}
        {!isPro && (
          <div className="mt-12 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-500/30 rounded-xl p-8 text-center">
            <Crown className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Unlock All Features</h2>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Get unlimited access to Application Tracker, LOI Generator, Templates, Calendar, Analytics, and 265+ Fiscal Sponsors.
            </p>
            <button
              onClick={() => onNavigate('pricing')}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-lg"
            >
              View Pricing Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}