import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GrantsGovOpportunity {
  opportunityID: string
  opportunityNumber: string
  opportunityTitle: string
  opportunityCategory: string
  fundingInstrumentType: string
  categoryOfFundingActivity: string
  categoryExplanation: string
  cfda_numbers: string
  eligible_applicants: string
  additionalInformationOnEligibility: string
  agencyCode: string
  agencyName: string
  postDate: string
  closeDate: string
  lastUpdatedDate: string
  awardCeiling: number
  awardFloor: number
  estimatedTotalProgramFunding: number
  expectedNumberOfAwards: number
  description: string
  version: string
  costSharingOrMatchingRequirement: string
  archiveDate: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get user profile for filtering criteria
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('state, organization_type, focus_area')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse query parameters
    const url = new URL(req.url)
    const keyword = url.searchParams.get('keyword') || ''
    const rows = url.searchParams.get('rows') || '25'
    const startRecordNum = url.searchParams.get('startRecordNum') || '0'

    // Build Grants.gov API request
    const grantsApiUrl = new URL('https://www.grants.gov/grantsws/rest/opportunities/search/')
    grantsApiUrl.searchParams.append('oppNum', '')
    grantsApiUrl.searchParams.append('keyword', keyword)
    grantsApiUrl.searchParams.append('oppStatuses', 'forecasted|posted')
    grantsApiUrl.searchParams.append('sortBy', 'openDate|desc')
    grantsApiUrl.searchParams.append('rows', rows)
    grantsApiUrl.searchParams.append('startRecordNum', startRecordNum)

    // Call Grants.gov API
    const grantsResponse = await fetch(grantsApiUrl.toString())
    
    if (!grantsResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch grants from Grants.gov' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const grantsData = await grantsResponse.json()
    const opportunities: GrantsGovOpportunity[] = grantsData.oppHits || []

    // Filter by user criteria
    let filteredOpportunities = opportunities

    // Filter by state if provided
    if (profile.state) {
      filteredOpportunities = filteredOpportunities.filter((opp) => {
        const eligibility = opp.eligible_applicants?.toLowerCase() || ''
        const description = opp.description?.toLowerCase() || ''
        const stateCode = profile.state.toLowerCase()
        return (
          eligibility.includes(stateCode) ||
          description.includes(stateCode) ||
          eligibility.includes('all states') ||
          eligibility.includes('state') ||
          eligibility.includes('local')
        )
      })
    }

    // Filter by organization type if provided
    if (profile.organization_type) {
      filteredOpportunities = filteredOpportunities.filter((opp) => {
        const eligibility = opp.eligible_applicants?.toLowerCase() || ''
        const orgType = profile.organization_type.toLowerCase()
        return eligibility.includes(orgType)
      })
    }

    // Filter by focus area if provided
    if (profile.focus_area) {
      filteredOpportunities = filteredOpportunities.filter((opp) => {
        const title = opp.opportunityTitle?.toLowerCase() || ''
        const description = opp.description?.toLowerCase() || ''
        const category = opp.categoryOfFundingActivity?.toLowerCase() || ''
        const focusArea = profile.focus_area.toLowerCase()
        return (
          title.includes(focusArea) ||
          description.includes(focusArea) ||
          category.includes(focusArea)
        )
      })
    }

    return new Response(
      JSON.stringify({
        totalRecords: filteredOpportunities.length,
        opportunities: filteredOpportunities,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})