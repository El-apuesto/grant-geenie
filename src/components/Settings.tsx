import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { US_STATES } from '../lib/states';
import { ArrowLeft, Play, RefreshCw } from 'lucide-react';

const ORG_TYPES = ['Nonprofit', 'Small Business', 'Freelancer/Solo', 'Artist/Creator', 'Other'];

interface SettingsProps {
  onBack: () => void;
  onRestartTour: () => void;
  onRetakeQuestionnaire?: () => void;
}

export default function Settings({ onBack, onRestartTour, onRetakeQuestionnaire }: SettingsProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orgType, setOrgType] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        setOrgType(data.org_type || '');
        setState(data.state || '');
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
    setMessage('');

    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          org_type: orgType,
          state: state,
        })
        .eq('id', user.id);

      if (err) throw err;

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRetakeQuestionnaire = () => {
    if (onRetakeQuestionnaire) {
      onRetakeQuestionnaire();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-lg text-emerald-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-slate-400 text-sm">Email</label>
              <p className="text-white">{user?.email}</p>
            </div>
            <div>
              <label className="text-slate-400 text-sm">Plan</label>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold">
                  {isPro ? 'Pro' : 'Free'}
                </p>
                {!isPro && (
                  <span className="text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded">
                    5 matches/month
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">
                Organization Type
              </label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select organization type...</option>
                {ORG_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-2">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select your state...</option>
                {US_STATES.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !orgType || !state}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Retake Questionnaire */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Update Eligibility Answers</h2>
          <p className="text-slate-300 mb-4">
            Want to update your full eligibility profile? Retake the questionnaire to refine your grant matches based on your current needs.
          </p>
          <button
            onClick={handleRetakeQuestionnaire}
            className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retake Questionnaire
          </button>
        </div>

        {/* Dashboard Tour */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Dashboard Tour</h2>
          <p className="text-slate-300 mb-4">
            Need a refresher? Restart the guided tour with The Grant Genie to learn about all the features.
          </p>
          <button
            onClick={onRestartTour}
            className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            <Play className="w-4 h-4" />
            Restart Dashboard Tour
          </button>
        </div>
      </div>
    </div>
  );
}