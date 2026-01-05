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
    let rateLimitErrors = 0;
    let authErrors = 0;

    try {
      // Legacy Grants.gov API - No authentication required
      const baseUrl = 'https://grants.gov/api/v1/api/search2';
      let offset = 0;
      const limit = 25; // Max per request
      let hasMore = true;
      const maxRetries = 3;

      while (hasMore) {
        // Build query parameters for ALL grants (no geographic filtering)
        const params = new URLSearchParams({
          rows: limit.toString(),
          start: offset.toString(),
          // Don't filter by state - capture ALL grants
        });

        const url = `${baseUrl}?${params.toString()}`;
        let retryCount = 0;
        let success = false;

        while (!success && retryCount < maxRetries) {
          try {
            const response = await fetch(url, {
              headers: {
                'Accept': 'application/json',
              },
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
              authErrors++;
              console.error(`[ERROR] 401 Unauthorized at offset ${offset}`);
              throw new Error('Authentication failed - API key may be invalid');
            }

            // Handle 429 Rate Limit
            if (response.status === 429) {
              rateLimitErrors++;
              const retryAfter = response.headers.get('Retry-After');
              const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
              console.warn(`[WARN] Rate limit hit. Waiting ${waitTime/1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retryCount++;
              continue;
            }

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
                  agency_code: opp.agencyCode,
                  agency_name: opp.agencyName,
                  opportunity_status: 'posted',
                  posted_date: opp.postedDate ? new Date(opp.postedDate).toISOString() : null,
                  last_updated_date: new Date().toISOString(),
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

            success = true;
            offset += limit;

            // Rate limiting: 1 second between requests (60 requests/minute)
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (fetchError) {
            retryCount++;
            if (retryCount >= maxRetries) {
              console.error(`Failed after ${maxRetries} retries:`, fetchError);
              throw fetchError;
            }
            console.warn(`Retry ${retryCount}/${maxRetries} for offset ${offset}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        if (!success) {
          throw new Error(`Failed to fetch data after ${maxRetries} retries`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed: processedCount,
          created: createdCount,
          updated: updatedCount,
          failed: failedCount,
          rateLimitErrors,
          authErrors,
          message: `Successfully synced ${processedCount} grants from Grants.gov`,
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
        details: 'Check function logs for more information',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});