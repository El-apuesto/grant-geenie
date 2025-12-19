import { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LOIGeneratorProps {
  isPro: boolean;
}

export default function LOIGenerator({ isPro }: LOIGeneratorProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    funderName: '',
    funderContact: '',
    projectTitle: '',
    requestedAmount: '',
    projectSummary: '',
    alignment: '',
    timeline: '',
  });

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) setProfile(data);
    };

    loadProfile();
  }, [user]);

  const generateLOI = () => {
    if (!profile) return '';

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return `${formData.funderContact || '[Contact Name]'}
${formData.funderName || '[Foundation Name]'}
${today}

Dear ${formData.funderContact || '[Contact Name]'},

RE: Letter of Inquiry - ${formData.projectTitle || '[Project Title]'}

I am writing on behalf of our organization, ${profile.legal_entity || 'an organization'} based in ${profile.state || '[Location]'}, to introduce an exciting opportunity for ${formData.funderName || '[Foundation Name]'} to make a meaningful impact in ${(profile.primary_fields || []).join(', ') || '[your focus area]'}.

PROJECT OVERVIEW

${formData.projectTitle || '[Project Title]'} is a ${formData.timeline || '[duration]'} initiative that ${formData.projectSummary || '[describe what your project does and who it serves]'}.

We are seeking ${formData.requestedAmount || '$[amount]'} to support this work.

ALIGNMENT WITH YOUR MISSION

${formData.alignment || 'This project aligns with your foundation\'s mission.'}

COMMUNITY IMPACT

This project serves ${profile.state || '[location]'} communities.

Thank you for considering this opportunity.

Sincerely,
[Your Name]
${user?.email || '[email]'}`;
  };

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          LOI Generator is Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to generate professional Letters of Inquiry.
        </p>
        <button 
          onClick={() => window.open('https://buy.stripe.com/test_4gw5lmdQa3S42NW4gi', '_blank')}
          className="px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Letter of Inquiry Generator</h2>
        <p className="text-slate-400">
          Generate a professional LOI pre-filled with your info.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Foundation Name
              </label>
              <input
                type="text"
                value={formData.funderName}
                onChange={(e) => setFormData(prev => ({ ...prev, funderName: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
                placeholder="Smith Family Foundation"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.funderContact}
                onChange={(e) => setFormData(prev => ({ ...prev, funderContact: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
                placeholder="Ms. Jane Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Project Title
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
              placeholder="Community Program"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Amount
              </label>
              <input
                type="text"
                value={formData.requestedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
                placeholder="$25,000"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                Timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
                placeholder="12-month"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Project Summary
            </label>
            <textarea
              value={formData.projectSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
              rows={3}
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Alignment with Funder
            </label>
            <textarea
              value={formData.alignment}
              onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
              rows={3}
              placeholder="Explain alignment..."
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-white">Preview</h3>
        </div>
        <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans overflow-auto max-h-96 bg-slate-900 p-4 rounded">
          {generateLOI()}
        </pre>
      </div>

      <button
        onClick={() => {/* Download functionality */}}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
      >
        <Download className="w-4 h-4" />
        Download as Text
      </button>
    </div>
  );
}