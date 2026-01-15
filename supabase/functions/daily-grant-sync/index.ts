import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GrantSearchResult {
  title: string;
  description: string;
  funder_name: string;
  funder_type: string;
  deadline: string | null;
  is_rolling: boolean;
  award_min: number;
  award_max: number;
  apply_url: string;
  state: string | null;
  eligibility: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting daily grant search...');

    // Step 1: Purge expired grants
    const { data: purgeResult, error: purgeError } = await supabase
      .rpc('purge_expired_grants');

    if (purgeError) {
      console.error('Error purging expired grants:', purgeError);
    } else {
      console.log(`Purged ${purgeResult[0]?.purged_count || 0} expired grants`);
    }

    // Step 2: Search for new grants
    // TODO: Integrate with Grants.gov API or other grant sources
    // For now, this is a placeholder for your grant scraping logic
    
    const newGrantsFound = await searchNewGrants();
    
    if (newGrantsFound.length > 0) {
      // Insert new grants into database
      const { data: insertedGrants, error: insertError } = await supabase
        .from('grants')
        .upsert(
          newGrantsFound.map(grant => ({
            ...grant,
            is_active: true,
            created_at: new Date().toISOString(),
          })),
          { onConflict: 'apply_url' } // Prevent duplicates by URL
        );

      if (insertError) {
        console.error('Error inserting new grants:', insertError);
      } else {
        console.log(`Added ${newGrantsFound.length} new grants`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        purged: purgeResult?.[0]?.purged_count || 0,
        added: newGrantsFound.length,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in daily-grant-sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Search for new grants from various sources
 * TODO: Implement actual grant search logic here
 * 
 * Options:
 * 1. Grants.gov API: https://www.grants.gov/web/grants/xml-extract.html
 * 2. Foundation Directory API: https://fconline.foundationcenter.org/
 * 3. Web scraping (GrantWatch, etc.)
 */
async function searchNewGrants(): Promise<GrantSearchResult[]> {
  // Placeholder - replace with actual grant search API calls
  console.log('Searching for new grants...');
  
  // Example: Call Grants.gov API
  // const response = await fetch('https://www.grants.gov/grantsws/rest/opportunities/search/');
  // const data = await response.json();
  // return parseGrantsGovResponse(data);
  
  return [];
}

/**
 * Example parser for Grants.gov API response
 */
function parseGrantsGovResponse(data: any): GrantSearchResult[] {
  // Transform API response to your grant schema
  return [];
}