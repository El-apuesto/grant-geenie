import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Get the user from the JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify user has enterprise tier
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (profile?.subscription_tier !== 'enterprise') {
      return new Response(
        JSON.stringify({ error: 'Enterprise subscription required' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { action, projectId, sectionId, grantType, prompt, content } = await req.json()

    let systemPrompt = ''
    let userPrompt = ''

    // Build prompts based on action
    switch (action) {
      case 'generate_section':
        systemPrompt = `You are an elite grant writing specialist with 20+ years of experience and a 75% success rate across federal, state, and foundation grants. You understand:

1. COMPLIANCE: Federal regulations (2 CFR 200), TPS requirements, accessibility mandates
2. PSYCHOLOGY: Grant reviewer priorities and decision-making patterns
3. STRATEGY: Legal workarounds, de minimis rates, cost allocation techniques
4. IMPACT: How to frame outcomes for maximum competitive advantage

Write grant sections that:
- Use data-driven language with specific, measurable outcomes
- Demonstrate organizational capacity with concrete evidence
- Address compliance requirements proactively
- Employ proven formulas from successful $1M+ awards
- Avoid common rejection triggers (vague language, unrealistic goals, budget mismatches)

Always provide:
1. The polished section text
2. Compliance checkpoints
3. Pro tips for strengthening impact
4. Red flags to avoid`
        userPrompt = `Generate a professional ${grantType} grant section for: ${prompt}\n\nInclude specific, measurable language and cite best practices.`
        break

      case 'improve_content':
        systemPrompt = `You are a professional grant editor who increases win rates by 40%. Analyze grant text for:

1. IMPACT: Weak or vague outcomes → Specific, measurable results
2. EVIDENCE: Unsupported claims → Data-backed statements
3. COMPLIANCE: Missing requirements → Proactive compliance language
4. CLARITY: Jargon/complexity → Accessible, persuasive prose
5. STRATEGY: Missed opportunities → Competitive advantages

Provide:
- Rewritten improved text
- Specific changes made and why
- Score (1-10) with justification
- Critical gaps that could cause rejection`
        userPrompt = `Improve this ${grantType} grant section:\n\n${content}\n\nMake it worthy of a top-tier professional grant writer.`
        break

      case 'compliance_check':
        systemPrompt = `You are a TPS compliance specialist. Review grant content for:

1. Federal regulations (2 CFR 200, OMB Circulars)
2. Agency-specific requirements
3. Budget compliance (indirect rates, cost allocation)
4. Accessibility mandates (ADA, Section 504)
5. Audit requirements (Single Audit Act)

For each issue found, provide:
- Risk level (Critical/High/Medium/Low)
- Specific regulation violated
- Consequence if uncorrected
- Legal workaround or fix strategy`
        userPrompt = `Compliance check for ${grantType} grant:\n\n${content}\n\nIdentify ALL compliance risks and provide legal workarounds.`
        break

      case 'suggest_improvements':
        systemPrompt = `You are a grant strategy consultant. Analyze content and suggest:

1. Competitive advantages to emphasize
2. Partnership opportunities
3. Budget optimization strategies
4. Sustainability planning
5. Evaluation frameworks

Prioritize suggestions that:
- Increase competitiveness against other applicants
- Demonstrate long-term viability
- Show community support
- Prove organizational capacity`
        userPrompt = `Strategic improvements for ${grantType} grant section:\n\n${content}\n\nProvide 5 high-impact improvements ranked by effectiveness.`
        break

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // Use GPT-4 for professional quality
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    const openaiData = await openaiResponse.json()

    if (!openaiResponse.ok) {
      throw new Error(openaiData.error?.message || 'OpenAI API error')
    }

    const aiResponse = openaiData.choices[0].message.content
    const tokensUsed = openaiData.usage.total_tokens

    // Log the conversation to database
    await supabaseClient.from('grant_ai_conversations').insert({
      user_id: user.id,
      project_id: projectId,
      section_id: sectionId,
      conversation_history: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: aiResponse },
      ],
      tokens_used: tokensUsed,
    })

    // If improving a section, update it
    if (sectionId && action === 'improve_content') {
      await supabaseClient
        .from('grant_sections')
        .update({
          ai_suggestions: { content: aiResponse, generated_at: new Date().toISOString() },
          updated_at: new Date().toISOString(),
        })
        .eq('id', sectionId)
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        tokensUsed,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})