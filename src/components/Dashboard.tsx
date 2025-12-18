import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grant, Profile } from '../types';
import { getStateName } from '../lib/states';
import { ExternalLink, LogOut, Lamp, Settings as SettingsIcon, Crown, Lock } from 'lucide-react';
import ProductTour from './ProductTour';
import HelpButton from './HelpButton';
import Settings from './Settings';
import Questionnaire from './Questionnaire';
import { useTour } from '../hooks/useTour';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

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
          // Show questionnaire if not completed
          if (!data.state || !data.org_type) {
            setShowQuestionnaire(true);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    // Only load grants if profile exists, has a state, AND questionnaire is completed
    if (!profile?.state || !profile?.org_type) {
      setLoading(false);
      return;
    }
    
    const loadGrants = async () => {
      try {
        setLoading(true);
        
        // Check if user is on free tier (no active subscription)
        const isFree = !profile.subscription_status || profile.subscription_status !== 'active';
        
        // Build query
        const query = supabase
          .from('grants')
          .select('*')
          .or(`state.eq.${profile.state},state.is.null`)
          .order('deadline', { ascending: true });
        
        // Only apply limit for free users (Pro gets unlimited)
        if (isFree) {
          query.limit(5);
        }
        
        const { data, error: err } = await query;

        if (err) throw err;
        setGrants(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load grants');
      } finally {
        setLoading(false);
      }
    };

    loadGrants();
  }, [profile?.state, profile?.org_type, profile?.subscription_status]);

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

  const handleQuestionnaireComplete = async () => {
    // Reload profile after questionnaire completion
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

  const isPro = profile?.subscription_status === 'active';
  const hasCompletedQuestionnaire = profile?.state && profile?.org_type;

  // Show questionnaire if not completed
  if (showQuestionnaire) {
    return <Questionnaire onComplete={handleQuestionnaireComplete} />;
  }

  // Free users cannot access Settings
  if (showSettings) {
    if (!isPro) {
      setShowSettings(false);
      return null;
    }
    return (
      <Settings
        onBack={() => setShowSettings(false)}
        onRestartTour={handleRestartTour}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your grants...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Grant Hustle</h1>
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
            {/* Settings Button - Pro Only */}
            {isPro && (
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            )}
            {/* Genie Lamp Icon - Pro Only */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Only show content if questionnaire is completed */}
        {hasCompletedQuestionnaire && (
          <>
            {/* Permanent Upgrade Banner for Free Users */}
            {!isPro && (
              <div className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-xl font-bold text-white">Unlock Full Access with Pro</h3>
                    </div>
                    <p className="text-slate-300 mb-3">
                      You're viewing 5 grant searches per month with basic information only. Upgrade to Pro to unlock:
                    </p>
                    <ul className="text-slate-300 space-y-1 mb-4 ml-4">
                      <li>• <strong>Unlimited grant searches</strong> with full application details</li>
                      <li>• Direct application links and contact information</li>
                      <li>• Track LOIs & applications with status updates</li>
                      <li>• Access templates library for proposals and budgets</li>
                      <li>• Manage fiscal sponsor relationships</li>
                      <li>• Calendar with automatic deadline tracking</li>
                      <li>• Wins & performance analytics</li>
                      <li>• Guided dashboard tour with The Grant Genie</li>
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

            {/* Grant Pool Section - FREE: Basic list only, PRO: Full details */}
            <section id="grant-pool-section" className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {isPro ? 'Grant Pool' : 'Grant Search Results'}
                  </h2>
                  <p className="text-slate-400">
                    {isPro ? (
                      `Showing all ${grants.length} matching grant opportunities for ${profile?.org_type} in ${profile && getStateName(profile.state)}`
                    ) : (
                      `Showing ${grants.length} of 5 monthly searches (basic info only)`
                    )}
                  </p>
                </div>
                {isPro && (
                  <HelpButton
                    sectionName="Grant Pool"
                    content="All your matched and saved grants live here. Use statuses like Researching, LOI, Application, Awarded, and Declined to track where each opportunity stands."
                  />
                )}
              </div>

              {grants.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                  <p className="text-slate-300 text-lg">No grants found yet.</p>
                  <p className="text-slate-400 mt-2">
                    Check back soon as we add more opportunities!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {grants.map((grant) => (
                    <div
                      key={grant.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/30 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {grant.title}
                          </h3>
                          {/* Free users: Brief description, then lock message */}
                          {!isPro && (
                            <>
                              <p className="text-slate-400 text-sm mb-2">{grant.description}</p>
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-500" />
                                <p className="text-slate-500 text-sm italic">
                                  Upgrade to Pro to see application details and apply
                                </p>
                              </div>
                            </>
                          )}
                          {/* Pro users: Full description */}
                          {isPro && (
                            <p className="text-slate-400 text-sm">{grant.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-emerald-400">
                            ${(grant.amount / 1000).toFixed(0)}K
                          </div>
                          <p className="text-slate-400 text-xs">Funding</p>
                        </div>
                      </div>

                      {/* Pro-only: Tags, deadline, apply button */}
                      {isPro && (
                        <>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {grant.org_types.map((type) => (
                              <span
                                key={type}
                                className="px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-full"
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-slate-400 text-sm">
                                Deadline:{' '}
                                <span className="text-white font-semibold">
                                  {new Date(grant.deadline).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                            <a
                              href={grant.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                            >
                              <span>View Grant</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* All sections below are PRO-ONLY */}
            {!isPro && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Pro Features Locked</h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Fiscal Sponsors, LOI Tracking, Application Management, Templates Library, Wins & Records, and Calendar are available exclusively to Pro subscribers.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition text-lg"
                >
                  Upgrade to Pro to Unlock All Features
                </button>
              </div>
            )}

            {/* PRO-ONLY SECTIONS */}
            {isPro && (
              <>
                {/* Fiscal Sponsor Partners Section */}
                <section id="fiscal-sponsors-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Fiscal Sponsor Partners</h2>
                    <HelpButton
                      sectionName="Fiscal Sponsor Partners"
                      content="See which fiscal sponsor is connected to each grant. Keep those relationships and requirements up to date in one place."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-400">No fiscal sponsors added yet.</p>
                  </div>
                </section>

                {/* LOIs & Applications Section */}
                <section id="lois-applications-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">LOIs & Applications</h2>
                    <HelpButton
                      sectionName="LOIs & Applications"
                      content="Track every LOI and full application with status, due dates, submitted dates, and linked documents all in one place."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-400">No applications in progress yet.</p>
                  </div>
                </section>

                {/* Templates Library Section */}
                <section id="templates-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Templates Library</h2>
                    <HelpButton
                      sectionName="Templates Library"
                      content="Best-practice examples for LOIs, full proposals, budgets, and reports. Start from a template, customize it, and attach it to your grant."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-400">Templates coming soon.</p>
                  </div>
                </section>

                {/* Wins & Records Section */}
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

                {/* Calendar Section */}
                <section id="calendar-section" className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Calendar</h2>
                    <HelpButton
                      sectionName="Calendar"
                      content="LOI, application, and reporting deadlines automatically added as you update grants. Plan your workload and avoid last-minute rushes."
                    />
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
                    <p className="text-slate-400">No upcoming deadlines.</p>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>

      {/* Product Tour - PRO ONLY */}
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