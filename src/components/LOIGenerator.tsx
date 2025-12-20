import { useState, useEffect } from 'react';
import { Download, FileText, Bookmark } from 'lucide-react';
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
    if (!profile) return '';

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const orgName = profile.legal_entity || 'our organization';
    const location = profile.state || '[Location]';
    const focusAreas = (profile.primary_fields || []).join(', ') || '[your focus area]';

    const templates: Record<LOITemplateType, string> = {
      federal: `${formData.funderContact || '[Program Officer Name]'}
${formData.funderName || '[Federal Agency/Program Name]'}
[Agency Address]
${today}

RE: Letter of Inquiry - ${formData.projectTitle || '[Project Title]'}

Dear ${formData.funderContact || '[Program Officer Name]'},

Pursuant to the funding opportunity announcement for ${formData.funderName || '[Program Name]'}, ${orgName}, a ${profile.legal_entity || '[organization type]'} based in ${location}, respectfully submits this Letter of Inquiry for consideration.

PROJECT OVERVIEW

The proposed project, "${formData.projectTitle || '[Project Title]'}," will be implemented over ${formData.timeline || '[duration]'}. ${formData.projectSummary || '[Provide a detailed description of the project scope, objectives, and activities]'}

We are requesting ${formData.requestedAmount || '$[amount]'} in federal funding to support this initiative.

ALIGNMENT WITH PROGRAM PRIORITIES

${formData.alignment || 'This project directly addresses the program priorities outlined in [citation], specifically focusing on [relevant priority areas]. Our approach aligns with federal objectives for [relevant federal goals].'}

ORGANIZATIONAL CAPACITY

${orgName} has demonstrated capacity in ${focusAreas}. We maintain compliance with all federal regulations and have successfully managed federal awards in the past.

COMMUNITY IMPACT

This project will serve ${location} communities, addressing critical needs in ${focusAreas}. We will implement rigorous evaluation measures to track outcomes and ensure accountability of federal funds.

We appreciate your consideration of this inquiry and welcome the opportunity to submit a full application. Please contact us if you require additional information.

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

I am writing on behalf of ${orgName}, based in ${location}, to explore a partnership opportunity with ${formData.funderName || '[Foundation Name]'} that would create meaningful impact in ${focusAreas}.

OUR SHARED VISION

${formData.alignment || `We have long admired ${formData.funderName || 'your foundation'}\'s commitment to [specific foundation values]. Our work aligns closely with your mission, particularly in the areas of [shared priorities].`}

PROJECT OVERVIEW

"${formData.projectTitle || '[Project Title]'}" is a ${formData.timeline || '[duration]'} initiative designed to ${formData.projectSummary || '[describe what your project accomplishes and why it matters to the community you serve]'}.

We are seeking ${formData.requestedAmount || '$[amount]'} to bring this vision to life.

WHY THIS MATTERS NOW

Our community in ${location} faces significant challenges in ${focusAreas}. This project represents a strategic opportunity to create lasting change by [specific approach or innovation].

OUR PARTNERSHIP APPROACH

We view this not simply as a grant request, but as an invitation to partner in transformative work. We are committed to transparent communication, rigorous evaluation, and meaningful collaboration throughout the grant period.

Thank you for considering this inquiry. I would welcome the opportunity to discuss how we might work together to advance our shared goals. I am available at your convenience for a conversation.

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

Dear ${formData.funderContact || '[Name]'},

I am reaching out to explore a strategic partnership between ${formData.funderName || '[Company Name]'} and ${orgName} that would deliver measurable social impact while advancing your corporate social responsibility objectives.

THE OPPORTUNITY

"${formData.projectTitle || '[Project Title]'}" represents a ${formData.timeline || '[duration]'} initiative that ${formData.projectSummary || '[describe the project and its business relevance]'}.

Investment: ${formData.requestedAmount || '$[amount]'}

STRATEGIC ALIGNMENT

${formData.alignment || `This partnership aligns with ${formData.funderName || 'your company'}\'s stated commitment to [specific CSR priorities]. The project directly supports your goals around [relevant corporate values].`}

RETURN ON INVESTMENT

• Community Impact: [Number] individuals in ${location} will benefit directly
• Brand Alignment: Authentic connection with ${focusAreas}
• Employee Engagement: Opportunities for volunteer involvement
• Measurable Outcomes: Quarterly reports with specific KPIs
• Media Value: Recognition in [relevant channels]

THE BUSINESS CASE

Our partnership offers ${formData.funderName || 'your company'} visible leadership in corporate citizenship while creating real solutions for ${location} communities. We provide transparent reporting and opportunities for meaningful employee engagement.

NEXT STEPS

I would appreciate the opportunity to present this proposal in person and discuss how we can structure a partnership that delivers value for both ${formData.funderName || 'your company'} and our community.

Thank you for your consideration. I look forward to exploring this opportunity together.

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

I write to you today with excitement about "${formData.projectTitle || '[Project Title]'}," a project that promises to enrich our community through ${focusAreas} while advancing the artistic vision that ${formData.funderName || 'your organization'} has championed.

THE CREATIVE VISION

${formData.projectSummary || '[Describe your artistic vision and what makes this project unique or innovative in your field]'}

This ${formData.timeline || '[duration]'} project will unfold across ${location}, bringing [specific artistic experiences] to our community.

We are seeking ${formData.requestedAmount || '$[amount]'} to realize this vision.

ARTISTIC MERIT & INNOVATION

${formData.alignment || `This project pushes creative boundaries by [innovative element]. It honors artistic traditions while [how it innovates or challenges conventions]. The work resonates deeply with ${formData.funderName || 'your'} commitment to [specific artistic values].`}

COMMUNITY ENGAGEMENT

Art thrives in community. This project will:
• Engage [number] community members as active participants
• Provide access to high-quality ${focusAreas} experiences
• Create opportunities for emerging artists in ${location}
• Build lasting cultural infrastructure

IMPACT & LEGACY

Beyond the immediate artistic experience, this project will transform how our community engages with ${focusAreas}. We will document and share our process, contributing to the broader field while creating work that resonates locally.

Thank you for considering this inquiry. I would be honored to discuss this project further and share how we might collaborate to bring transformative art to our community.

In creativity and partnership,

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
    a.download = `LOI_${selectedTemplate}_${formData.funderName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
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