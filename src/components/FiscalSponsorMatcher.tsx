import { useState } from 'react';
import { Search, ExternalLink, MapPin, DollarSign } from 'lucide-react';

interface FiscalSponsor {
  name: string;
  location: string;
  focus: string[];
  feeRange: string;
  url: string;
  description: string;
}

const FISCAL_SPONSORS: FiscalSponsor[] = [
  {
    name: 'Fractured Atlas',
    location: 'National (USA)',
    focus: ['Arts', 'Culture', 'Creative Projects'],
    feeRange: '7-8%',
    url: 'https://www.fracturedatlas.org',
    description: 'Largest arts-focused fiscal sponsor. Handles payroll, insurance, fundraising compliance.'
  },
  {
    name: 'Tides Foundation',
    location: 'National (USA)',
    focus: ['Social Justice', 'Environment', 'Health', 'Education'],
    feeRange: '8-12%',
    url: 'https://www.tides.org',
    description: 'Major player for policy, advocacy, and progressive causes. Strong infrastructure.'
  },
  {
    name: 'Social Good Fund',
    location: 'National (USA)',
    focus: ['All Fields'],
    feeRange: '7-9%',
    url: 'https://www.socialgoodfund.org',
    description: 'Fast approval, low minimums. Great for first-timers.'
  },
  {
    name: 'New York Foundation for the Arts (NYFA)',
    location: 'New York',
    focus: ['Arts', 'Culture'],
    feeRange: '8%',
    url: 'https://www.nyfa.org/fiscal-sponsorship',
    description: 'Excellent for individual artists and small arts groups in NY.'
  },
  {
    name: 'Community Initiatives',
    location: 'San Francisco, CA',
    focus: ['Social Justice', 'Community Development', 'Environment'],
    feeRange: '7-10%',
    url: 'https://www.communityinitiatives.com',
    description: 'West Coast focused, strong on grassroots organizing.'
  },
  {
    name: 'Players Philanthropy Fund',
    location: 'National (USA)',
    focus: ['Sports', 'Youth Development', 'Health'],
    feeRange: '6-8%',
    url: 'https://playersphilanthropyfund.org',
    description: 'Athlete-founded. Great for sports and youth programs.'
  },
  {
    name: 'The Field',
    location: 'New York City',
    focus: ['Performing Arts', 'Dance', 'Theater'],
    feeRange: '7%',
    url: 'https://www.thefield.org',
    description: 'NYC performing arts specialists. Excellent artist support.'
  },
  {
    name: 'Inquiring Systems Inc (ISI)',
    location: 'National (USA)',
    focus: ['Education', 'Research', 'Tech'],
    feeRange: '8-11%',
    url: 'https://www.isi-sci.org',
    description: 'Perfect for STEM education, research, and tech projects.'
  },
  {
    name: 'Foundation for Contemporary Arts (FCA)',
    location: 'National (USA)',
    focus: ['Contemporary Art', 'Experimental Work'],
    feeRange: '6%',
    url: 'https://www.foundationforcontemporaryarts.org',
    description: 'For cutting-edge artists. Low fees, high prestige.'
  },
  {
    name: 'Third Plateau Social Profit',
    location: 'National (USA)',
    focus: ['All Fields'],
    feeRange: '6-8%',
    url: 'https://www.thirdplateau.com',
    description: 'Simple, low-cost option. Good for smaller projects.'
  },
  {
    name: 'Philanthropy for Active Civic Engagement (PACE)',
    location: 'National (USA)',
    focus: ['Civic Engagement', 'Voter Rights', 'Democracy'],
    feeRange: '8%',
    url: 'https://www.pacefunders.org',
    description: 'Civic engagement and democracy work.'
  },
  {
    name: 'International Documentary Association (IDA)',
    location: 'Los Angeles, CA',
    focus: ['Documentary Film', 'Media'],
    feeRange: '6-8%',
    url: 'https://www.documentary.org/fiscal-sponsorship',
    description: 'The go-to for documentary filmmakers.'
  },
  {
    name: 'Intersection for the Arts',
    location: 'San Francisco, CA',
    focus: ['Arts', 'Social Justice', 'BIPOC Artists'],
    feeRange: '7-9%',
    url: 'https://theintersection.org',
    description: 'Focuses on artists of color and social change art.'
  },
  {
    name: 'Creative Capital',
    location: 'National (USA)',
    focus: ['Innovative Arts', 'Experimental Work'],
    feeRange: '5-7%',
    url: 'https://creative-capital.org',
    description: 'Highly selective. For ambitious, innovative projects.'
  },
  {
    name: 'Film Independent',
    location: 'Los Angeles, CA',
    focus: ['Film', 'Video', 'Media Arts'],
    feeRange: '6%',
    url: 'https://www.filmindependent.org/fiscal-sponsorship',
    description: 'LA-based film and media projects.'
  },
  {
    name: 'New England Foundation for the Arts (NEFA)',
    location: 'New England',
    focus: ['Arts', 'Culture'],
    feeRange: '7-10%',
    url: 'https://www.nefa.org',
    description: 'Regional focus on New England states.'
  },
  {
    name: 'Groundswell Fund',
    location: 'National (USA)',
    focus: ['Reproductive Justice', "Women's Rights"],
    feeRange: '8-10%',
    url: 'https://www.groundswellfund.org',
    description: 'Reproductive justice and women-led organizing.'
  },
  {
    name: 'Southern Documentary Fund',
    location: 'Southern USA',
    focus: ['Documentary', 'Southern Stories'],
    feeRange: '7%',
    url: 'https://southerndocumentaryfund.org',
    description: 'Stories from and about the American South.'
  },
  {
    name: 'Proteus Fund',
    location: 'National (USA)',
    focus: ['Human Rights', 'Social Justice', 'Progressive Issues'],
    feeRange: '8-12%',
    url: 'https://proteusfund.org',
    description: 'Progressive advocacy and human rights campaigns.'
  },
  {
    name: 'California Film Institute',
    location: 'California',
    focus: ['Film', 'Education'],
    feeRange: '6-8%',
    url: 'https://www.cafilm.org/fiscal-sponsorship',
    description: 'California-based filmmakers and education projects.'
  },
  {
    name: 'Jewish Funders Network',
    location: 'National (USA)',
    focus: ['Jewish Community', 'Social Justice'],
    feeRange: '7-10%',
    url: 'https://jfunders.org',
    description: 'Projects serving Jewish communities.'
  },
  {
    name: 'Springboard for the Arts',
    location: 'Minnesota & National',
    focus: ['Artists', 'Creative Communities'],
    feeRange: '7-9%',
    url: 'https://springboardforthearts.org',
    description: 'Artist-centered, strong community focus.'
  },
  {
    name: 'San Francisco Film Society',
    location: 'San Francisco, CA',
    focus: ['Film', 'Media'],
    feeRange: '6%',
    url: 'https://sffilm.org/fiscalsponsorship',
    description: 'Bay Area film and media makers.'
  },
  {
    name: 'Headwaters Foundation for Justice',
    location: 'Minnesota',
    focus: ['Social Justice', 'Community Organizing'],
    feeRange: '8%',
    url: 'https://headwatersfoundation.org',
    description: 'Grassroots organizing in the Midwest.'
  },
  {
    name: 'Resource Generation',
    location: 'National (USA)',
    focus: ['Wealth Redistribution', 'Economic Justice'],
    feeRange: '7-10%',
    url: 'https://resourcegeneration.org',
    description: 'Young people with wealth working for economic justice.'
  },
  {
    name: 'Center for Cultural Innovation',
    location: 'California',
    focus: ['Arts', 'Creative Economy'],
    feeRange: '7-9%',
    url: 'https://www.cciarts.org',
    description: 'Artists and cultural practitioners in California.'
  },
  {
    name: 'Awesome Foundation',
    location: 'National (USA)',
    focus: ['Awesome Projects', 'All Fields'],
    feeRange: '0% (micro-grants)',
    url: 'https://www.awesomefoundation.org',
    description: '$1,000 micro-grants, no fees. Worth applying.'
  },
  {
    name: 'Firelight Media',
    location: 'National (USA)',
    focus: ['Documentary', 'BIPOC Filmmakers'],
    feeRange: '6-8%',
    url: 'https://www.firelightmedia.org',
    description: 'Documentary filmmakers of color.'
  },
  {
    name: 'Artist Trust',
    location: 'Washington State',
    focus: ['Artists', 'All Disciplines'],
    feeRange: '7%',
    url: 'https://artisttrust.org',
    description: 'Washington State artists in all fields.'
  },
  {
    name: 'Emerging Arts Leaders',
    location: 'National (USA)',
    focus: ['Arts Leadership', 'Young Arts Professionals'],
    feeRange: '7-9%',
    url: 'https://www.emergingarts.org',
    description: 'Early-career arts administrators and artists.'
  },
];

interface FiscalSponsorMatcherProps {
  isPro: boolean;
}

export default function FiscalSponsorMatcher({ isPro }: FiscalSponsorMatcherProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string>('All');

  const allFocusAreas = ['All', ...Array.from(new Set(FISCAL_SPONSORS.flatMap(s => s.focus)))];

  const filteredSponsors = FISCAL_SPONSORS.filter(sponsor => {
    const matchesSearch = searchQuery === '' ||
      sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sponsor.focus.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFocus = selectedFocus === 'All' || sponsor.focus.includes(selectedFocus);

    return matchesSearch && matchesFocus;
  });

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Fiscal Sponsor Matcher is Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to access our curated database of 30+ fiscal sponsors.
        </p>
        <button 
          onClick={() => window.open('https://buy.stripe.com/test_4gw5lmdQa3S42NW4gi', '_blank')}
          className="px-6 py-3 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Find a Fiscal Sponsor</h2>
        <p className="text-slate-400">
          Browse 30+ trusted fiscal sponsors. Filter by focus area and find the right fit for your project.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, focus area, or description..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {allFocusAreas.slice(0, 12).map(focus => (
            <button
              key={focus}
              onClick={() => setSelectedFocus(focus)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                selectedFocus === focus
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {focus}
            </button>
          ))}
        </div>
      </div>

      <div className="text-slate-400 mb-4">
        {filteredSponsors.length} sponsors found
      </div>

      <div className="space-y-4">
        {filteredSponsors.map(sponsor => (
          <div
            key={sponsor.name}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{sponsor.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {sponsor.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Fee: {sponsor.feeRange}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {sponsor.focus.map(f => (
                    <span
                      key={f}
                      className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-slate-300 mb-4">{sponsor.description}</p>

            <a
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700 transition-colors"
            >
              Visit Website
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>

      {filteredSponsors.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No sponsors found matching your criteria. Try a different search or filter.
        </div>
      )}
    </div>
  );
}