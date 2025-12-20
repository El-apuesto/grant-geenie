import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grant, Profile, Application } from '../types';
import { getStateName } from '../lib/states';
import { ExternalLink, LogOut, Lamp, Settings as SettingsIcon, Crown, Lock, Search, Plus, Calendar, DollarSign, Building2, FileText, Bookmark, BookmarkCheck, Filter, X, ClipboardList } from 'lucide-react';
import ProductTour from './ProductTour';
import HelpButton from './HelpButton';
import Settings from './Settings';
import Questionnaire from './Questionnaire';
import LOIGenerator from './LOIGenerator';
import FiscalSponsorsPage from './FiscalSponsorsPage';
import ApplicationWizard from './ApplicationWizard';
import CalendarPage from './CalendarPage';
import ApplicationTracker from './ApplicationTracker';
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
        
        // SMART FILTERING - Use questionnaire data!
        let query = supabase
          .from('grants')
          .select('*')
          .eq('is_active', true);
        
        // Filter by state (if grant has states array, check if user's state is in it)
        // If grant.states is null or empty, it means it's open to all states
        query = query.or(`states.cs.{${profile.state}},states.is.null`);
        
        // Filter by organization type (if grant has entity_types, check if user's org_type is in it)
        // If grant.entity_types is null, it means it's open to all entity types
        if (profile.org_type) {
          query = query.or(`entity_types.cs.{${profile.org_type}},entity_types.is.null`);
        }
        
        // Filter by award amount - show grants where max award is at least what user wants
        // Parse grant_amount from profile (format: "$10,000 - $50,000")
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

  // Apply search and filters
  const getFilteredAndSortedGrants = () => {
    let filtered = showSavedOnly 
      ? grants.filter(g => savedGrantIds.has(g.id))
      : grants;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(query) ||
        g.funder_name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query)
      );
    }

    // Funder type filter
    if (selectedFunderType !== 'all') {
      filtered = filtered.filter(g => g.funder_type.toLowerCase() === selectedFunderType.toLowerCase());
    }

    // Deadline filter
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

    // Amount filter
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

    // Sort
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

  // Calculate stats from applications
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

            <section id="grant-pool-section" className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isPro ? 'Your Matched Grants' : 'Grant Matches'}
                  </h2>
                  <p className="text-slate-400">
                    {isPro ? (
                      `Showing ${displayedGrants.length.toLocaleString()} ${showSavedOnly ? 'saved' : ''} grants matched to your profile`
                    ) : (
                      `Showing ${displayedGrants.length} of your 5 monthly free matches`
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {savedCount > 0 && (
                    <button
                      onClick={() => setShowSavedOnly(!showSavedOnly)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                        showSavedOnly
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      Saved ({savedCount})
                    </button>
                  )}
                  {isPro && (
                    <HelpButton
                      sectionName="Grant Pool"
                      content="These grants are automatically matched to your state, organization type, and funding needs. Click the bookmark icon to save grants. Use search and filters to narrow results further."
                    />
                  )}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                {/* Search Bar */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search grants by keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                      showFilters || hasActiveFilters
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {hasActiveFilters && !showFilters && (
                      <span className="ml-1 w-2 h-2 bg-white rounded-full" />
                    )}
                  </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-600">
                    {/* Funder Type */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Funder Type</label>
                      <select
                        value={selectedFunderType}
                        onChange={(e) => setSelectedFunderType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">All Types</option>
                        <option value="government">Government</option>
                        <option value="foundation">Foundation</option>
                        <option value="corporate">Corporate</option>
                      </select>
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
                      <select
                        value={selectedDeadline}
                        onChange={(e) => setSelectedDeadline(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">All Deadlines</option>
                        <option value="30">Next 30 Days</option>
                        <option value="60">Next 60 Days</option>
                        <option value="90">Next 90 Days</option>
                        <option value="rolling">Rolling</option>
                      </select>
                    </div>

                    {/* Award Amount */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Min Award</label>
                      <input
                        type="number"
                        placeholder="$10,000"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Max Award</label>
                      <input
                        type="number"
                        placeholder="$50,000"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="deadline">Deadline (Soonest)</option>
                        <option value="amount_high">Award (Highest)</option>
                        <option value="amount_low">Award (Lowest)</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="flex items-end">
                        <button
                          onClick={clearFilters}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition w-full justify-center"
                        >
                          <X className="w-4 h-4" />
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {displayedGrants.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                  <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg mb-2">
                    {showSavedOnly ? 'No saved grants yet.' : hasActiveFilters ? 'No grants match your filters.' : 'No matching grants found for your profile.'}
                  </p>
                  <p className="text-slate-400">
                    {showSavedOnly ? 'Click the bookmark icon on grants to save them.' : hasActiveFilters ? 'Try adjusting your filters.' : "Try updating your profile settings or check back soon for new opportunities!"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedGrants.map((grant) => {
                    const isSaved = savedGrantIds.has(grant.id);
                    return (
                      <div
                        key={grant.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/30 transition group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white flex-1">
                                {grant.title}
                              </h3>
                              {/* BOOKMARK BUTTON - ALWAYS VISIBLE */}
                              <button
                                onClick={() => toggleSaveGrant(grant.id)}
                                className="p-2 rounded-lg transition bg-slate-700 hover:bg-emerald-600 shrink-0"
                                title={isSaved ? 'Remove from saved grants' : 'Save this grant'}
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="w-6 h-6 text-emerald-400" />
                                ) : (
                                  <Bookmark className="w-6 h-6 text-slate-300" />
                                )}
                              </button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                              <span className="font-medium">{grant.funder_name}</span>
                              <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">
                                {grant.funder_type}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-300 mb-4 line-clamp-2">
                          {grant.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span>
                              {formatCurrency(grant.award_min)} - {formatCurrency(grant.award_max)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                            <span>{formatDeadline(grant.deadline, grant.is_rolling)}</span>
                          </div>
                        </div>

                        {isPro ? (
                          <a
                            href={grant.apply_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            View Grant
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm italic">Upgrade to Pro to view application details</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

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
                <section id="calendar-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Deadline Calendar</h2>
                    <HelpButton
                      sectionName="Calendar"
                      content="Track all grant deadlines on an interactive calendar. See upcoming deadlines, monitor application status, and never miss a deadline again."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400">Visualize your grant deadlines on a calendar. Track submissions, awards, and more.</p>
                      <button
                        onClick={() => setShowCalendar(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                      >
                        <Calendar className="w-4 h-4" />
                        View Calendar
                      </button>
                    </div>
                  </div>
                </section>

                <section id="fiscal-sponsors-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Fiscal Sponsor Matcher</h2>
                    <HelpButton
                      sectionName="Fiscal Sponsors"
                      content="Browse 265+ trusted fiscal sponsors. Filter by focus area, location, and fee range to find the right fit for your project."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400">Access our curated database of 265+ fiscal sponsors with smart matching based on your profile.</p>
                      <button
                        onClick={() => setShowFiscalSponsors(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                      >
                        <Building2 className="w-4 h-4" />
                        Browse Sponsors
                      </button>
                    </div>
                  </div>
                </section>

                <section id="lois-applications-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Application Tracker</h2>
                    <HelpButton
                      sectionName="Application Tracker"
                      content="Track every LOI and full application with status, due dates, submitted dates, and amounts all in one Kanban-style pipeline."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-slate-400 mb-3">Manage your entire grant pipeline from Draft to Awarded with visual Kanban tracking.</p>
                        {applications.length > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-slate-300"><strong>{applications.length}</strong> total applications</span>
                            <span className="text-purple-400"><strong>{stats.submitted}</strong> submitted</span>
                            <span className="text-emerald-400"><strong>{stats.awarded}</strong> awarded</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowApplicationTracker(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                      >
                        <ClipboardList className="w-4 h-4" />
                        {applications.length > 0 ? 'View Tracker' : 'Start Tracking'}
                      </button>
                    </div>
                  </div>
                </section>

                <section id="templates-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">LOI Generator & Templates</h2>
                    <HelpButton
                      sectionName="Templates"
                      content="Generate LOIs and access 4 professional application templates: Federal, Foundation, Corporate, and Arts grants. Each auto-fills with your profile information."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400">Create LOIs and access grant application templates pre-filled with your organization information.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowLOIGenerator(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                        >
                          <Plus className="w-4 h-4" />
                          Generate LOI
                        </button>
                        <button
                          onClick={() => setShowApplicationTemplates(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
                        >
                          <FileText className="w-4 h-4" />
                          Templates
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

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
