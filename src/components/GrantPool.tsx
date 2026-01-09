import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { analytics } from '../lib/analytics';
import { Grant } from '../types';
import { ExternalLink, Search, DollarSign, Calendar, Bookmark, Lock, Crown, Sparkles, Filter, AlertCircle } from 'lucide-react';

interface GrantPoolProps {
  isPro: boolean;
  profile: any;
}

export default function GrantPool({ isPro, profile }: GrantPoolProps) {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [savedGrantIds, setSavedGrantIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'amount'>('deadline');
  const [showAllGrants, setShowAllGrants] = useState(false);
  const [useSearchOnly, setUseSearchOnly] = useState(false);

  useEffect(() => {
    if (user) {
      loadGrants();
      loadSavedGrants();
    }
  }, [user, profile, showAllGrants, useSearchOnly]);

  // Helper: Check if grant deadline has passed
  const isGrantExpired = (closeDate: string | null, isRolling: boolean): boolean => {
    if (isRolling) return false; // Rolling deadlines never expire
    if (!closeDate || closeDate === '') return false; // TBD is considered active
    
    try {
      const parts = closeDate.split('/');
      if (parts.length === 3) {
        const grantDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Compare dates only
        return grantDate < today;
      }
    } catch (e) {
      console.error('Date parsing error:', e);
    }
    return false;
  };

  const loadGrants = async () => {
    try {
      setLoading(true);
      
      const query = supabase
        .from('grants')
        .select('*')
        .eq('is_active', true);  // Only show active grants
      
      // Sort by close_date or award_ceiling
      if (sortBy === 'deadline') {
        query.order('close_date', { ascending: true, nullsFirst: false });
      } else {
        query.order('award_ceiling', { ascending: false, nullsFirst: false });
      }
      
      // Free users: limit to 20
      if (!isPro) {
        query.limit(20);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Grants query error:', error);
        throw error;
      }
      
      let filtered = data || [];
      
      // ===== CRITICAL: Filter out EXPIRED grants =====
      filtered = filtered.filter(grant => !isGrantExpired(grant.close_date, grant.is_rolling));
      console.log(`Removed ${(data?.length || 0) - filtered.length} expired grants`);
      
      // If user wants search-only mode (Pro feature), skip eligibility filters
      if (useSearchOnly && isPro) {
        console.log(`Pro search mode: ${filtered.length} active grants (unfiltered)`);
        setGrants(filtered);
        setLoading(false);
        return;
      }
      
      // Otherwise apply smart filters based on questionnaire
      if (!showAllGrants) {
        // FILTER 1: Under $250k by default (most relevant for small orgs/artists)
        filtered = filtered.filter(grant => {
          const ceiling = parseFloat(grant.award_ceiling?.replace(/[^0-9.-]+/g, '') || '0');
          return ceiling <= 250000;
        });
        
        // FILTER 2: Match user's funding amount range
        if (profile?.grant_amount && Array.isArray(profile.grant_amount)) {
          filtered = filtered.filter(grant => {
            const ceiling = parseFloat(grant.award_ceiling?.replace(/[^0-9.-]+/g, '') || '0');
            const floor = parseFloat(grant.award_floor?.replace(/[^0-9.-]+/g, '') || '0');
            
            return profile.grant_amount.some((range: string) => {
              if (range === 'Under $10,000') return ceiling <= 10000;
              if (range === '$10,000 - $50,000') return ceiling >= 10000 && floor <= 50000;
              if (range === '$50,000 - $100,000') return ceiling >= 50000 && floor <= 100000;
              if (range === '$100,000 - $250,000') return ceiling >= 100000 && floor <= 250000;
              if (range === 'Over $250,000') return floor >= 250000;
              return true;
            });
          });
        }
        
        // FILTER 3: Match user's primary fields (enhanced keyword search)
        if (profile?.primary_fields && Array.isArray(profile.primary_fields) && profile.primary_fields.length > 0) {
          const keywords = profile.primary_fields.flatMap((field: string) => {
            const fieldMap: { [key: string]: string[] } = {
              'Arts & Culture': ['art', 'arts', 'culture', 'cultural', 'music', 'theater', 'theatre', 'museum', 'gallery', 'dance', 'film', 'creative', 'humanities', 'artist'],
              'Environment': ['environment', 'environmental', 'climate', 'sustainability', 'sustainable', 'conservation', 'green', 'ecology', 'wildlife', 'renewable', 'clean energy', 'nature'],
              'Health': ['health', 'healthcare', 'medical', 'wellness', 'mental health', 'public health', 'hospital', 'clinic', 'disease', 'nutrition', 'behavioral'],
              'Education': ['education', 'educational', 'school', 'student', 'learning', 'teaching', 'academic', 'literacy', 'scholarship', 'STEM', 'college', 'university', 'youth'],
              'Housing': ['housing', 'homeless', 'shelter', 'affordable housing', 'community development', 'neighborhood', 'urban development', 'residential'],
              'Technology': ['technology', 'tech', 'digital', 'innovation', 'STEM', 'computer', 'software', 'internet', 'AI', 'data', 'cyber'],
              'Social Justice': ['justice', 'equity', 'civil rights', 'social justice', 'inclusion', 'diversity', 'human rights', 'community', 'empowerment', 'advocacy'],
            };
            return fieldMap[field] || [field.toLowerCase()];
          });
          
          filtered = filtered.filter(grant => {
            const searchText = `${grant.title} ${grant.description}`.toLowerCase();
            return keywords.some((keyword: string) => searchText.includes(keyword));
          });
        }
        
        // FILTER 4: Weed out grants requiring 501(c)(3) if user doesn't have fiscal sponsor
        if (profile?.fiscal_sponsor === 'No') {
          filtered = filtered.filter(grant => {
            const searchText = `${grant.title} ${grant.description} ${grant.eligibility || ''}`.toLowerCase();
            const requires501c3 = 
              searchText.includes('501(c)(3)') || 
              searchText.includes('501c3') ||
              searchText.includes('nonprofit organization') ||
              searchText.includes('tax-exempt') ||
              searchText.includes('charitable organization');
            return !requires501c3; // Exclude if requires 501c3
          });
        }
      }
      
      console.log(`Loaded ${filtered.length} grants (filtered from ${data?.length || 0})`);
      setGrants(filtered);
    } catch (err) {
      console.error('Failed to load grants:', err);
    } finally {
      setLoading(false);
    }
  };

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
        await supabase
          .from('saved_grants')
          .delete()
          .eq('user_id', user.id)
          .eq('grant_id', grantId);
        
        analytics.trackGrantAction('unfavorite', grantId);
        
        setSavedGrantIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(grantId);
          return newSet;
        });
      } else {
        await supabase
          .from('saved_grants')
          .insert({ user_id: user.id, grant_id: grantId });
        
        analytics.trackGrantAction('favorite', grantId);
        
        setSavedGrantIds(prev => new Set([...prev, grantId]));
      }
    } catch (err) {
      console.error('Error toggling save grant:', err);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const resultCount = getFilteredGrants().length;
      analytics.trackSearch(query, resultCount);
    }
  };

  const handleGrantClick = (grantId: string) => {
    analytics.trackGrantAction('view', grantId);
  };

  const handleUpgradeClick = () => {
    analytics.trackEvent({
      category: 'Conversion',
      action: 'upgrade_click',
      label: 'grant_pool_banner',
    });
  };

  const formatCurrency = (amountStr: string) => {
    const amount = parseFloat(amountStr?.replace(/[^0-9.-]+/g, '') || '0');
    if (amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDeadline = (closeDate: string | null, isRolling: boolean) => {
    if (isRolling) return 'Rolling';
    if (!closeDate || closeDate === '') return 'TBD';
    try {
      const parts = closeDate.split('/');
      if (parts.length === 3) {
        const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (e) {
      console.error('Date parsing error:', e);
    }
    return closeDate;
  };

  const getFilteredGrants = () => {
    let filtered = activeTab === 'saved'
      ? grants.filter(g => savedGrantIds.has(g.id))
      : grants;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(query) ||
        g.agency_name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.opportunity_number.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const displayedGrants = getFilteredGrants();
  const savedCount = grants.filter(g => savedGrantIds.has(g.id)).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Search className="w-16 h-16 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white">
            {isPro ? 'Grants Matched For You' : 'Grant Search Results'}
          </h1>
        </div>
        
        {/* Pro Search Mode Toggle */}
        {isPro && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => {
                setUseSearchOnly(false);
                setShowAllGrants(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                !useSearchOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Smart Filters
              </div>
            </button>
            <button
              onClick={() => setUseSearchOnly(true)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                useSearchOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search All (Pro)
              </div>
            </button>
          </div>
        )}
        
        {/* Smart Filter Notice */}
        {!useSearchOnly && !showAllGrants && profile?.primary_fields && (
          <div className="mb-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Filter className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-emerald-300 text-sm">
                  <strong>Smart Filters Active:</strong> Showing grants under $250k matching your profile: {profile.primary_fields.join(', ')}
                  {profile.fiscal_sponsor === 'No' && ' (excluding 501c3-only grants)'}
                </p>
                <button
                  onClick={() => setShowAllGrants(true)}
                  className="text-emerald-400 text-sm underline hover:text-emerald-300 mt-1"
                >
                  Show all grants →
                </button>
              </div>
            </div>
          </div>
        )}

        {showAllGrants && !useSearchOnly && (
          <div className="mb-4 p-4 bg-slate-800 border border-slate-600 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 text-sm">Showing all grants (unfiltered)</p>
              <button
                onClick={() => setShowAllGrants(false)}
                className="text-emerald-400 text-sm hover:text-emerald-300"
              >
                ← Use smart filters
              </button>
            </div>
          </div>
        )}

        {useSearchOnly && (
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-blue-300 text-sm">
                  <strong>Pro Search Mode:</strong> All active grants shown. Use search bar below to find specific opportunities.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {useSearchOnly ? 'All Grants' : 'Matched Grants'}
            </div>
          </button>
          {isPro && savedCount > 0 && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === 'saved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" fill="currentColor" />
                Saved Grants ({savedCount})
              </div>
            </button>
          )}
        </div>

        <p className="text-slate-400">
          {isPro ? (
            activeTab === 'saved'
              ? `${displayedGrants.length} saved grants`
              : `${displayedGrants.length.toLocaleString()} grants ${useSearchOnly ? '(all active)' : 'matched to your profile'}`
          ) : (
            `Showing ${displayedGrants.length} of your 20 monthly free searches`
          )}
        </p>
      </div>

      {/* Free Tier Upgrade Banner */}
      {!isPro && (
        <div className="mb-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Unlock Full Access with Pro</h3>
              </div>
              <p className="text-slate-300 mb-3">
                You're viewing 20 grants with limited information. Upgrade to Pro to unlock:
              </p>
              <ul className="text-slate-300 space-y-1 mb-4 ml-4">
                <li>• <strong>Unlimited matched grants</strong> personalized for you</li>
                <li>• <strong>Advanced search</strong> across all 79,000+ grants</li>
                <li>• Save grants & direct application links</li>
              </ul>
              <button
                onClick={() => {
                  handleUpgradeClick();
                  window.open('https://buy.stripe.com/3cI5kD5VteGzciEdez7AI0b', '_blank');
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
              >
                Upgrade to Pro Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={isPro ? "Search grants by title, agency, or keywords..." : "🔒 Pro: Search all 79K+ grants"}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={!isPro}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'deadline' | 'amount')}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="deadline">Sort by Deadline</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {/* Grants List */}
      {displayedGrants.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          {activeTab === 'saved' ? (
            <>
              <Bookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-lg mb-2">No saved grants yet</p>
              <p className="text-slate-400">Click the bookmark icon on grants to save them for later</p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
              >
                Browse Matched Grants
              </button>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-lg mb-2">No grants found</p>
              <p className="text-slate-400 mb-4">Try adjusting your search or showing all grants</p>
              {!showAllGrants && !useSearchOnly && (
                <button
                  onClick={() => setShowAllGrants(true)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                >
                  Show All Grants
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedGrants.map((grant) => {
            const isSaved = savedGrantIds.has(grant.id);
            const applyUrl = grant.apply_url || `https://www.grants.gov/search-results-detail/${grant.opportunity_number}`;
            
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
                      {isPro && (
                        <button
                          onClick={() => toggleSaveGrant(grant.id)}
                          className="p-2 rounded-lg transition hover:bg-slate-700"
                          title={isSaved ? 'Remove from saved' : 'Save for later'}
                        >
                          <Bookmark 
                            className={`w-5 h-5 ${
                              isSaved ? 'text-emerald-500' : 'text-slate-400'
                            }`}
                            fill={isSaved ? 'currentColor' : 'none'}
                          />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                      <span className="font-medium">{grant.agency_name}</span>
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs">
                        {grant.opportunity_number}
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
                      {formatCurrency(grant.award_floor)} - {formatCurrency(grant.award_ceiling)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>{formatDeadline(grant.close_date, grant.is_rolling)}</span>
                  </div>
                </div>

                {isPro ? (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleGrantClick(grant.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    View on Grants.gov
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
    </div>
  );
}
