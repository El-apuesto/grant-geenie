import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

// All 50 states + DC + Puerto Rico grant API endpoints
const STATE_APIS = [
  { state: 'AL', name: 'Alabama', apis: ['https://adeca.alabama.gov/api/grants', 'https://www.arts.alabama.gov/api/grants'] },
  { state: 'AK', name: 'Alaska', apis: ['https://www.commerce.alaska.gov/api/grants', 'https://www.artsalaska.org/api/grants'] },
  { state: 'AZ', name: 'Arizona', apis: ['https://www.azcommerce.com/api/grants'] },
  { state: 'AR', name: 'Arkansas', apis: ['https://www.arkansasedc.com/api/grants', 'https://www.arkansasarts.com/api/grants'] },
  { state: 'CA', name: 'California', apis: ['https://business.ca.gov/api/grants', 'https://www.cac.ca.gov/api/grants/open', 'https://www.energy.ca.gov/api/sgip', 'https://library.ca.gov/api/grants'] },
  { state: 'CO', name: 'Colorado', apis: ['https://oedit.colorado.gov/api/grants', 'https://www.historycolorado.org/api/grants'] },
  { state: 'CT', name: 'Connecticut', apis: ['https://portal.ct.gov/DECD/api/grants', 'https://arts.ct.gov/api/grants'] },
  { state: 'DE', name: 'Delaware', apis: ['https://dedo.delaware.gov/api/grants', 'https://www.arts.delaware.gov/api/grants'] },
  { state: 'FL', name: 'Florida', apis: ['https://www.floridagrants.org/api/v1/grants', 'https://floridadep.gov/api/grants'] },
  { state: 'GA', name: 'Georgia', apis: ['https://www.georgia.org/api/grants', 'https://gaarts.org/api/grants'] },
  { state: 'HI', name: 'Hawaii', apis: ['https://dbedt.hawaii.gov/api/grants', 'https://sfcahawaii.org/api/grants'] },
  { state: 'ID', name: 'Idaho', apis: ['https://commerce.idaho.gov/api/grants', 'https://www.arts.idaho.gov/api/grants'] },
  { state: 'IL', name: 'Illinois', apis: ['https://www2.illinois.gov/dceo/GrantsAPI', 'https://www.ihda.org/api/grants'] },
  { state: 'IN', name: 'Indiana', apis: ['https://www.iedc.in.gov/api/grants', 'https://www.in.gov/arts/api/grants'] },
  { state: 'IA', name: 'Iowa', apis: ['https://www.iowaeconomicdevelopment.com/api/grants', 'https://iowaculture.gov/api/grants'] },
  { state: 'KS', name: 'Kansas', apis: ['https://www.kansascommerce.gov/api/grants', 'https://www.ksarts.org/api/grants'] },
  { state: 'KY', name: 'Kentucky', apis: ['https://www.thinkkentucky.com/api/grants', 'https://artscouncil.ky.gov/api/grants'] },
  { state: 'LA', name: 'Louisiana', apis: ['https://www.opportunitylouisiana.com/api/grants', 'https://www.crt.la.gov/api/grants'] },
  { state: 'ME', name: 'Maine', apis: ['https://www.maine.gov/decd/api/grants', 'https://mainearts.org/api/grants'] },
  { state: 'MD', name: 'Maryland', apis: ['https://commerce.maryland.gov/api/grants', 'https://msac.org/api/grants'] },
  { state: 'MA', name: 'Massachusetts', apis: ['https://www.mass.gov/api/grants', 'https://massculturalcouncil.org/api/grants'] },
  { state: 'MI', name: 'Michigan', apis: ['https://www.michiganbusiness.org/api/grants', 'https://www.michiganhumanities.org/api/grants'] },
  { state: 'MN', name: 'Minnesota', apis: ['https://mn.gov/deed/api/grants', 'https://www.artsboard.mn.gov/api/grants'] },
  { state: 'MS', name: 'Mississippi', apis: ['https://mississippi.org/api/grants', 'https://www.arts.ms.gov/api/grants'] },
  { state: 'MO', name: 'Missouri', apis: ['https://ded.mo.gov/api/grants', 'https://www.missouriartscouncil.org/api/grants'] },
  { state: 'MT', name: 'Montana', apis: ['https://commerce.mt.gov/api/grants', 'https://art.mt.gov/api/grants'] },
  { state: 'NE', name: 'Nebraska', apis: ['https://opportunity.nebraska.gov/api/grants', 'https://www.nebraskaartscouncil.org/api/grants'] },
  { state: 'NV', name: 'Nevada', apis: ['https://diversifynevada.com/api/grants', 'https://www.nvculture.org/arts/api/grants'] },
  { state: 'NH', name: 'New Hampshire', apis: ['https://www.nheconomy.com/api/grants', 'https://www.nh.gov/nharts/api/grants'] },
  { state: 'NJ', name: 'New Jersey', apis: ['https://www.njeda.com/api/grants', 'https://www.artscouncil.nj.gov/api/grants'] },
  { state: 'NM', name: 'New Mexico', apis: ['https://gonm.biz/api/grants', 'https://www.nmarts.org/api/grants'] },
  { state: 'NY', name: 'New York', apis: ['https://grantsgateway.ny.gov/api/v2/opportunities', 'https://www.arts.ny.gov/api/grants'] },
  { state: 'NC', name: 'North Carolina', apis: ['https://www.ncdoa.com/api/grants', 'https://deq.nc.gov/api/grants'] },
  { state: 'ND', name: 'North Dakota', apis: ['https://business.nd.gov/api/grants', 'https://www.nd.gov/arts/api/grants'] },
  { state: 'OH', name: 'Ohio', apis: ['https://development.ohio.gov/api/grants', 'https://oac.ohio.gov/api/grants'] },
  { state: 'OK', name: 'Oklahoma', apis: ['https://www.okcommerce.gov/api/grants', 'https://www.arts.ok.gov/api/grants'] },
  { state: 'OR', name: 'Oregon', apis: ['https://www.oregon4biz.com/api/grants', 'https://www.oregonartscommission.org/api/grants'] },
  { state: 'PA', name: 'Pennsylvania', apis: ['https://dced.pa.gov/api/grants', 'https://www.paac.pa.gov/api/grants'] },
  { state: 'RI', name: 'Rhode Island', apis: ['https://commerceri.com/api/grants', 'https://www.arts.ri.gov/api/grants'] },
  { state: 'SC', name: 'South Carolina', apis: ['https://sccommerce.com/api/grants', 'https://www.southcarolinaarts.com/api/grants'] },
  { state: 'SD', name: 'South Dakota', apis: ['https://sdreadytowork.com/api/grants', 'https://arts.sd.gov/api/grants'] },
  { state: 'TN', name: 'Tennessee', apis: ['https://www.tnecd.com/api/grants', 'https://www.tnartscommission.org/api/grants'] },
  { state: 'TX', name: 'Texas', apis: ['https://comptroller.texas.gov/api/grants', 'https://www.txdot.gov/api/grants', 'https://www.tsl.texas.gov/api/grants'] },
  { state: 'UT', name: 'Utah', apis: ['https://business.utah.gov/api/grants', 'https://artsandmuseums.utah.gov/api/grants'] },
  { state: 'VT', name: 'Vermont', apis: ['https://accd.vermont.gov/api/grants', 'https://www.artsvermont.org/api/grants'] },
  { state: 'VA', name: 'Virginia', apis: ['https://www.dhcd.virginia.gov/api/grants', 'https://www.artsva.org/api/grants'] },
  { state: 'WA', name: 'Washington', apis: ['https://www.commerce.wa.gov/api/grants', 'https://www.arts.wa.gov/api/grants'] },
  { state: 'WV', name: 'West Virginia', apis: ['https://www.wvcommerce.org/api/grants', 'https://wvculture.org/arts/api/grants'] },
  { state: 'WI', name: 'Wisconsin', apis: ['https://wedc.org/api/grants', 'https://artsboard.wisconsin.gov/api/grants'] },
  { state: 'WY', name: 'Wyoming', apis: ['https://wyomingbusiness.org/api/grants', 'https://wyoarts.org/api/grants'] },
  { state: 'DC', name: 'District of Columbia', apis: ['https://dslbd.dc.gov/api/grants', 'https://www.dcarts.org/api/grants'] },
  { state: 'PR', name: 'Puerto Rico', apis: ['https://www.pridco.com/api/grants', 'https://www.icp.gobierno.pr/api/grants'] },
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalProcessed = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalFailed = 0;

    const stateResults = [];

    // Process each state
    for (const stateConfig of STATE_APIS) {
      console.log(`Processing ${stateConfig.name}...`);
      let stateProcessed = 0;
      let stateCreated = 0;
      let stateUpdated = 0;
      let stateFailed = 0;

      // Try each API endpoint for this state
      for (const apiUrl of stateConfig.apis) {
        try {
          const response = await fetch(apiUrl, {
            headers: { 'Accept': 'application/json' },
          });

          if (!response.ok) {
            console.error(`API ${apiUrl} returned ${response.status}`);
            continue;
          }

          const data = await response.json();
          const grants = normalizeResponse(data);

          // Process each grant
          for (const grant of grants) {
            stateProcessed++;
            
            try {
              const grantData = {
                source: `state_${stateConfig.state.toLowerCase()}`,
                source_id: grant.id?.toString() || `${stateConfig.state}_${Date.now()}_${Math.random()}`,
                url: grant.url || grant.application_url || apiUrl,
                title: grant.title || grant.name || 'Untitled Grant',
                description: (grant.description || grant.summary || '').substring(0, 2000),
                amount: parseAmount(grant.amount || grant.award_max || grant.funding_max),
                deadline: parseDeadline(grant.deadline || grant.close_date || grant.due_date),
                state: stateConfig.state,
                org_types: parseOrgTypes(grant.eligible_applicants || grant.eligibility || grant.categories),
              };

              const { error, data: result } = await supabase
                .from('grants')
                .upsert(grantData, {
                  onConflict: 'source,source_id',
                  ignoreDuplicates: false,
                })
                .select();

              if (error) {
                console.error('Upsert error:', error);
                stateFailed++;
              } else {
                const wasCreated = result && result[0]?.created_at === result[0]?.updated_at;
                if (wasCreated) {
                  stateCreated++;
                } else {
                  stateUpdated++;
                }
              }
            } catch (err) {
              console.error('Error processing grant:', err);
              stateFailed++;
            }
          }

          // Rate limit between API calls
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Error fetching from ${apiUrl}:`, err);
          stateFailed++;
        }
      }

      stateResults.push({
        state: stateConfig.state,
        name: stateConfig.name,
        processed: stateProcessed,
        created: stateCreated,
        updated: stateUpdated,
        failed: stateFailed,
      });

      totalProcessed += stateProcessed;
      totalCreated += stateCreated;
      totalUpdated += stateUpdated;
      totalFailed += stateFailed;

      // Rate limit between states
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_processed: totalProcessed,
        total_created: totalCreated,
        total_updated: totalUpdated,
        total_failed: totalFailed,
        states: stateResults,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function normalizeResponse(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data.grants) return Array.isArray(data.grants) ? data.grants : [data.grants];
  if (data.opportunities) return Array.isArray(data.opportunities) ? data.opportunities : [data.opportunities];
  if (data.results) return Array.isArray(data.results) ? data.results : [data.results];
  if (data.data) return Array.isArray(data.data) ? data.data : [data.data];
  return [];
}

function parseAmount(amount: any): number {
  if (!amount) return 0;
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[$,]/g, '');
    return parseInt(cleaned) || 0;
  }
  return 0;
}

function parseDeadline(deadline: any): string | null {
  if (!deadline) return null;
  try {
    const date = new Date(deadline);
    return date.toISOString();
  } catch {
    return null;
  }
}

function parseOrgTypes(types: any): string[] {
  if (!types) return ['All'];
  if (Array.isArray(types)) return types.filter(t => typeof t === 'string');
  if (typeof types === 'string') return types.split(',').map(t => t.trim());
  return ['All'];
}