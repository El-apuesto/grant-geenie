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
];

interface FiscalSponsorMatcherProps {
  isPro: boolean;
}

export default function FiscalSponsorMatcher({ isPro }: FiscalSponsorMatcherProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSponsors = FISCAL_SPONSORS.filter(sponsor =>
    searchQuery === '' ||
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sponsor.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isPro) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Fiscal Sponsor Matcher is Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to access our curated database of 30+ fiscal sponsors.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Find a Fiscal Sponsor</h2>
        <p className="text-slate-400">
          Browse trusted fiscal sponsors. Filter by focus area and find the right fit for your project.
        </p>
      </div>

      <div className="mb-6">
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
      </div>

      <div className="space-y-4">
        {filteredSponsors.map(sponsor => (
          <div
            key={sponsor.name}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
          >
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
    </div>
  );
}