// =====================================================
// FISCAL SPONSOR MATCHER - REACT COMPONENT
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { FiscalSponsorMatch, FiscalSponsorSearchParams } from '@/types/fiscal-sponsor';

interface FiscalSponsorMatcherProps {
  // These would come from your questionnaire
  userFocusAreas: string[];
  userState?: string;
  userCountry?: string;
}

export default function FiscalSponsorMatcher({ 
  userFocusAreas, 
  userState, 
  userCountry 
}: FiscalSponsorMatcherProps) {
  const [matches, setMatches] = useState<FiscalSponsorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const supabase = createClientComponentClient();
  const LIMIT = 5;

  const fetchMatches = async (currentOffset: number) => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc('match_fiscal_sponsors', {
      user_focus_areas: userFocusAreas,
      user_state: userState || null,
      user_country: userCountry || 'USA',
      match_limit: LIMIT,
      match_offset: currentOffset,
    });

    if (error) {
      console.error('Error:', error);
      setLoading(false);
      return;
    }

    if (currentOffset === 0) {
      setMatches(data || []);
    } else {
      setMatches(prev => [...prev, ...(data || [])]);
    }
    
    setHasMore((data || []).length === LIMIT);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches(0);
  }, [userFocusAreas, userState]);

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchMatches(newOffset);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Recommended Fiscal Sponsors</h2>
        <p className="text-gray-600">
          Based on your project focus: {userFocusAreas.join(', ')}
        </p>
      </div>

      {loading && offset === 0 ? (
        <div className="text-center py-8">Loading matches...</div>
      ) : (
        <>
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div 
                key={match.sponsor_id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold">{match.sponsor_name}</h3>
                    <p className="text-gray-600">
                      {match.sponsor_city}, {match.sponsor_state}
                    </p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {match.match_score}% match
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {match.sponsor_focus_areas.map(area => (
                      <span 
                        key={area}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {match.match_reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-600">✓</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {match.sponsor_eligibility && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Eligibility:</strong> {match.sponsor_eligibility}
                  </p>
                )}

                {match.sponsor_website && (
                  <a
                    href={match.sponsor_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
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
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Show More Options'}
              </button>
            </div>
          )}

          {!hasMore && matches.length > 0 && (
            <p className="text-center text-gray-500">No more matches found</p>
          )}

          {matches.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No fiscal sponsors found matching your criteria. Try broadening your search.
            </div>
          )}
        </>
      )}
    </div>
  );
}
