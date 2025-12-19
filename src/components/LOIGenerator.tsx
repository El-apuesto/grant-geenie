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
        .single();

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

RE: Letter of Inquiry – ${formData.projectTitle || '[Project Title]'}

I am writing to introduce an exciting opportunity for ${formData.funderName || '[Foundation Name]'} to make a meaningful impact in ${Array.isArray(profile.primary_fields) ? profile.primary_fields.join(', ') : profile.primary_fields || '[your focus area]'}.

PROJECT OVERVIEW

${formData.projectTitle || '[Project Title]'} is a ${formData.timeline || '[duration]'} initiative that ${formData.projectSummary || '[describe what your project does and who it serves]'}.

We are seeking ${formData.requestedAmount || '$[amount]'} to support this critical work.

ALIGNMENT WITH YOUR MISSION

${formData.alignment || `This project aligns with ${formData.funderName || 'your foundation'}\'s mission.`}

COMMUNITY IMPACT

This project serves ${profile.state || '[location]'} communities.

ORGANIZATIONAL CAPACITY

We are at the ${profile.project_stage || 'operational'} stage with ${profile.annual_revenue || '[annual budget]'} in annual revenue.

NEXT STEPS

We would be honored to discuss this partnership opportunity. I am available at your convenience to provide additional information or answer any questions.

Thank you for considering this opportunity to support transformative work.

Sincerely,

[Your Name]
[Your Title]
[Your Organization]
[Email]
[Phone Number]`;
  };

  const downloadAsText = () => {
    const content = generateLOI();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LOI-${formData.projectTitle || 'project'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          LOI Generator is Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to generate professional Letters of Inquiry in seconds.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Letter of Inquiry Generator</h2>
        <p className="text-slate-400">
          Generate a professional 1-2 page LOI pre-filled with your info. Perfect for cold outreach.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Foundation/Funder Name
              </label>
              <input
                type="text"
                value={formData.funderName}
                onChange={(e) => setFormData(prev => ({ ...prev, funderName: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Smith Family Foundation"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.funderContact}
                onChange={(e) => setFormData(prev => ({ ...prev, funderContact: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Ms. Jane Smith"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Project Title
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Community Garden Initiative"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Requested Amount
              </label>
              <input
                type="text"
                value={formData.requestedAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, requestedAmount: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="$25,000"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="12-month"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Project Summary (2-3 sentences)
            </label>
            <textarea
              value={formData.projectSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
              placeholder="Briefly describe what your project does and who it serves..."
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Alignment with Funder (2-3 sentences)
            </label>
            <textarea
              value={formData.alignment}
              onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
              placeholder="Explain how this project aligns with the funder's mission..."
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
        onClick={downloadAsText}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download LOI
      </button>
    </div>
  );
}