import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grant } from '../types';
import { getStateName } from '../lib/states';
import { ExternalLink, LogOut, Lamp, Settings as SettingsIcon, Crown, Lock, Search, Plus, Calendar, DollarSign, Building2, FileText, Bookmark, BookmarkCheck } from 'lucide-react';
import ProductTour from './ProductTour';
import HelpButton from './HelpButton';
import Settings from './Settings';
import Questionnaire from './Questionnaire';
import LOIGenerator from './LOIGenerator';
import FiscalSponsorMatcher from './FiscalSponsorMatcher';
import ApplicationWizard from './ApplicationWizard';
import { useTour } from '../hooks/useTour';

interface Profile {
  id: string;
  state: string;
  organization_type: string;
  questionnaire_completed: boolean;
  subscription_status: string | null;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
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
          setProfile(data);
          if (!data.state || !data.organization_type) {
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
  }, [user]);

  useEffect(() => {
    if (!profile?.state || !profile?.organization_type) {
      setLoading(false);
      return;
    }
    
    const loadGrants = async () => {
      try {
        setSearchingGrants(true);
        setLoading(true);
        
        const isPro = profile.subscription_status === 'active';
        
        const query = supabase
          .from('grants')
          .select('*')
          .eq('is_active', true)
          .order('deadline', { ascending: true });
        
        if (!isPro) {
          query.limit(5);
        } else {
          query.limit(10000);
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
  }, [profile?.state, profile?.organization_type, profile?.subscription_status]);

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

  const toggleSaveGrant = async (grantId: string) => {
    if (!user) return;
    
    try {
      if (savedGrantIds.has(grantId)) {
        // Unsave
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
        // Save
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
      setProfile(data);
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
  const hasCompletedQuestionnaire = profile?.state && profile?.organization_type;
  
  const displayedGrants = showSavedOnly 
    ? grants.filter(g => savedGrantIds.has(g.id))
    : grants;
  
  const savedCount = grants.filter(g => savedGrantIds.has(g.id)).length;

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Fiscal Sponsor Matcher</h1>
            <button
              onClick={() => setShowFiscalSponsors(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <FiscalSponsorMatcher isPro={isPro} />
        </div>
      </div>
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

  if (loading || searchingGrants) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
        <Search className="w-16 h-16 text-emerald-500 animate-pulse mb-4" />
        <div className="text-white text-2xl font-semibold mb-2">Searching for grants...</div>
        <div className="text-slate-400 text-sm">This may take a few moments</div>
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
                {profile && `${getStateName(profile.state)} • ${profile.organization_type}`}
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
                title="Summon The Grant Genie for help"
              >
                <Lamp className="w-5 h-5" />
                <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Need help?
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
                      You're viewing 5 grants with limited information. Upgrade to Pro to unlock:
                    </p>
                    <ul className="text-slate-300 space-y-1 mb-4 ml-4">
                      <li>• <strong>8,000+ grants</strong> with full details</li>
                      <li>• Direct application links</li>
                      <li>• LOI Generator with auto-fill</li>
                      <li>• 30+ Fiscal Sponsor database</li>
                      <li>• Application templates</li>
                      <li>• Track submissions & wins</li>
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
                    {isPro ? 'Grant Pool' : 'Grant Search Results'}
                  </h2>
                  <p className="text-slate-400">
                    {isPro ? (
                      `Showing ${displayedGrants.length.toLocaleString()} ${showSavedOnly ? 'saved' : 'active'} grant opportunities`
                    ) : (
                      `Showing ${displayedGrants.length} of your 5 monthly free searches`
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
                      content="Click the bookmark icon to save grants. Use the 'Saved' button to view only your bookmarked grants."
                    />
                  )}
                </div>
              </div>

              {displayedGrants.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                  <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-300 text-lg mb-2">
                    {showSavedOnly ? 'No saved grants yet.' : 'No matching grants found at this time.'}
                  </p>
                  <p className="text-slate-400">
                    {showSavedOnly ? 'Click the bookmark icon on grants to save them.' : "We're constantly adding new opportunities. Check back soon!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedGrants.map((grant) => {
                    const isSaved = savedGrantIds.has(grant.id);
                    return (
                      <div
                        key={grant.id}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/30 transition"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white flex-1">
                                {grant.title}
                              </h3>
                              <button
                                onClick={() => toggleSaveGrant(grant.id)}
                                className="p-2 rounded-lg transition hover:bg-slate-700"
                                title={isSaved ? 'Unsave grant' : 'Save grant'}
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Bookmark className="w-5 h-5 text-slate-400" />
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
                  Fiscal Sponsors, LOI Generator, Application Templates, and more are available exclusively to Pro subscribers.
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
                <section id="fiscal-sponsors-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Fiscal Sponsor Matcher</h2>
                    <HelpButton
                      sectionName="Fiscal Sponsors"
                      content="Browse 30+ trusted fiscal sponsors. Filter by focus area, location, and fee range to find the right fit for your project."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400">Access our curated database of 30+ fiscal sponsors with detailed information.</p>
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
                    <h2 className="text-2xl font-bold text-white">LOIs & Applications</h2>
                    <HelpButton
                      sectionName="LOIs & Applications"
                      content="Track every LOI and full application with status, due dates, submitted dates, and linked documents all in one place."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400">Generate professional Letters of Inquiry pre-filled with your organization details.</p>
                      <button
                        onClick={() => setShowLOIGenerator(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        Generate LOI
                      </button>
                    </div>
                    <p className="text-slate-500 text-sm">No applications in progress yet.</p>
                  </div>
                </section>

                <section id="templates-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Application Templates</h2>
                    <HelpButton
                      sectionName="Templates"
                      content="Choose from 4 professional templates: Federal, Foundation, Corporate, and Arts grants. Each template auto-fills with your profile information."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-slate-400">Access 4 grant application templates pre-filled with your organization information.</p>
                      <button
                        onClick={() => setShowApplicationTemplates(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                      >
                        <FileText className="w-4 h-4" />
                        Browse Templates
                      </button>
                    </div>
                  </div>
                </section>

                <section id="wins-records-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Wins & Records</h2>
                    <HelpButton
                      sectionName="Wins & Records"
                      content="Track grants submitted, awarded, and declined, plus your success rate and total dollars requested and awarded over time."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-emerald-400">0</div>
                        <div className="text-slate-400 text-sm">Submitted</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-emerald-400">0</div>
                        <div className="text-slate-400 text-sm">Awarded</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-400">0</div>
                        <div className="text-slate-400 text-sm">Declined</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-emerald-400">$0</div>
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

      {isPro && (
        <ProductTour
          isActive={isTourActive}
          onComplete={completeTour}
          onSkip={skipTour}
        />
      )}
    </div>
  );
}