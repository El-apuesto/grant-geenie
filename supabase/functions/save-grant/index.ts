import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SaveGrantRequest {
  opportunityId: string
  opportunityNumber: string
  opportunityTitle: string
  agencyName: string
  closeDate: string
  postDate: string
  description?: string
  awardCeiling?: number
  awardFloor?: number
  estimatedTotalProgramFunding?: number
  eligibleApplicants?: string
  categoryOfFundingActivity?: string
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

    if (req.method === 'POST') {
      // Save a new grant
      const grantData: SaveGrantRequest = await req.json()

      // Validate required fields
      if (!grantData.opportunityId || !grantData.opportunityTitle) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: opportunityId and opportunityTitle' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Check if grant is already saved by this user
      const { data: existing } = await supabaseClient
        .from('saved_grants')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', grantData.opportunityId)
        .single()

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Grant already saved', grant: existing }),
          {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Insert the saved grant
      const { data, error } = await supabaseClient
        .from('saved_grants')
        .insert({
          user_id: user.id,
          opportunity_id: grantData.opportunityId,
          opportunity_number: grantData.opportunityNumber,
          opportunity_title: grantData.opportunityTitle,
          agency_name: grantData.agencyName,
          close_date: grantData.closeDate,
          post_date: grantData.postDate,
          description: grantData.description,
          award_ceiling: grantData.awardCeiling,
          award_floor: grantData.awardFloor,
          estimated_total_program_funding: grantData.estimatedTotalProgramFunding,
          eligible_applicants: grantData.eligibleApplicants,
          category_of_funding_activity: grantData.categoryOfFundingActivity,
        })
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, grant: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else if (req.method === 'DELETE') {
      // Delete a saved grant
      const url = new URL(req.url)
      const opportunityId = url.searchParams.get('opportunityId')

      if (!opportunityId) {
        return new Response(
          JSON.stringify({ error: 'Missing opportunityId parameter' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const { error } = await supabaseClient
        .from('saved_grants')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else if (req.method === 'GET') {
      // Get all saved grants for the user
      const { data, error } = await supabaseClient
        .from('saved_grants')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ grants: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})