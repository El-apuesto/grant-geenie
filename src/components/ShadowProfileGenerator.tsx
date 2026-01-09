import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types';
import { Users, Plus, Trash2, CheckCircle, Search, Edit2 } from 'lucide-react';
import { US_STATES } from '../lib/states';

interface ShadowProfileGeneratorProps {
  onProfileSelect: (profileId: string) => void;
  currentProfileId: string | null;
}

interface ShadowProfile {
  id: string;
  name: string;
  organization_type: string; // Reverted to organization_type
  state: string;
  focus_area: string;
}

const ORG_TYPES = ['Nonprofit', 'Small Business', 'Local Government', 'School/Education', 'Artist/Creator', 'Other'];
const FOCUS_AREAS = ['Arts & Culture', 'Education', 'Environment', 'Health', 'Social Justice', 'Technology', 'Community Development', 'Infrastructure'];

export default function ShadowProfileGenerator({ onProfileSelect, currentProfileId }: ShadowProfileGeneratorProps) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ShadowProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization_type: '', // Reverted to organization_type
    state: '',
    focus_area: ''
  });

  // Simulated data load - in real app would fetch from 'shadow_profiles' table
  // For demo, we'll just use local state since we haven't created that table yet
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.organization_type || !formData.state) return;

    // Simulate saving
    const newProfile: ShadowProfile = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    };

    setProfiles([...profiles, newProfile]);
    setFormData({ name: '', organization_type: '', state: '', focus_area: '' });
    setShowForm(false);
    onProfileSelect(newProfile.id);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Client Profiles
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage grant searches for different clients or projects.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Client</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6 animate-fade-in">
          <h3 className="text-white font-medium mb-4">New Client Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Client Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                placeholder="e.g. City of Madison"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Org Type</label>
              <select
                value={formData.organization_type}
                onChange={e => setFormData({...formData, organization_type: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
              >
                <option value="">Select Type...</option>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">State</label>
              <select
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
              >
                <option value="">Select State...</option>
                {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Primary Focus</label>
              <select
                value={formData.focus_area}
                onChange={e => setFormData({...formData, focus_area: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
              >
                <option value="">Select Focus...</option>
                {FOCUS_AREAS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Create Profile
            </button>
          </div>
        </form>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-700 rounded-lg">
          <p className="text-slate-500 text-sm">No client profiles yet. Add one to start searching for specific clients.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {profiles.map(profile => (
            <div 
              key={profile.id}
              onClick={() => onProfileSelect(profile.id)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center
                ${currentProfileId === profile.id 
                  ? 'bg-emerald-900/20 border-emerald-500/50' 
                  : 'bg-slate-800 border-slate-700 hover:border-slate-500'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentProfileId === profile.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`font-medium ${currentProfileId === profile.id ? 'text-emerald-400' : 'text-white'}`}>
                    {profile.name}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {profile.organization_type} • {profile.state} • {profile.focus_area}
                  </p>
                </div>
              </div>
              
              {currentProfileId === profile.id && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-500 font-medium px-2 py-1 bg-emerald-500/10 rounded">Active</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}