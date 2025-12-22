import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grant } from '../types';
import { ExternalLink, Search, DollarSign, Calendar, Bookmark, Lock, Crown, Filter, X } from 'lucide-react';

interface GrantPoolProps {
  isPro: boolean;
  profile: any;
}

export default function GrantPool({ isPro, profile }: GrantPoolProps) {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [savedGrantIds, setSavedGrantIds] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'amount'>('deadline');

  useEffect(() => {
    if (user) {
      loadGrants();
      loadSavedGrants();
    }
  }, [user, profile]);

  const loadGrants = async () => {
    try {
      setLoading(true);
      
      const query = supabase
        .from('grants')
        .select('*')
        .eq('is_active', true)
        .order(sortBy === 'deadline' ? 'deadline' : 'award_max', { ascending: sortBy === 'deadline' });
      
      if (!isPro) {
        query.limit(5);
      } else {
        query.limit(10000);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setGrants(data || []);
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

  const getFilteredGrants = () => {
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isPro ? 'Grant Pool' : 'Grant Search Results'}
        </h1>
        <p className="text-slate-400">
          {isPro ? (
            `${displayedGrants.length.toLocaleString()} ${showSavedOnly ? 'saved' : 'active'} grant opportunities`
          ) : (
            `Showing ${displayedGrants.length} of your 5 monthly free searches`
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
                You're viewing 5 grants with limited information. Upgrade to Pro to unlock:
              </p>
              <ul className="text-slate-300 space-y-1 mb-4 ml-4">
                <li>• <strong>8,000+ grants</strong> with full details</li>
                <li>• Save grants & direct application links</li>
                <li>• Advanced search and filtering</li>
              </ul>
              <button
                onClick={() => window.open('https://buy.stripe.com/test_4gw5lmdQa3S42NW4gi', '_blank')}
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
            placeholder="Search grants by title, funder, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
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
          {savedCount > 0 && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                showSavedOnly
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={showSavedOnly ? 'currentColor' : 'none'} />
              Saved ({savedCount})
            </button>
          )}
        </div>
      </div>

      {/* Grants List */}
      {displayedGrants.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 text-lg mb-2">
            {showSavedOnly ? 'No saved grants yet.' : 'No matching grants found.'}
          </p>
          <p className="text-slate-400">
            {showSavedOnly ? 'Click the bookmark icon on grants to save them.' : 'Try adjusting your search or filters.'}
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
                      {isPro && (
                        <button
                          onClick={() => toggleSaveGrant(grant.id)}
                          className="p-2 rounded-lg transition hover:bg-slate-700"
                          title={isSaved ? 'Unsave grant' : 'Save grant'}
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
    </div>
  );
}