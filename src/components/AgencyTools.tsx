import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Trash2, Edit2, Search, Sparkles, Briefcase } from 'lucide-react';
import EnterpriseGrantWriter from './EnterpriseGrantWriter';

interface ShadowProfile {
  id: string;
  name: string;
  organization_type: string;
  state: string;
  focus_area: string;
  created_at: string;
}

interface AgencyToolsProps {
  isPro: boolean;
}

export default function AgencyTools({ isPro }: AgencyToolsProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'clients' | 'grant-writer'>('grant-writer');
  const [profiles, setProfiles] = useState<ShadowProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    organization_type: 'Nonprofit',
    state: '',
    focus_area: 'Arts & Culture'
  });

  useEffect(() => {
    if (isPro) {
      loadProfiles();
    }
  }, [isPro]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('shadow_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!newProfile.name || !newProfile.state) {
      alert('Please fill in name and state');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('shadow_profiles')
        .insert([{
          user_id: user?.id,
          ...newProfile
        }])
        .select()
        .single();

      if (error) throw error;
      
      setProfiles([data, ...profiles]);
      setShowNewProfile(false);
      setNewProfile({ name: '', organization_type: 'Nonprofit', state: '', focus_area: 'Arts & Culture' });
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Error: ' + (error as any).message);
    }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('Delete this client profile?')) return;

    try {
      const { error } = await supabase
        .from('shadow_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProfiles(profiles.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  if (!isPro) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Enterprise Feature</h2>
          <p className="text-slate-400 mb-6">
            Agency Tools with AI Grant Writer is available for Enterprise subscribers.
          </p>
          <button
            onClick={() => alert('Contact sales@granthustle.com for Enterprise access')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            Contact Sales
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold text-white">Agency Tools</h1>
        </div>
        <div className="flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('grant-writer')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === 'grant-writer'
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI Grant Writer
            </div>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === 'clients'
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Client Profiles
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'grant-writer' ? (
        <EnterpriseGrantWriter />
      ) : (
        <div className="space-y-6">
          {/* Client Management Header */}
          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              Manage multiple client profiles to search grants on their behalf
            </p>
            <button
              onClick={() => setShowNewProfile(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
            >
              <Plus className="w-4 h-4" />
              New Client
            </button>
          </div>

          {/* New Profile Form */}
          {showNewProfile && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Create Client Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Client Name *</label>
                  <input
                    type="text"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="ABC Nonprofit"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Organization Type *</label>
                  <select
                    value={newProfile.organization_type}
                    onChange={(e) => setNewProfile({ ...newProfile, organization_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option>Nonprofit</option>
                    <option>Small Business</option>
                    <option>Artist/Creator</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">State *</label>
                  <input
                    type="text"
                    value={newProfile.state}
                    onChange={(e) => setNewProfile({ ...newProfile, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Focus Area *</label>
                  <select
                    value={newProfile.focus_area}
                    onChange={(e) => setNewProfile({ ...newProfile, focus_area: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option>Arts & Culture</option>
                    <option>Education</option>
                    <option>Environment</option>
                    <option>Health</option>
                    <option>Social Justice</option>
                    <option>Technology</option>
                    <option>Community Development</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createProfile}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                >
                  Create Profile
                </button>
                <button
                  onClick={() => setShowNewProfile(false)}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Client Profiles List */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No client profiles yet</p>
              <button
                onClick={() => setShowNewProfile(true)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
              >
                Create Your First Client
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{profile.name}</h4>
                      <p className="text-slate-400 text-sm">{profile.organization_type}</p>
                    </div>
                    <button
                      onClick={() => deleteProfile(profile.id)}
                      className="text-slate-400 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500">State:</span>
                      {profile.state}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-slate-500">Focus:</span>
                      {profile.focus_area}
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Switch to this profile to search grants for: ' + profile.name)}
                    className="w-full mt-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Search Grants
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}