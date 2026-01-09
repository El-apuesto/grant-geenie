import { useState } from 'react';
import { Building2, Wand2, Briefcase, Users, ArrowRight } from 'lucide-react';
import { Profile } from '../types';

interface ShadowProfileGeneratorProps {
  onProfileGenerated: (profile: any) => void;
}

// Define specific types for the archetype structure to satisfy TypeScript indexing
type ArchetypeKey = 'municipality' | 'nonprofit' | 'artist';

interface Template {
  mission: (name: string, loc: string) => string;
  description: (name: string, loc: string) => string;
  programs: string[];
}

interface Archetype {
  label: string;
  needs: string[];
  templates: Record<string, Template>;
}

const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  municipality: {
    label: 'Rural Municipality',
    needs: ['Infrastructure', 'Arts & Culture', 'Public Safety', 'Economic Development'],
    templates: {
      'Arts & Culture': {
        mission: (name: string, loc: string) => `To revitalize the civic and cultural life of ${name} by leveraging our unique rural heritage and creative potential to drive economic growth and community cohesion.`,
        description: (name: string, loc: string) => `${name} is a historic rural community in ${loc} committed to preserving its identity while embracing the future. We face the dual challenge of preserving our Main Street assets while creating engaging opportunities for youth and families to remain in the region.`,
        programs: ['Main Street Revitalization Initiative', 'Annual Harvest Heritage Festival', 'Rural Youth Creative Leadership Program']
      },
      'Infrastructure': {
        mission: (name: string, loc: string) => `To ensure ${name} provides safe, modern, and sustainable infrastructure that supports the health and well-being of all residents while fostering an environment for business growth.`,
        description: (name: string, loc: string) => `As a rural hub in ${loc}, ${name} manages critical infrastructure for a population that has historically been underserved. Our focus is on modernizing aging systems to meet 21st-century standards for water, connectivity, and public spaces.`,
        programs: ['Clean Water Access Project', 'Rural Broadband Expansion', 'Community Center Modernization']
      }
    }
  },
  nonprofit: {
    label: 'Community Non-Profit',
    needs: ['Youth Services', 'Food Security', 'Mental Health', 'Environmental'],
    templates: {
      'Youth Services': {
        mission: (name: string, loc: string) => `To empower the next generation of ${loc} by providing accessible mentorship, skill-building, and leadership opportunities in a supportive rural environment.`,
        description: (name: string, loc: string) => `Founded to address the lack of after-school resources in ${loc}, ${name} serves at-risk youth across the county. We bridge the gap between rural isolation and opportunity through structured programming and community partnerships.`,
        programs: ['Future Leaders Mentorship', 'Rural STEM Workshop Series', 'Mobile Youth Outreach Van']
      }
    }
  },
  artist: {
    label: 'Individual Artist',
    needs: ['Visual Arts', 'Performance', 'Community Project'],
    templates: {
      'Visual Arts': {
        mission: (name: string, loc: string) => `To explore the intersection of rural identity and contemporary aesthetic practice, creating work that challenges stereotypes and invites community dialogue.`,
        description: (name: string, loc: string) => `I am a ${loc}-based visual artist whose work documents and reimagines the rural landscape. My practice is deeply rooted in the local community, using art as a tool for storytelling and place-making in underserved areas.`,
        programs: ['Community Mural Co-Creation', 'Rural Studio Residency', 'Pop-Up Gallery Series']
      }
    }
  }
};

export default function ShadowProfileGenerator({ onProfileGenerated }: ShadowProfileGeneratorProps) {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    type: 'municipality' as ArchetypeKey,
    need: 'Arts & Culture'
  });

  const [generated, setGenerated] = useState<any>(null);

  const handleGenerate = () => {
    const archetype = ARCHETYPES[formData.type];
    // Fallback logic if the selected need isn't in the template map (though UI prevents this, TS worries)
    const templateKey = archetype.templates[formData.need] ? formData.need : Object.keys(archetype.templates)[0];
    const template = archetype.templates[templateKey];
    
    if (!template) return;

    const mission = template.mission(formData.name, formData.state);
    const desc = template.description(formData.name, formData.state);
    const programs = template.programs;

    const profileData = {
      // Simulate profile fields
      id: 'shadow-' + Date.now(),
      legal_entity: archetype.label,
      state: formData.state,
      primary_fields: [formData.need],
      mission_statement: mission,
      org_history: desc,
      // Mapping these to fields LOIGenerator uses
      organization_type: formData.type,
    };

    setGenerated({
      ...profileData,
      programs
    });
  };

  const handleUse = () => {
    if (generated) {
      onProfileGenerated(generated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Wand2 className="text-emerald-500" />
          Shadow Profile Generator
        </h2>
        <p className="text-slate-400">
          Create "Shadow Profiles" for cold-start clients (towns, artists) to instantly generate high-quality grant applications without manual setup.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Client Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Entity Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Town of Oskaloosa"
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 text-sm">Location (State/Region)</label>
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                placeholder="e.g. Kansas"
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as ArchetypeKey, need: ARCHETYPES[e.target.value as ArchetypeKey].needs[0]})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                >
                  {Object.entries(ARCHETYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-2 text-sm">Primary Need</label>
                <select
                  value={formData.need}
                  onChange={e => setFormData({...formData, need: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white"
                >
                  {ARCHETYPES[formData.type].needs.map(need => (
                    <option key={need} value={need}>{need}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!formData.name || !formData.state}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Generate Shadow Profile
            </button>
          </div>
        </div>

        {/* Output Preview */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Generated Profile</h3>
          
          {generated ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mission Statement</div>
                <div className="text-slate-300 italic">"{generated.mission_statement}"</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Organization History</div>
                <div className="text-slate-300 text-sm">{generated.org_history}</div>
              </div>

              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Strategic Programs</div>
                <ul className="text-sm text-slate-300 space-y-1">
                  {generated.programs.map((p: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={handleUse}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  Use for Application
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  This will override your current profile in the LOI Generator.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Users className="w-12 h-12 opacity-20" />
              <p>Enter details and click generate to see the magic.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
