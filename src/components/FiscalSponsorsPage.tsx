// =====================================================
// FISCAL SPONSORS PAGE
// Full-page dedicated to fiscal sponsor matching
// =====================================================

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { Building2 } from 'lucide-react';
import FiscalSponsorMatcher from './FiscalSponsorMatcher';

interface FiscalSponsorsPageProps {
  onBack?: () => void;
}

export default function FiscalSponsorsPage({ onBack }: FiscalSponsorsPageProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data as Profile);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-emerald-500" />
            <h1 className="text-3xl font-bold text-white">Fiscal Sponsor Matcher</h1>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading your profile...</p>
          </div>
        ) : !profile || !profile.questionnaire_completed ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile First</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Please complete the eligibility questionnaire to see personalized fiscal sponsor recommendations.
            </p>
          </div>
        ) : (
          <FiscalSponsorMatcher userProfile={profile} isPro={true} />
        )}
      </div>
    </div>
  );
}
