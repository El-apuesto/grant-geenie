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
  // National - Major Players
  { name: 'Fractured Atlas', location: 'National (USA)', focus: ['Arts', 'Culture'], feeRange: '7-8%', url: 'https://www.fracturedatlas.org', description: 'Largest arts-focused fiscal sponsor' },
  { name: 'Tides Foundation', location: 'National (USA)', focus: ['Social Justice', 'Environment'], feeRange: '8-12%', url: 'https://www.tides.org', description: 'Major progressive causes sponsor' },
  { name: 'Social Good Fund', location: 'National (USA)', focus: ['All Fields'], feeRange: '7-9%', url: 'https://www.socialgoodfund.org', description: 'Fast approval, low minimums' },
  { name: 'Players Philanthropy Fund', location: 'National (USA)', focus: ['Sports', 'Youth'], feeRange: '6-8%', url: 'https://playersphilanthropyfund.org', description: 'Sports and youth programs' },
  { name: 'Fiscal Sponsorship Allies', location: 'Indianapolis, IN', focus: ['All Fields'], feeRange: '4-5%', url: 'https://fiscalsponsorshipallies.org', description: 'Lowest rates in US' },
  
  // Arts & Culture - National
  { name: 'New York Foundation for the Arts', location: 'New York, NY', focus: ['Arts', 'Culture'], feeRange: '8%', url: 'https://www.nyfa.org', description: 'Individual artists and arts groups' },
  { name: 'The Field', location: 'New York, NY', focus: ['Performing Arts', 'Dance'], feeRange: '7%', url: 'https://www.thefield.org', description: 'NYC performing arts specialists' },
  { name: 'Foundation for Contemporary Arts', location: 'National (USA)', focus: ['Contemporary Art'], feeRange: '6%', url: 'https://www.foundationforcontemporaryarts.org', description: 'Cutting-edge artists' },
  { name: 'Creative Capital', location: 'National (USA)', focus: ['Innovative Arts'], feeRange: '5-7%', url: 'https://creative-capital.org', description: 'Highly selective, ambitious projects' },
  { name: 'Springboard for the Arts', location: 'Minnesota', focus: ['Arts', 'Community'], feeRange: '7-9%', url: 'https://springboardforthearts.org', description: 'Artist-centered community focus' },
  
  // Film & Media
  { name: 'International Documentary Association', location: 'Los Angeles, CA', focus: ['Documentary', 'Film'], feeRange: '6-8%', url: 'https://www.documentary.org', description: 'Documentary filmmakers' },
  { name: 'Film Independent', location: 'Los Angeles, CA', focus: ['Film', 'Media'], feeRange: '6%', url: 'https://www.filmindependent.org', description: 'LA film and media projects' },
  { name: 'Firelight Media', location: 'National (USA)', focus: ['Documentary', 'BIPOC'], feeRange: '6-8%', url: 'https://www.firelightmedia.org', description: 'Filmmakers of color' },
  { name: 'Southern Documentary Fund', location: 'Durham, NC', focus: ['Documentary'], feeRange: '7%', url: 'https://southerndocumentaryfund.org', description: 'Southern stories' },
  { name: 'The Film Collaborative', location: 'Los Angeles, CA', focus: ['Film'], feeRange: '6-8%', url: 'https://www.thefilmcollaborative.org', description: 'Independent filmmakers' },
  
  // Social Justice & Environment
  { name: 'Earth Island Institute', location: 'Berkeley, CA', focus: ['Environment', 'Conservation'], feeRange: '8-10%', url: 'https://www.earthisland.org', description: 'Environmental projects' },
  { name: 'Community Initiatives', location: 'San Francisco, CA', focus: ['Social Justice', 'Community'], feeRange: '7-10%', url: 'https://www.communityinitiatives.com', description: 'Grassroots organizing' },
  { name: 'NEO Philanthropy', location: 'New York, NY', focus: ['Social Justice', 'Progressive'], feeRange: '8-12%', url: 'https://neophilanthropy.org', description: 'Progressive advocacy' },
  { name: 'Proteus Fund', location: 'National (USA)', focus: ['Human Rights', 'Justice'], feeRange: '8-12%', url: 'https://proteusfund.org', description: 'Human rights campaigns' },
  { name: 'Rose Foundation', location: 'Oakland, CA', focus: ['Environment', 'Community'], feeRange: '7-9%', url: 'https://www.rosefdn.org', description: 'Environmental justice' },
  
  // Education & Research
  { name: 'Inquiring Systems Inc', location: 'National (USA)', focus: ['Education', 'Research'], feeRange: '8-11%', url: 'https://www.isi-sci.org', description: 'STEM education and research' },
  { name: 'Public Health Institute', location: 'Oakland, CA', focus: ['Public Health', 'Research'], feeRange: '8-12%', url: 'https://www.phi.org', description: 'Public health programs' },
  { name: 'Foundation for California Community Colleges', location: 'Sacramento, CA', focus: ['Education'], feeRange: '7-10%', url: 'https://foundationccc.org', description: 'Community college programs' },
  
  // Regional - California
  { name: 'Center for Cultural Innovation', location: 'California', focus: ['Arts', 'Culture'], feeRange: '7-9%', url: 'https://www.cciarts.org', description: 'CA cultural practitioners' },
  { name: 'Bay Area Video Coalition', location: 'San Francisco, CA', focus: ['Media Arts'], feeRange: '7%', url: 'https://www.bavc.org', description: 'Bay Area media makers' },
  { name: 'Intersection for the Arts', location: 'San Francisco, CA', focus: ['Arts', 'Social Justice'], feeRange: '7-9%', url: 'https://theintersection.org', description: 'Artists of color' },
  
  // Regional - New York
  { name: 'Brooklyn Arts Council', location: 'Brooklyn, NY', focus: ['Arts'], feeRange: '7-8%', url: 'https://www.brooklynartscouncil.org', description: 'Brooklyn artists' },
  { name: 'Women Make Movies', location: 'New York, NY', focus: ['Film', 'Women'], feeRange: '6-8%', url: 'https://www.wmm.com', description: 'Women filmmakers' },
  { name: 'Dance Films Association', location: 'Brooklyn, NY', focus: ['Dance', 'Film'], feeRange: '7%', url: 'https://www.dancefilms.org', description: 'Dance on film' },
  
  // Regional - Other States
  { name: 'Artist Trust', location: 'Washington', focus: ['Arts'], feeRange: '7%', url: 'https://artisttrust.org', description: 'WA state artists' },
  { name: 'Shunpike', location: 'Seattle, WA', focus: ['Arts', 'Culture'], feeRange: '8%', url: 'https://www.shunpike.org', description: 'WA arts organizations' },
  { name: 'FilmNorth', location: 'St. Paul, MN', focus: ['Film'], feeRange: '7%', url: 'https://www.filmnorth.org', description: 'MN filmmakers' },
  { name: 'Austin Film Society', location: 'Austin, TX', focus: ['Film'], feeRange: '6-8%', url: 'https://www.austinfilm.org', description: 'TX film community' },
  { name: 'Denver Film', location: 'Denver, CO', focus: ['Film'], feeRange: '7%', url: 'https://denverfilm.org', description: 'CO filmmakers' },
  
  // Specialized
  { name: 'Awesome Foundation', location: 'National (USA)', focus: ['All Fields'], feeRange: '0%', url: 'https://www.awesomefoundation.org', description: '$1K micro-grants, no fees' },
  { name: 'FJC', location: 'New York, NY', focus: ['Jewish Community'], feeRange: '8-10%', url: 'https://fjc.org', description: 'Jewish philanthropic projects' },
  { name: 'Give2Asia', location: 'San Francisco, CA', focus: ['Asia', 'International'], feeRange: '7-9%', url: 'https://give2asia.org', description: 'Asian philanthropy' },
  { name: 'Global Fund for Women', location: 'San Francisco, CA', focus: ['Women', 'International'], feeRange: '8-10%', url: 'https://www.globalfundforwomen.org', description: 'Women\'s rights globally' },
  { name: 'Seventh Generation Fund', location: 'Arcata, CA', focus: ['Indigenous', 'Native'], feeRange: '7-9%', url: 'https://www.7genfund.org', description: 'Indigenous communities' },
];

interface FiscalSponsorsProps {
  isPro: boolean;
}

export default function FiscalSponsors({ isPro }: FiscalSponsorsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFocus, setSelectedFocus] = useState<string>('All');

  const allFocusAreas = ['All', 'Arts', 'Film', 'Social Justice', 'Environment', 'Education', 'Community', 'All Fields'];

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
          Fiscal Sponsor Directory is Pro only
        </h3>
        <p className="text-slate-400 mb-6">
          Upgrade to access 40+ curated fiscal sponsors.
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
        <h2 className="text-2xl font-bold text-white mb-2">Fiscal Sponsor Directory</h2>
        <p className="text-slate-400">
          Browse 40+ trusted fiscal sponsors. Filter by focus area to find the right fit.
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, focus, or description..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded text-white"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {allFocusAreas.map(focus => (
            <button
              key={focus}
              onClick={() => setSelectedFocus(focus)}
              className={`px-4 py-2 rounded font-medium transition ${
                selectedFocus === focus
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
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
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded font-semibold hover:bg-emerald-700"
            >
              Visit Website
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>

      {filteredSponsors.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No sponsors found. Try a different search.
        </div>
      )}
    </div>
  );
}