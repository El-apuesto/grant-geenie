// =====================================================
// FISCAL SPONSOR MATCHER - REACT COMPONENT
// Auto-reads from user profile (primary_fields, state)
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { FiscalSponsorMatch } from '../types/fiscal-sponsor';
import { Profile } from '../types';

interface FiscalSponsorMatcherProps {
  isPro?: boolean;
  userProfile?: Profile | null;
}

export default function FiscalSponsorMatcher({ 
  isPro = true,
  userProfile: externalProfile = null,
}: FiscalSponsorMatcherProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<Profile | null>(externalProfile);
  const [matches, setMatches] = useState<FiscalSponsorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const LIMIT = 5;

  // Load user profile if not provided
  useEffect(() => {
    if (!user || externalProfile) return;
    
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        setUserProfile(data as Profile);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    
    loadProfile();
  }, [user, externalProfile]);

  // Map primary_fields to fiscal sponsor focus areas
  const mapFieldsToFocusAreas = (primaryFields: string[]): string[] => {
    const mapping: Record<string, string[]> = {
      'Arts & Culture': ['Arts', 'Culture', 'Music', 'Dance', 'Theater'],
      'Environment': ['Environment', 'Conservation', 'Climate'],
      'Health': ['Health', 'Medical', 'Public Health'],
      'Education': ['Education', 'Youth'],
      'Housing': ['Housing', 'Community Development'],
      'Technology': ['Technology', 'Innovation'],
      'Social Justice': ['Social Justice', 'Human Rights', 'Advocacy'],
    };
    
    const areas = new Set<string>();
    primaryFields.forEach(field => {
      const mapped = mapping[field] || [field];
      mapped.forEach(area => areas.add(area));
    });
    
    return Array.from(areas);
  };

  const fetchMatches = async (currentOffset: number) => {
    if (!userProfile) return;
    
    setLoading(true);
    
    // Get focus areas from primary_fields
    const primaryFields = userProfile.primary_fields || [];
    const focusAreas = mapFieldsToFocusAreas(primaryFields);
    
    try {
      const { data, error } = await supabase.rpc('match_fiscal_sponsors', {
        user_focus_areas: focusAreas.length > 0 ? focusAreas : ['General'],
        user_state: userProfile.state || null,
        user_country: 'USA',
        match_limit: LIMIT,
        match_offset: currentOffset,
      });

      if (error) {
        console.error('Error matching fiscal sponsors:', error);
        setLoading(false);
        return;
      }

      if (currentOffset === 0) {
        setMatches(data || []);
      } else {
        setMatches(prev => [...prev, ...(data || [])]);
      }
      
      setHasMore((data || []).length === LIMIT);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches when profile is ready
  useEffect(() => {
    if (userProfile) {
      fetchMatches(0);
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchMatches(newOffset);
  };

  const primaryFields = userProfile?.primary_fields || [];
  const focusAreas = mapFieldsToFocusAreas(primaryFields);

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Complete the questionnaire to see matching fiscal sponsors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Recommended Fiscal Sponsors</h2>
        <p className="text-slate-400">
          Based on your focus: {focusAreas.slice(0, 3).join(', ')}
          {focusAreas.length > 3 && ` and ${focusAreas.length - 3} more`}
        </p>
      </div>

      {loading && offset === 0 ? (
        <div className="text-center py-8">Loading matches...</div>
      ) : (
        <>
          <div className="space-y-4">
            {matches.map((match) => (
              <div 
                key={match.sponsor_id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/30 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{match.sponsor_name}</h3>
                    <p className="text-slate-400 text-sm">
                      {match.sponsor_city}, {match.sponsor_state}
                    </p>
                  </div>
                  <div className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    {match.match_score}% match
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {match.sponsor_focus_areas.map(area => (
                      <span 
                        key={area}
                        className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {match.match_reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {match.sponsor_fee_structure && (
                  <p className="text-sm text-slate-400 mb-3">
                    <strong>Fee:</strong> {match.sponsor_fee_structure}
                  </p>
                )}

                {match.sponsor_eligibility && (
                  <p className="text-sm text-slate-400 mb-3">
                    <strong>Eligibility:</strong> {match.sponsor_eligibility}
                  </p>
                )}

                {match.sponsor_website && (
                  <a
                    href={match.sponsor_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-medium transition"
                  >
                    Learn More & Apply
                  </a>
                )}
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                {loading ? 'Loading...' : 'Show More Options'}
              </button>
            </div>
          )}

          {!hasMore && matches.length > 0 && (
            <p className="text-center text-slate-500">No more matches found</p>
          )}

          {matches.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-500">
              No fiscal sponsors found matching your criteria. Try updating your profile.
            </div>
          )}
        </>
      )}
    </div>
  );
}
