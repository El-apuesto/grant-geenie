import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Grant, Profile } from '../types';
import { Filter, Search, Bookmark, ExternalLink, Calendar, DollarSign, Building2, User, SlidersHorizontal } from 'lucide-react';

interface GrantPoolProps {
  isPro: boolean;
  profile: Profile | null;
}

export default function GrantPool({ isPro, profile }: GrantPoolProps) {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedGrantIds, setSavedGrantIds] = useState<Set<string>>(new Set());
  
  // Agency Search State
  const [agencyKeyword, setAgencyKeyword] = useState('');
  const [searchOnlyKeyword, setSearchOnlyKeyword] = useState(false);
  // Reverted to organization_type
  const isAgency = profile?.organization_type === 'Agency';

  useEffect(() => {
    if (profile) {
      loadSavedGrants();
      loadGrants();
    }
  }, [profile]); // Reload when profile changes

  const loadSavedGrants = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('saved_grants')
      .select('opportunity_id')
      .eq('user_id', profile.id);
    
    if (data) {
      setSavedGrantIds(new Set(data.map(g => g.opportunity_id)));
    }
  };

  const loadGrants = async () => {
    if (!profile) return;
    setLoading(true);

    try {
      let query = supabase.from('grants').select('*');

      // AGENCY OVERRIDE: If Agency + "Search Only Keyword" is checked, SKIP profile filters
      const skipProfileFilters = isAgency && searchOnlyKeyword && agencyKeyword.trim().length > 0;

      if (!skipProfileFilters) {
        // Standard matching logic
        if (profile.state) {
            // Updated logic: Match state-specific grants OR federal (state is null/US)
            query = query.or(`state.eq.${profile.state},state.is.null,state.eq.US`);
        }
      }

      // AGENCY KEYWORD SEARCH
      if (isAgency && agencyKeyword.trim()) {
        const term = `%${agencyKeyword.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term}`);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setGrants(data || []);
    } catch (error) {
      console.error('Error loading grants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgencySearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadGrants();
  };

  const handleSaveGrant = async (grant: Grant) => {
    if (!profile) return;
    if (savedGrantIds.has(grant.opportunity_id)) return;

    setSavingId(grant.opportunity_id);
    try {
      const { error } = await supabase.from('saved_grants').insert({
        user_id: profile.id,
        opportunity_id: grant.opportunity_id,
        opportunity_title: grant.title,
        agency_name: grant.agency_name,
        description: grant.description,
        close_date: grant.close_date,
        award_ceiling: grant.award_ceiling ? parseFloat(grant.award_ceiling.replace(/[^0-9.]/g, '')) : 0,
      });

      if (error) throw error;
      setSavedGrantIds(prev => new Set(prev).add(grant.opportunity_id));
    } catch (error) {
      console.error('Error saving grant:', error);
      alert('Failed to save grant');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Grant Pool</h2>
        <p className="text-slate-400">
          {isAgency 
            ? 'Search and filter grants for your clients.' 
            : 'Curated matches based on your profile.'}
        </p>
      </div>

      {/* AGENCY SEARCH BAR */}
      {isAgency && (
        <form onSubmit={handleAgencySearch} className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={agencyKeyword}
                onChange={(e) => setAgencyKeyword(e.target.value)}
                placeholder="Search keywords (e.g. 'rural fire truck', 'historic preservation')..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={searchOnlyKeyword}
                  onChange={(e) => setSearchOnlyKeyword(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                Search ONLY keyword (Ignore profile filters)
              </label>
              
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-slate-800 rounded-lg border border-slate-700" />
          ))}
        </div>
      ) : grants.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No grants found</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            {isAgency && searchOnlyKeyword 
              ? `No grants matched "${agencyKeyword}". Try a different term.`
              : 'Try adjusting your profile settings or check back later for new opportunities.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {grants.map((grant) => (
            <div key={grant.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400 text-xs font-medium px-2 py-0.5 bg-emerald-900/30 rounded border border-emerald-900/50">
                      Match
                    </span>
                    <span className="text-slate-400 text-xs px-2 py-0.5 bg-slate-700/50 rounded border border-slate-600">
                      {grant.agency_code}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                    {grant.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {grant.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      {grant.agency_name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      {grant.award_ceiling ? `$${parseInt(grant.award_ceiling).toLocaleString()}` : 'Variable'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Due: {grant.close_date ? new Date(grant.close_date).toLocaleDateString() : 'Rolling'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSaveGrant(grant)}
                    disabled={savedGrantIds.has(grant.opportunity_id) || savingId === grant.opportunity_id}
                    className={`
                      p-2 rounded-lg border transition-colors
                      ${savedGrantIds.has(grant.opportunity_id)
                        ? 'bg-emerald-600 border-emerald-500 text-white' 
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white hover:border-emerald-500'}
                    `}
                    title={savedGrantIds.has(grant.opportunity_id) ? 'Saved' : 'Save Grant'}
                  >
                    <Bookmark className={`w-5 h-5 ${savedGrantIds.has(grant.opportunity_id) ? 'fill-current' : ''}`} />
                  </button>
                  {grant.apply_url && (
                    <a
                      href={grant.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:text-white hover:border-emerald-500 transition-colors"
                      title="View on Grants.gov"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}