import { useState, useEffect } from 'react';
import { FileText, Download, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type TemplateType = 'federal' | 'foundation' | 'corporate' | 'arts';

interface ApplicationWizardProps {
  isPro: boolean;
}

const TEMPLATES = [
  {
    type: 'federal' as TemplateType,
    name: 'Federal/Government Grant',
    icon: '🏛️',
    description: 'For federal agencies and government programs',
  },
  {
    type: 'foundation' as TemplateType,
    name: 'Private Foundation',
    icon: '🏦',
    description: 'For private foundations and family trusts',
  },
  {
    type: 'corporate' as TemplateType,
    name: 'Corporate Grant',
    icon: '🏢',
    description: 'For corporate giving programs and CSR initiatives',
  },
  {
    type: 'arts' as TemplateType,
    name: 'Arts & Culture',
    icon: '🎨',
    description: 'For arts councils, NEA, and cultural organizations',
  },
];

export default function ApplicationWizard({ isPro }: ApplicationWizardProps) {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectSummary: '',
    requestedAmount: '',
    projectDuration: '',
    targetBeneficiaries: '',
    measurableOutcomes: '',
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

  const generateTemplate = () => {
    if (!profile || !selectedTemplate) return '';

    const templates: Record<TemplateType, string> = {
      federal: `FEDERAL GRANT APPLICATION

APPLICANT INFORMATION
Organization Type: ${profile.legal_entity || 'N/A'}
State: ${profile.state || 'N/A'}
Primary Field: ${Array.isArray(profile.primary_fields) ? profile.primary_fields.join(', ') : profile.primary_fields || 'N/A'}
Annual Budget: ${profile.annual_revenue || 'N/A'}

PROJECT INFORMATION
Project Title: ${formData.projectTitle || '[Enter project title]'}

Project Summary:
${formData.projectSummary || '[Provide a brief overview of your project]'}

Amount Requested: ${formData.requestedAmount || '[Enter amount]'}
Project Duration: ${formData.projectDuration || '[e.g., 12 months]'}

TARGET BENEFICIARIES
${formData.targetBeneficiaries || '[Describe who will benefit from this project]'}

MEASURABLE OUTCOMES
${formData.measurableOutcomes || '[List specific, quantifiable outcomes]'}

ORGANIZATIONAL CAPACITY
Project Stage: ${profile.project_stage || 'N/A'}
Fiscal Sponsor: ${profile.fiscal_sponsor || 'N/A'}`,

      foundation: `PRIVATE FOUNDATION GRANT PROPOSAL

ORGANIZATION
Type: ${profile.legal_entity}
Location: ${profile.state}
Focus Area: ${Array.isArray(profile.primary_fields) ? profile.primary_fields.join(', ') : profile.primary_fields}

EXECUTIVE SUMMARY
${formData.projectSummary || '[1-2 paragraph overview of your request]'}

PROJECT TITLE: ${formData.projectTitle || '[Enter title]'}
AMOUNT REQUESTED: ${formData.requestedAmount || '[Enter amount]'}

PROGRAM DESCRIPTION
Target Population: ${formData.targetBeneficiaries || '[Describe beneficiaries]'}
Timeline: ${formData.projectDuration || '[Duration]'}

EXPECTED OUTCOMES
${formData.measurableOutcomes || '[List specific, measurable results]'}`,

      corporate: `CORPORATE GIVING PROPOSAL

TO: [Corporate Foundation Name]
FROM: [Your Organization]
DATE: ${new Date().toLocaleDateString()}

PARTNERSHIP OPPORTUNITY

We are seeking ${formData.requestedAmount || '[amount]'} to support ${formData.projectTitle || '[project name]'}.

ALIGNMENT WITH CORPORATE VALUES
This project aligns with your commitment to:
• ${Array.isArray(profile.primary_fields) ? profile.primary_fields.join('\n• ') : profile.primary_fields}

PROJECT OVERVIEW
${formData.projectSummary || '[Brief project description]'}

Target Beneficiaries: ${formData.targetBeneficiaries || '[Who benefits]'}
Timeline: ${formData.projectDuration || '[Duration]'}

MEASURABLE IMPACT
${formData.measurableOutcomes || '[Specific metrics]'}`,

      arts: `ARTS & CULTURE GRANT APPLICATION

ORGANIZATION
Location: ${profile.state}
Artistic Discipline: ${Array.isArray(profile.primary_fields) ? profile.primary_fields.join(', ') : 'Arts & Culture'}
Stage: ${profile.project_stage || 'Established'}

PROJECT TITLE
${formData.projectTitle || '[Enter creative project title]'}

ARTISTIC VISION
${formData.projectSummary || '[Describe your artistic vision]'}

AMOUNT REQUESTED: ${formData.requestedAmount || '[Enter amount]'}
TIMELINE: ${formData.projectDuration || '[e.g., 6 months]'}

COMMUNITY ENGAGEMENT
Target Audience: ${formData.targetBeneficiaries || '[Describe audience]'}

IMPACT & EVALUATION
${formData.measurableOutcomes || '[How will you measure impact?]'}`,
    };

    return templates[selectedTemplate];
  };

  const downloadAsText = () => {
    const content = generateTemplate();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-application.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Application Templates are Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to access 4 pre-filled templates that save you hours of writing.
        </p>
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Choose a template</h2>
        <p className="text-slate-400 mb-6">
          Pick the template that matches your grant type. We'll pre-fill it with your info.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {TEMPLATES.map(template => (
            <button
              key={template.type}
              onClick={() => setSelectedTemplate(template.type)}
              className="bg-slate-800 border-2 border-slate-700 rounded-lg p-6 text-left hover:border-emerald-500 transition-colors"
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              <p className="text-slate-400 text-sm">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => setSelectedTemplate(null)}
          className="text-emerald-500 hover:text-emerald-400 mb-4"
        >
          ← Back to templates
        </button>
        <h2 className="text-xl font-semibold text-white mb-2">
          {TEMPLATES.find(t => t.type === selectedTemplate)?.name}
        </h2>
        <p className="text-slate-400">
          Fill in the details below. We'll pre-fill everything else from your profile.
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Project Title
            </label>
            <input
              type="text"
              value={formData.projectTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, projectTitle: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Give your project a clear, compelling title"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Project Summary (2-3 sentences)
            </label>
            <textarea
              value={formData.projectSummary}
              onChange={(e) => setFormData(prev => ({ ...prev, projectSummary: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={4}
              placeholder="What are you doing and why does it matter?"
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
                placeholder="$10,000"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Project Duration
              </label>
              <input
                type="text"
                value={formData.projectDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDuration: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="12 months"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Target Beneficiaries
            </label>
            <textarea
              value={formData.targetBeneficiaries}
              onChange={(e) => setFormData(prev => ({ ...prev, targetBeneficiaries: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
              placeholder="Who benefits from this project?"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Measurable Outcomes
            </label>
            <textarea
              value={formData.measurableOutcomes}
              onChange={(e) => setFormData(prev => ({ ...prev, measurableOutcomes: e.target.value }))}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              rows={3}
              placeholder="What specific results will you track?"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
        <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96 bg-slate-900 p-4 rounded">
          {generateTemplate()}
        </pre>
      </div>

      <button
        onClick={downloadAsText}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download Template
      </button>
    </div>
  );
}