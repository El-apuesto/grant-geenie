import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ProPublicaOrganization {
  ein: string;
  name: string;
  city: string;
  state: string;
  ntee_code: string;
  subsection_code: string;
  ruling_date: string;
  revenue_amount: number;
  asset_amount: number;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
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
    let rateLimitErrors = 0;
    let authErrors = 0;

    // ProPublica Nonprofit Explorer API - No authentication required
    const baseUrl = 'https://projects.propublica.org/nonprofits/api/v2';
    const maxRetries = 3;
    const perPage = 25; // Updated from 100 (Sept 2023 change)

    console.log(`Starting ProPublica sync for ${US_STATES.length} states...`);

    // Iterate through all 50 states + DC
    for (const state of US_STATES) {
      console.log(`\n=== Syncing nonprofits for state: ${state} ===`);
      
      let page = 0; // ProPublica uses zero-indexed pages
      let hasMore = true;

      while (hasMore) {
        const url = `${baseUrl}/search.json?state[id]=${state}&page=${page}`;
        let retryCount = 0;
        let success = false;

        while (!success && retryCount < maxRetries) {
          try {
            const response = await fetch(url, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'GrantGeenie/1.0',
              },
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
              authErrors++;
              console.error(`[ERROR] 401 Unauthorized for ${state} page ${page}`);
              throw new Error('Authentication failed');
            }

            // Handle 429 Rate Limit
            if (response.status === 429) {
              rateLimitErrors++;
              const retryAfter = response.headers.get('Retry-After');
              const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
              console.warn(`[WARN] Rate limit hit. Waiting ${waitTime/1000}s...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retryCount++;
              continue;
            }

            if (!response.ok) {
              throw new Error(`ProPublica API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const organizations = data.organizations || [];
            const numPages = data.num_pages || 1;
            const totalResults = data.total_results || 0;

            console.log(`State ${state} - Page ${page + 1}/${numPages} (${organizations.length} orgs, ${totalResults} total)`);

            if (organizations.length === 0) {
              hasMore = false;
              break;
            }

            // Process each nonprofit
            for (const org of organizations as ProPublicaOrganization[]) {
              totalProcessed++;

              try {
                const nonprofitData = {
                  ein: org.ein,
                  name: org.name?.substring(0, 255) || 'Unknown',
                  city: org.city?.substring(0, 100) || '',
                  state: org.state || state,
                  ntee_code: org.ntee_code || '',
                  subsection_code: org.subsection_code || '501(c)(3)',
                  ruling_date: org.ruling_date ? new Date(org.ruling_date).toISOString() : null,
                  revenue_amount: org.revenue_amount || 0,
                  asset_amount: org.asset_amount || 0,
                  last_updated: new Date().toISOString(),
                };

                // Upsert nonprofit (ON CONFLICT ein DO UPDATE)
                const { error, data: result } = await supabase
                  .from('nonprofits')
                  .upsert(nonprofitData, {
                    onConflict: 'ein',
                    ignoreDuplicates: false,
                  })
                  .select();

                if (error) {
                  console.error(`Error upserting nonprofit ${org.ein}:`, error);
                  totalFailed++;
                } else {
                  const wasCreated = result && result[0]?.created_at === result[0]?.updated_at;
                  if (wasCreated) {
                    totalCreated++;
                  } else {
                    totalUpdated++;
                  }
                }
              } catch (error) {
                console.error(`Error processing nonprofit:`, error);
                totalFailed++;
              }
            }

            success = true;
            
            // Check if there are more pages
            if (page + 1 >= numPages) {
              hasMore = false;
            } else {
              page++;
            }

            // Rate limiting: 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (fetchError) {
            retryCount++;
            if (retryCount >= maxRetries) {
              console.error(`Failed after ${maxRetries} retries for ${state}:`, fetchError);
              // Continue with next state instead of failing completely
              hasMore = false;
              break;
            }
            console.warn(`Retry ${retryCount}/${maxRetries} for ${state} page ${page}`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential backoff
          }
        }
      }

      console.log(`Completed ${state}: Processed ${totalProcessed} total nonprofits`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        states_processed: US_STATES.length,
        total_processed: totalProcessed,
        created: totalCreated,
        updated: totalUpdated,
        failed: totalFailed,
        rate_limit_errors: rateLimitErrors,
        auth_errors: authErrors,
        message: `Successfully synced nonprofits from ${US_STATES.length} states`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('ProPublica sync error:', error);
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
