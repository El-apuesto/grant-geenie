import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { US_STATES, getStateName } from '../lib/states';
import { ArrowLeft, Lamp, Save } from 'lucide-react';

const ORG_TYPES = ['Nonprofit', 'Small Business', 'Freelancer/Solo', 'Artist/Creator', 'Other'];

interface SettingsProps {
  onBack: () => void;
  onRestartTour: () => void;
}

export default function Settings({ onBack, onRestartTour }: SettingsProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    org_type: '',
    state: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (err) throw err;
      
      if (data) {
        setProfile(data);
        setFormData({
          org_type: data.org_type || '',
          state: data.state || '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          org_type: formData.org_type,
          state: formData.state,
        })
        .eq('id', user.id);

      if (err) throw err;

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const isPro = profile?.subscription_status === 'active';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-lg text-emerald-200">
            {success}
          </div>
        )}

        {/* Account Info */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Account</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <p className="text-white">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Subscription</label>
                <p className="text-white">
                  {isPro ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-full">
                      Pro Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700 border border-slate-600 text-slate-300 rounded-full">
                      Free Tier
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Questionnaire Settings */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Questionnaire</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-6">
              Update your organization details to improve grant matching
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Organization Type
                </label>
                <select
                  value={formData.org_type}
                  onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select organization type...</option>
                  {ORG_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select your state...</option>
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={saving || !formData.org_type || !formData.state}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>

        {/* Tour */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Dashboard Tour</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <p className="text-slate-400 text-sm mb-4">
              Want a refresher? Restart the guided tour with The Grant Genie
            </p>
            <button
              onClick={onRestartTour}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition"
            >
              <Lamp className="w-4 h-4" />
              Restart Dashboard Tour
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
