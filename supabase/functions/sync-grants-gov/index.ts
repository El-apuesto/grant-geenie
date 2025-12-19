import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GrantsGovOpportunity {
  opportunityId: string;
  opportunityNumber: string;
  opportunityTitle: string;
  opportunityDescription: string;
  agencyCode: string;
  agencyName: string;
  cfdaNumbers?: string;
  postedDate: string;
  closeDate?: string;
  archiveDate?: string;
  awardCeiling?: number;
  awardFloor?: number;
  estimatedTotalProgramFunding?: number;
  expectedNumberOfAwards?: number;
  costSharingOrMatchingRequirement: string;
  fundingInstrumentTypes?: string[];
  fundingActivityCategories?: string[];
  eligibleApplicants?: string[];
  additionalInformationOnEligibility?: string;
  opportunityURL: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    try {
      // Grants.gov REST API v2 - No API key required
      const baseUrl = 'https://api.grants.gov/v2/grants/search';
      let offset = 0;
      const limit = 25; // Max per request
      let hasMore = true;

      while (hasMore) {
        const url = `${baseUrl}?offset=${offset}&limit=${limit}&status=posted`;

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Grants.gov API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const opportunities = data.opportunities || [];

        if (opportunities.length === 0) {
          hasMore = false;
          break;
        }

        // Process each opportunity
        for (const opp of opportunities as GrantsGovOpportunity[]) {
          processedCount++;

          try {
            const grantData = {
              source: 'grants_gov',
              source_id: opp.opportunityId,
              url: opp.opportunityURL,
              title: opp.opportunityTitle,
              description: opp.opportunityDescription?.substring(0, 2000) || '',
              amount: opp.awardCeiling || opp.awardFloor || 0,
              deadline: opp.closeDate ? new Date(opp.closeDate).toISOString() : null,
              state: null, // Federal grants are nationwide
              org_types: opp.eligibleApplicants || ['All'],
            };

            // Upsert grant (update if exists, insert if new)
            const { error, data: result } = await supabase
              .from('grants')
              .upsert(grantData, {
                onConflict: 'source,source_id',
                ignoreDuplicates: false,
              })
              .select();

            if (error) {
              console.error('Error upserting grant:', error);
              failedCount++;
            } else {
              const wasCreated = result && result[0]?.created_at === result[0]?.updated_at;
              if (wasCreated) {
                createdCount++;
              } else {
                updatedCount++;
              }
            }
          } catch (error) {
            console.error('Error processing opportunity:', error);
            failedCount++;
          }
        }

        offset += limit;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed: processedCount,
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw error;
    }
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