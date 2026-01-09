import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Trash2, CheckCircle, Search, Edit2, Loader2, AlertCircle } from 'lucide-react';
import { US_STATES } from '../lib/states';

interface ShadowProfileGeneratorProps {
  onProfileSelect: (profileId: string) => void;
  currentProfileId: string | null;
}

interface ShadowProfile {
  id: string;
  name: string;
  organization_type: string;
  state: string;
  focus_area: string;
  created_at?: string;
}

const ORG_TYPES = ['Nonprofit', 'Small Business', 'Local Government', 'School/Education', 'Artist/Creator', 'Other'];
const FOCUS_AREAS = ['Arts & Culture', 'Education', 'Environment', 'Health', 'Social Justice', 'Technology', 'Community Development', 'Infrastructure'];

export default function ShadowProfileGenerator({ onProfileSelect, currentProfileId }: ShadowProfileGeneratorProps) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ShadowProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    organization_type: '',
    state: '',
    focus_area: ''
  });

  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('shadow_profiles')
        .select('*')
        .eq('user_id', user?.id) // Explicitly filter by user_id for safety
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      setError('Failed to load profiles. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to create a profile.');
      return;
    }
    
    if (!formData.name || !formData.organization_type || !formData.state) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        name: formData.name,
        organization_type: formData.organization_type,
        state: formData.state,
        focus_area: formData.focus_area
      };

      console.log('Creating profile with:', payload);

      const { data, error } = await supabase
        .from('shadow_profiles')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Profile created successfully:', data);

      setProfiles([data, ...profiles]);
      setFormData({ name: '', organization_type: '', state: '', focus_area: '' });
      setShowForm(false);
      onProfileSelect(data.id);
    } catch (error: any) {
      console.error('Full creation error:', error);
      setError(error.message || 'Failed to create profile. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this profile?')) return;

    try {
      const { error } = await supabase
        .from('shadow_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfiles(profiles.filter(p => p.id !== id));
      if (currentProfileId === id) {
        onProfileSelect(''); // Deselect if deleting current
      }
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 flex justify-center">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

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
          onClick={() => {
            setShowForm(!showForm);
            setError('');
          }}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4" /> Add Client</>}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6 animate-fade-in">
          <h3 className="text-white font-medium mb-4">New Client Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Client Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none"
                placeholder="e.g. City of Madison"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Org Type *</label>
              <select
                value={formData.organization_type}
                onChange={e => setFormData({...formData, organization_type: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none"
                required
              >
                <option value="">Select Type...</option>
                {ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">State *</label>
              <select
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none"
                required
              >
                <option value="">Select State...</option>
                {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Primary Focus *</label>
              <select
                value={formData.focus_area}
                onChange={e => setFormData({...formData, focus_area: e.target.value})}
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm focus:border-emerald-500 outline-none"
                required
              >
                <option value="">Select Focus...</option>
                {FOCUS_AREAS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
                group p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center
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
              
              <div className="flex items-center gap-2">
                {currentProfileId === profile.id && (
                  <span className="text-xs text-emerald-500 font-medium px-2 py-1 bg-emerald-500/10 rounded">Active</span>
                )}
                <button
                  onClick={(e) => handleDelete(e, profile.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}