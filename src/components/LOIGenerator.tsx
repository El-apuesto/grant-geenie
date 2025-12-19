import { useState, useEffect } from 'react';
import { Download, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { getStateName } from '../lib/states';

interface Profile {
  first_name?: string;
  last_name?: string;
  email?: string;
  state?: string;
  org_type?: string;
  business_location?: string;
  legal_entity?: string;
  annual_revenue?: string;
  grant_amount?: string[];
  primary_fields?: string[];
  demographic_focus?: string[];
  project_stage?: string;
  fiscal_sponsor?: string;
}

interface LOIGeneratorProps {
  onBack: () => void;
}

export default function LOIGenerator({ onBack }: LOIGeneratorProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
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
    const orgName = formData.organizationName || '[Organization Name]';
    const stateName = profile.state ? getStateName(profile.state) : '[State]';
    const legalType = profile.legal_entity === '501(c)(3) or equivalent nonprofit' 
      ? 'a 501(c)(3) nonprofit organization' 
      : profile.legal_entity || 'an organization';

    return `${formData.funderContact || '[Contact Name]'}
${formData.funderName || '[Foundation Name]'}
${today}

Dear ${formData.funderContact || '[Contact Name]'},

RE: Letter of Inquiry – ${formData.projectTitle || '[Project Title]'}

I am writing on behalf of ${orgName}, ${legalType} based in ${stateName}, to introduce an exciting opportunity for ${formData.funderName || '[Foundation Name]'} to make a meaningful impact in ${profile.primary_fields?.[0] || '[your focus area]'}.

PROJECT OVERVIEW

${formData.projectTitle || '[Project Title]'} is a ${formData.timeline || '[duration]'} initiative that ${formData.projectSummary || '[describe what your project does and who it serves]'}.

We are seeking ${formData.requestedAmount || (profile.grant_amount?.[0] || '$[amount]')} to ${formData.projectSummary ? 'support this critical work' : '[describe what the funding will enable]'}.

ALIGNMENT WITH YOUR MISSION

${formData.alignment || `This project aligns with ${formData.funderName || 'your foundation'}\'s commitment to ${profile.primary_fields?.[0] || '[mission area]'}. [Explain specific alignment with the funder\'s priorities and past grantmaking.]`}

COMMUNITY IMPACT

${profile.demographic_focus && profile.demographic_focus.length > 0 && !profile.demographic_focus.includes('None of these')
  ? `This work centers ${profile.demographic_focus.filter(d => d !== 'None of these').join(', ')} communities in ${stateName}.`
  : `This project serves ${stateName} communities.`}

${profile.business_location && profile.business_location.includes('online') 
  ? 'Our work extends beyond geographic boundaries through virtual programming, allowing us to reach underserved communities nationwide.'
  : ''}

ORGANIZATIONAL CAPACITY

${orgName} ${profile.project_stage === 'Operating 1-3 years' ? 'has been operating for 1-3 years' : profile.project_stage === 'Scaling/established' ? 'is a growing organization ready to scale impact' : profile.project_stage === 'Idea phase' ? 'is an emerging initiative' : 'is an established organization'} with ${profile.annual_revenue || '[annual budget]'} in annual revenue. ${profile.fiscal_sponsor === 'Yes' ? 'We operate with a 501(c)(3) fiscal sponsor.' : ''}

NEXT STEPS

We would be honored to discuss how ${orgName} can partner with ${formData.funderName || 'your foundation'} to ${profile.primary_fields?.[0] ? `advance ${profile.primary_fields[0].toLowerCase()}` : 'create lasting change'} in ${stateName}.

I am available at your convenience to provide additional information or answer any questions. Thank you for considering this opportunity to support transformative work.

Sincerely,

${profile.first_name || '[Your Name]'} ${profile.last_name || ''}
[Your Title]
${orgName}
${user?.email || '[email]'}
[Phone Number]`;
  };

  const downloadAsWord = async () => {
    if (!profile) return;

    const loiText = generateLOI();
    const paragraphs = loiText.split('\n\n').map(text =>
      new Paragraph({
        children: [new TextRun(text.replace(/\n/g, ' '))],
        spacing: { after: 200 },
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({
              text: 'LETTER OF INQUIRY',
              bold: true,
              size: 28,
            })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...paragraphs,
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `LOI-${formData.projectTitle || 'project'}-${Date.now()}.docx`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Letter of Inquiry Generator</h2>
          <p className="text-slate-400">
            Generate a professional 1-2 page LOI pre-filled with your questionnaire answers. Perfect for initial funder outreach.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Your Organization Name *
              </label>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Your Organization Name"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm font-medium">
                  Foundation/Funder Name *
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
                  Contact Name *
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
                Project Title *
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
                  Requested Amount *
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
                  Timeline *
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
                Project Summary * (2-3 sentences)
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
                Alignment with Funder * (2-3 sentences)
              </label>
              <textarea
                value={formData.alignment}
                onChange={(e) => setFormData(prev => ({ ...prev, alignment: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                rows={3}
                placeholder="Explain how this project aligns with the funder's mission and past grantmaking..."
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-white">Preview</h3>
          </div>
          <div className="bg-slate-900 rounded p-6 max-h-96 overflow-auto">
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
              {generateLOI()}
            </pre>
          </div>
        </div>

        <button
          onClick={downloadAsWord}
          disabled={!formData.organizationName || !formData.projectTitle}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download as Word Doc
        </button>
      </div>
    </div>
  );
}