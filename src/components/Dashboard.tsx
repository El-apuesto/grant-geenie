import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grant, Profile } from '../types';
import { getStateName } from '../lib/states';
import { ExternalLink, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (profile?.state) {
      loadGrants(profile.state);
    }
  }, [profile]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (err) throw err;
      if (data) setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    }
  };

  const loadGrants = async (state: string) => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('grants')
        .select('*')
        .or(`state.eq.${state},state.is.null`)
        .order('deadline', { ascending: true })
        .limit(20);

      if (err) throw err;
      setGrants(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load grants');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

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
            <h1 className="text-2xl font-bold text-white">Grant Geenie</h1>
            <p className="text-slate-400 text-sm">
              {profile && `${getStateName(profile.state)} • ${profile.org_type}`}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Grants Matching Your Profile
          </h2>
          <p className="text-slate-400">
            Showing {grants.length} opportunities for {profile?.org_type} in {profile && getStateName(profile.state)}
          </p>
        </div>

        {grants.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <p className="text-slate-300 text-lg">No grants found yet.</p>
            <p className="text-slate-400 mt-2">Check back soon as we add more opportunities!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {grants.map(grant => (
              <div
                key={grant.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/30 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{grant.title}</h3>
                    <p className="text-slate-400 text-sm">{grant.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-emerald-400">
                      ${(grant.amount / 1000).toFixed(0)}K
                    </div>
                    <p className="text-slate-400 text-xs">Funding</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {grant.org_types.map(type => (
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
                      Deadline: <span className="text-white font-semibold">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
