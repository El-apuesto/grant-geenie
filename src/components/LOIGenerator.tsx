import { useState, useEffect } from 'react';
import { Download, FileText, Bookmark, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SavedGrant {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  agency_name: string;
  close_date: string | null;
  award_ceiling: number | null;
  description: string | null;
}

interface LOIGeneratorProps {
  isPro: boolean;
}

type LOITemplateType = 'federal' | 'foundation' | 'corporate' | 'arts';

type ShadowProfile = {
  legal_entity?: string;
  state?: string;
  primary_fields?: string[];
  mission_statement?: string;
  org_history?: string;
};

const LOI_TEMPLATES = [
  {
    type: 'federal' as LOITemplateType,
    name: 'Federal/Government',
    icon: '🏛️',
    description: 'Formal, compliance-focused approach',
  },
  {
    type: 'foundation' as LOITemplateType,
    name: 'Private Foundation',
    icon: '🏦',
    description: 'Mission alignment and relationship building',
  },
  {
    type: 'corporate' as LOITemplateType,
    name: 'Corporate',
    icon: '🏢',
    description: 'Business case with ROI focus',
  },
  {
    type: 'arts' as LOITemplateType,
    name: 'Arts & Culture',
    icon: '🎨',
    description: 'Creative vision and community engagement',
  },
];

export default function LOIGenerator({ isPro }: LOIGeneratorProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [savedGrants, setSavedGrants] = useState<SavedGrant[]>([]);
  const [selectedGrantId, setSelectedGrantId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<LOITemplateType>('foundation');
  const [useShadowProfile, setUseShadowProfile] = useState(false);
  const [shadowProfile, setShadowProfile] = useState<ShadowProfile>({
    legal_entity: 'Rural Municipality',
    state: 'Mississippi',
    primary_fields: ['Arts & Culture'],
    mission_statement: 'To revitalize our rural community by leveraging local culture, heritage, and creative placemaking to strengthen the economy and quality of life.',
    org_history: 'We are a small rural community working to increase access to arts programming, preserve local heritage, and create opportunities for youth and families to thrive locally.',
  });

  const activeProfile = useShadowProfile ? shadowProfile : profile;

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

    const loadSavedGrants = async () => {
      const { data } = await supabase
        .from('saved_grants')
        .select('id, opportunity_id, opportunity_title, agency_name, close_date, award_ceiling, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setSavedGrants(data);
    };

    loadProfile();
    loadSavedGrants();
  }, [user]);

  const [formData, setFormData] = useState({
    funderName: '',
    funderContact: '',
    projectTitle: '',
    requestedAmount: '',
    projectSummary: '',
    alignment: '',
    timeline: '',
  });

  const handleGrantSelect = (grantId: string) => {
    setSelectedGrantId(grantId);
    
    if (!grantId) return;

    const grant = savedGrants.find(g => g.opportunity_id === grantId);
    if (grant) {
      setFormData(prev => ({
        ...prev,
        funderName: grant.agency_name,
        requestedAmount: grant.award_ceiling ? `$${grant.award_ceiling.toLocaleString()}` : '',
        projectTitle: grant.opportunity_title,
      }));
    }
  };

  const generateLOI = () => {
    if (!activeProfile) return '';

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const orgName = (activeProfile as any).legal_entity || 'our organization';
    const location = (activeProfile as any).state || '[Location]';
    const focusAreas = ((activeProfile as any).primary_fields || []).join(', ') || '[your focus area]';

    const templates: Record<LOITemplateType, string> = {
      federal: `${formData.funderContact || '[Program Officer Name]'}
${formData.funderName || '[Federal Agency/Program Name]'}
[Agency Address]
${today}

RE: Letter of Inquiry - ${formData.projectTitle || '[Project Title]'}

Dear ${formData.funderContact || '[Program Officer Name]'},

Pursuant to the funding opportunity announcement for ${formData.funderName || '[Program Name]'}, ${orgName}, a ${orgName} based in ${location}, respectfully submits this Letter of Inquiry for consideration.

PROJECT OVERVIEW

The proposed project, "${formData.projectTitle || '[Project Title]'}," will be implemented over ${formData.timeline || '[duration]'}. ${formData.projectSummary || '[Provide a detailed description of the project scope, objectives, and activities]'}

We are requesting ${formData.requestedAmount || '$[amount]'} in federal funding to support this initiative.

ALIGNMENT WITH PROGRAM PRIORITIES

${formData.alignment || 'This project directly addresses the program priorities outlined in the solicitation, focusing on the needs of rural communities and measurable outcomes.'}

ORGANIZATIONAL CAPACITY

${orgName} has demonstrated capacity in ${focusAreas}. We maintain compliance with all federal regulations and will implement a documented project management and reporting plan.

COMMUNITY IMPACT

This project will serve ${location} communities, addressing critical needs in ${focusAreas}. We will implement practical evaluation measures to track outcomes and ensure accountability of funds.

We appreciate your consideration of this inquiry and welcome the opportunity to submit a full application.

Respectfully submitted,

[Your Name and Title]
${orgName}
${user?.email || '[email]'}
[Phone Number]`,

      foundation: `${formData.funderContact || '[Program Officer Name]'}
${formData.funderName || '[Foundation Name]'}
[Foundation Address]
${today}

Dear ${formData.funderContact || '[Program Officer Name]'},

RE: Letter of Inquiry - ${formData.projectTitle || '[Project Title]'}

On behalf of ${orgName} in ${location}, thank you for considering this letter of inquiry regarding "${formData.projectTitle || '[Project Title]'}".

OUR MISSION

${(activeProfile as any).mission_statement || `Our mission is to advance equitable opportunity in ${location} through community-driven work in ${focusAreas}.`}

PROJECT OVERVIEW

"${formData.projectTitle || '[Project Title]'}" is a ${formData.timeline || '[duration]'} initiative designed to ${formData.projectSummary || '[describe what your project accomplishes and why it matters to the community you serve]' }.

We are seeking ${formData.requestedAmount || '$[amount]'} to launch and deliver this work.

WHY THIS MATTERS NOW

${(activeProfile as any).org_history || `Rural communities in ${location} face limited access to resources and programming. This project will expand access and strengthen long-term community capacity.`}

ALIGNMENT

${formData.alignment || `This project aligns with ${formData.funderName || 'your foundation'}'s commitment to measurable community impact and underserved populations.`}

Thank you for your consideration. We would welcome the opportunity to discuss fit and next steps.

With gratitude,

[Your Name and Title]
${orgName}
${user?.email || '[email]'}
[Phone Number]`,

      corporate: `${formData.funderContact || '[CSR Director Name]'}
${formData.funderName || '[Company Name]'}
[Company Address]
${today}

RE: Strategic Partnership Opportunity - ${formData.projectTitle || '[Project Title]'}

Dear ${formData.funderContact || '[Name]' },

${orgName} in ${location} is seeking a corporate partnership to deliver "${formData.projectTitle || '[Project Title]'}"—a project with measurable community impact.

THE OPPORTUNITY

Investment requested: ${formData.requestedAmount || '$[amount]'}
Timeline: ${formData.timeline || '[duration]'}

PROJECT OVERVIEW

${formData.projectSummary || '[Brief project description]'}

ALIGNMENT

${formData.alignment || `This initiative aligns with ${formData.funderName || 'your company'}'s stated priorities in community investment and equitable opportunity.`}

MEASURABLE OUTCOMES

• Increased access to services/programming in ${location}
• Community engagement and participation growth
• Transparent reporting and documented outcomes

We welcome a conversation about how to structure a partnership that creates shared value.

Best regards,

[Your Name and Title]
${orgName}
${user?.email || '[email]'}
[Phone Number]`,

      arts: `${formData.funderContact || '[Program Director Name]'}
${formData.funderName || '[Arts Council/Foundation Name]'}
[Address]
${today}

Dear ${formData.funderContact || '[Name]'},

RE: Letter of Inquiry - ${formData.projectTitle || '[Project Title]'}

${orgName} in ${location} respectfully submits this Letter of Inquiry for "${formData.projectTitle || '[Project Title]'}"—a community-based arts initiative designed to expand access, strengthen rural identity, and activate shared public spaces.

ARTISTIC & COMMUNITY VISION

${formData.projectSummary || '[Describe your artistic vision and community engagement approach]'}

REQUEST

We are seeking ${formData.requestedAmount || '$[amount]'} for a ${formData.timeline || '[duration]'} project.

WHY THIS MATTERS

${(activeProfile as any).org_history || `In rural communities, limited access to arts programming and creative opportunities can contribute to isolation and reduced civic engagement. This project will create visible, participatory cultural experiences.`}

ALIGNMENT

${formData.alignment || `This proposal aligns with ${formData.funderName || 'your organization'}'s commitment to creative placemaking, rural access, and community-led cultural development.`}

Thank you for considering this inquiry. We would be honored to submit a full proposal.

In partnership,

[Your Name and Title]
${orgName}
${user?.email || '[email]'}
[Phone Number]`,
    };

    return templates[selectedTemplate];
  };

  const downloadLOI = () => {
    const loiText = generateLOI();
    const blob = new Blob([loiText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LOI_${selectedTemplate}_${(formData.funderName || 'Funder').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          Choose your funder type, then customize your LOI with pre-written professional language.
        </p>
      </div>

      {/* Agency Mode (Shadow Profile) */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-white font-semibold">Agency Mode (Shadow Profile)</div>
                <div className="text-slate-400 text-sm">Draft an LOI for a town/artist without needing their full in-app profile.</div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={useShadowProfile}
                  onChange={(e) => setUseShadowProfile(e.target.checked)}
                />
                Use shadow profile
              </label>
            </div>

            {useShadowProfile && (
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Entity / Legal name</label>
                  <input
                    type="text"
                    value={shadowProfile.legal_entity || ''}
                    onChange={(e) => setShadowProfile(prev => ({ ...prev, legal_entity: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    placeholder="Town of ... / Artist name / Nonprofit name"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">State / Region</label>
                  <input
                    type="text"
                    value={shadowProfile.state || ''}
                    onChange={(e) => setShadowProfile(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    placeholder="e.g., Mississippi"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Primary focus</label>
                  <input
                    type="text"
                    value={(shadowProfile.primary_fields || []).join(', ')}
                    onChange={(e) => setShadowProfile(prev => ({ ...prev, primary_fields: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    placeholder="Arts & Culture, Youth, Main Street"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-2 text-sm">Mission statement</label>
                  <input
                    type="text"
                    value={shadowProfile.mission_statement || ''}
                    onChange={(e) => setShadowProfile(prev => ({ ...prev, mission_statement: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    placeholder="One-sentence mission"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-300 mb-2 text-sm">Background (2–4 sentences)</label>
                  <textarea
                    value={shadowProfile.org_history || ''}
                    onChange={(e) => setShadowProfile(prev => ({ ...prev, org_history: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                    rows={3}
                    placeholder="Who you are, what problem exists locally, why you are positioned to solve it."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div className="mb-6">
        <label className="block text-white font-semibold mb-3">Select LOI Template</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LOI_TEMPLATES.map(template => (
            <button
              key={template.type}
              onClick={() => setSelectedTemplate(template.type)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedTemplate === template.type
                  ? 'border-emerald-500 bg-emerald-900/20'
                  : 'border-slate-700 bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="text-3xl mb-2">{template.icon}</div>
              <div className="text-white font-semibold text-sm mb-1">{template.name}</div>
              <div className="text-slate-400 text-xs">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Saved Grants Selector */}
      {savedGrants.length > 0 && (
        <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Bookmark className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-emerald-400 font-semibold mb-2">
                Quick Fill from Saved Grants
              </label>
              <select
                value={selectedGrantId}
                onChange={(e) => handleGrantSelect(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
              >
                <option value="">-- Select a saved grant to auto-fill --</option>
                {savedGrants.map(grant => (
                  <option key={grant.id} value={grant.opportunity_id}>
                    {grant.opportunity_title} - {grant.agency_name}
                  </option>
                ))}
              </select>
              <p className="text-slate-400 text-sm mt-2">
                This will auto-fill the funder name, grant amount, and project title below.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">
                {selectedTemplate === 'corporate' ? 'Company Name' : 'Foundation/Funder Name'}
              </label>
              <input
                type="text"
                value={formData.funderName}
                onChange={(e) => setFormData(prev => ({ ...prev, funderName: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white"
                placeholder={selectedTemplate === 'corporate' ? 'Smith Corporation' : 'Smith Family Foundation'}
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
              placeholder="Explain how your project aligns with this funder's priorities..."
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-semibold text-white">Preview - {LOI_TEMPLATES.find(t => t.type === selectedTemplate)?.name} Template</h3>
        </div>
        <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans overflow-auto max-h-96 bg-slate-900 p-4 rounded">
          {generateLOI()}
        </pre>
      </div>

      <button
        onClick={downloadLOI}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition"
      >
        <Download className="w-4 h-4" />
        Download as Text
      </button>
    </div>
  );
}
