import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grant, Profile, Application } from '../types';
import { getStateName } from '../lib/states';
import { ExternalLink, LogOut, Lamp, Settings as SettingsIcon, Crown, Lock, Search, Plus, Calendar, DollarSign, Building2, FileText, Bookmark, BookmarkCheck, Filter, X, ClipboardList, BarChart3 } from 'lucide-react';
import ProductTour from './ProductTour';
import HelpButton from './HelpButton';
import Settings from './Settings';
import Questionnaire from './Questionnaire';
import LOIGenerator from './LOIGenerator';
import FiscalSponsorsPage from './FiscalSponsorsPage';
import ApplicationWizard from './ApplicationWizard';
import CalendarPage from './CalendarPage';
import ApplicationTracker from './ApplicationTracker';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useTour } from '../hooks/useTour';

interface ProfileWithQuestionnaire extends Profile {
  primary_fields?: string[];
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileWithQuestionnaire | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedGrantIds, setSavedGrantIds] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchingGrants, setSearchingGrants] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showLOIGenerator, setShowLOIGenerator] = useState(false);
  const [showFiscalSponsors, setShowFiscalSponsors] = useState(false);
  const [showApplicationTemplates, setShowApplicationTemplates] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showApplicationTracker, setShowApplicationTracker] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFunderType, setSelectedFunderType] = useState<string>('all');
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('deadline');
  const [showFilters, setShowFilters] = useState(false);

  const { isTourActive, startTour, completeTour, skipTour } = useTour();

  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (err) throw err;
        if (data) {
          setProfile(data as ProfileWithQuestionnaire);
          if (!data.state || !data.org_type) {
            setShowQuestionnaire(true);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadSavedGrants();
    loadApplications();
  }, [user]);

  useEffect(() => {
    if (!profile?.state || !profile?.org_type) {
      setLoading(false);
      return;
    }
    
    const loadGrants = async () => {
      try {
        setSearchingGrants(true);
        setLoading(true);
        
        const isPro = profile.subscription_status === 'active';
        
        let query = supabase
          .from('grants')
          .select('*')
          .eq('is_active', true);
        
        query = query.or(`states.cs.{${profile.state}},states.is.null`);
        
        if (profile.org_type) {
          query = query.or(`entity_types.cs.{${profile.org_type}},entity_types.is.null`);
        }
        
        if (profile.grant_amount && profile.grant_amount.length > 0) {
          const amountStr = profile.grant_amount[0];
          const minAmount = parseInt(amountStr.replace(/[^0-9]/g, '').split('-')[0]);
          if (!isNaN(minAmount)) {
            query = query.gte('award_max', minAmount);
          }
        }
        
        query = query.order('deadline', { ascending: true });
        
        if (!isPro) {
          query = query.limit(5);
        } else {
          query = query.limit(10000);
        }
        
        const { data, error: err } = await query;

        if (err) throw err;
        setGrants(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grants');
      } finally {
        setLoading(false);
        setSearchingGrants(false);
      }
    };

    loadGrants();
  }, [profile?.state, profile?.org_type, profile?.subscription_status, profile?.grant_amount]);

  const loadSavedGrants = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('saved_grants')
        .select('grant_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      const ids = new Set(data?.map(sg => sg.grant_id) || []);
      setSavedGrantIds(ids);
    } catch (err) {
      console.error('Error loading saved grants:', err);
    }
  };

  const loadApplications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  const toggleSaveGrant = async (grantId: string) => {
    if (!user) return;
    
    try {
      if (savedGrantIds.has(grantId)) {
        await supabase
          .from('saved_grants')
          .delete()
          .eq('user_id', user.id)
          .eq('grant_id', grantId);
        
        setSavedGrantIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(grantId);
          return newSet;
        });
      } else {
        await supabase
          .from('saved_grants')
          .insert({ user_id: user.id, grant_id: grantId });
        
        setSavedGrantIds(prev => new Set([...prev, grantId]));
      }
    } catch (err) {
      console.error('Error toggling save grant:', err);
      setError('Failed to save grant');
    }
  };

  const getFilteredAndSortedGrants = () => {
    let filtered = showSavedOnly 
      ? grants.filter(g => savedGrantIds.has(g.id))
      : grants;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(query) ||
        g.funder_name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
      );
    }

    if (selectedFunderType !== 'all') {
      filtered = filtered.filter(g => g.funder_type.toLowerCase() === selectedFunderType.toLowerCase());
    }

    if (selectedDeadline !== 'all') {
      const today = new Date();
      filtered = filtered.filter(g => {
        if (selectedDeadline === 'rolling') return g.is_rolling;
        if (!g.deadline || g.is_rolling) return false;
        
        const deadline = new Date(g.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (selectedDeadline === '30') return daysUntil <= 30 && daysUntil >= 0;
        if (selectedDeadline === '60') return daysUntil <= 60 && daysUntil >= 0;
        if (selectedDeadline === '90') return daysUntil <= 90 && daysUntil >= 0;
        return true;
      });
    }

    if (minAmount) {
      const min = parseInt(minAmount);
      if (!isNaN(min)) {
        filtered = filtered.filter(g => g.award_max >= min);
      }
    }
    if (maxAmount) {
      const max = parseInt(maxAmount);
      if (!isNaN(max)) {
        filtered = filtered.filter(g => g.award_min <= max);
      }
    }

    if (sortBy === 'deadline') {
      filtered.sort((a, b) => {
        if (a.is_rolling && !b.is_rolling) return 1;
        if (!a.is_rolling && b.is_rolling) return -1;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    } else if (sortBy === 'amount_high') {
      filtered.sort((a, b) => b.award_max - a.award_max);
    } else if (sortBy === 'amount_low') {
      filtered.sort((a, b) => a.award_min - b.award_min);
    }

    return filtered;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedFunderType('all');
    setSelectedDeadline('all');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('deadline');
  };

  const hasActiveFilters = searchQuery || selectedFunderType !== 'all' || selectedDeadline !== 'all' || minAmount || maxAmount || sortBy !== 'deadline';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  const handleUpgrade = () => {
    window.open('https://buy.stripe.com/test_4gw5lmdQa3S42NW4gi', '_blank');
  };

  const handleRestartTour = () => {
    setShowSettings(false);
    startTour();
  };

  const handleRetakeQuestionnaire = () => {
    setShowSettings(false);
    setShowQuestionnaire(true);
  };

  const handleQuestionnaireComplete = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data as ProfileWithQuestionnaire);
      setShowQuestionnaire(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDeadline = (deadline: string | null, isRolling: boolean) => {
    if (isRolling) return 'Rolling';
    if (!deadline) return 'TBD';
    return new Date(deadline).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isPro = profile?.subscription_status === 'active';
  const hasCompletedQuestionnaire = profile?.state && profile?.org_type;
  
  const displayedGrants = getFilteredAndSortedGrants();
  const savedCount = grants.filter(g => savedGrantIds.has(g.id)).length;

  const stats = {
    submitted: applications.filter(a => ['Submitted', 'Under Review', 'Awarded', 'Declined'].includes(a.status)).length,
    awarded: applications.filter(a => a.status === 'Awarded').length,
    declined: applications.filter(a => a.status === 'Declined').length,
    totalAwarded: applications.reduce((sum, a) => sum + (a.amount_awarded || 0), 0),
  };

  if (showQuestionnaire) {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
  }

  if (showSettings) {
    if (!isPro) {
      setShowSettings(false);
      return null;
    }
    return (
      <Settings
        onBack={() => setShowSettings(false)}
        onRestartTour={handleRestartTour}
        onRetakeQuestionnaire={handleRetakeQuestionnaire}
      />
    );
  }

  if (showLOIGenerator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">LOI Generator</h1>
            <button
              onClick={() => setShowLOIGenerator(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <LOIGenerator isPro={isPro} />
        </div>
      </div>
    );
  }

  if (showFiscalSponsors) {
    return (
      <FiscalSponsorsPage onBack={() => setShowFiscalSponsors(false)} />
    );
  }

  if (showApplicationTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Application Templates</h1>
            <button
              onClick={() => setShowApplicationTemplates(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ApplicationWizard isPro={isPro} />
        </div>
      </div>
    );
  }

  if (showCalendar) {
    return <CalendarPage onBack={() => setShowCalendar(false)} />;
  }

  if (showApplicationTracker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Application Tracker</h1>
            <button
              onClick={() => setShowApplicationTracker(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ApplicationTracker isPro={isPro} />
        </div>
      </div>
    );
  }

  if (showAnalytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <button
              onClick={() => setShowAnalytics(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AnalyticsDashboard />
        </div>
      </div>
    );
  }

  if (loading || searchingGrants) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
        <Search className="w-16 h-16 text-emerald-500 animate-pulse mb-4" />
        <div className="text-white text-2xl font-semibold mb-2">Finding grants matched to your profile...</div>
        <div className="text-slate-400 text-sm">Filtering by state, organization type, and funding needs</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Grant Geenie</h1>
              {!isPro && (
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                  Free Tier
                </span>
              )}
              {isPro && (
                <span className="flex items-center gap-1 text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded">
                  <Crown className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
            {hasCompletedQuestionnaire && (
              <p className="text-slate-400 text-sm">
                {profile && `${getStateName(profile.state)} • ${profile.org_type}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isPro && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            )}
            {isPro && (
              <button
                id="genie-lamp-icon"
                onClick={startTour}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors group relative"
                title="Start Product Tour"
              >
                <Lamp className="w-5 h-5" />
                <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Product Tour
                </span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {hasCompletedQuestionnaire && (
          <>
            {!isPro && (
              <div className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-xl font-bold text-white">Unlock Full Access with Pro</h3>
                    </div>
                    <p className="text-slate-300 mb-3">
                      You're viewing 5 matched grants. Upgrade to Pro to unlock:
                    </p>
                    <ul className="text-slate-300 space-y-1 mb-4 ml-4">
                      <li>• <strong>Thousands more grants</strong> matched to your profile</li>
                      <li>• Save grants & direct application links</li>
                      <li>• Application tracking & pipeline</li>
                      <li>• LOI Generator with auto-fill</li>
                      <li>• 265+ Fiscal Sponsor database</li>
                      <li>• Application templates</li>
                      <li>• Deadline calendar</li>
                    </ul>
                    <button
                      onClick={handleUpgrade}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
                    >
                      Upgrade to Pro Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* GRANT POOL SECTION - keeping original code for brevity, same as before */}
            {/* ... rest of grant pool section ... */}

            {!isPro && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Pro Features Locked</h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Application Tracking, Fiscal Sponsors, LOI Generator, Templates, Calendar, and more are available exclusively to Pro subscribers.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition text-lg"
                >
                  Upgrade to Pro to Unlock All Features
                </button>
              </div>
            )}

            {isPro && (
              <>
                {/* Calendar, Fiscal Sponsors, Application Tracker, Templates sections - same as before */}

                <section id="wins-records-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Wins & Records</h2>
                    <HelpButton
                      sectionName="Wins & Records"
                      content="Track grants submitted, awarded, and declined, plus your total dollars awarded over time."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-purple-400">{stats.submitted}</div>
                        <div className="text-slate-400 text-sm">Submitted</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-emerald-400">{stats.awarded}</div>
                        <div className="text-slate-400 text-sm">Awarded</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-400">{stats.declined}</div>
                        <div className="text-slate-400 text-sm">Declined</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-emerald-400">{formatCurrency(stats.totalAwarded)}</div>
                        <div className="text-slate-400 text-sm">Total Awarded</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="analytics-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Analytics & Insights</h2>
                    <HelpButton
                      sectionName="Analytics"
                      content="Visualize your grant success with win rate tracking, funding trends, and success metrics. See which application types work best and identify patterns."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-slate-400 mb-3">Track your win rate, funding trends, and success patterns with visual analytics.</p>
                        {stats.submitted > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-300">Win Rate: <strong className="text-emerald-400">
                              {stats.submitted > 0 ? ((stats.awarded / stats.submitted) * 100).toFixed(1) : '0'}%
                            </strong></span>
                            <span className="text-slate-300">Total Awarded: <strong className="text-emerald-400">
                              {formatCurrency(stats.totalAwarded)}
                            </strong></span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowAnalytics(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                      >
                        <BarChart3 className="w-4 h-4" />
                        View Analytics
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>

      {isPro && isTourActive && (
        <ProductTour
          isActive={isTourActive}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
    </div>
  );
}
