-- Grant Writing Assistant Tables for Enterprise Tier

-- 1. Grant Writing Projects (tracks each grant being written)
CREATE TABLE IF NOT EXISTS grant_writing_projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shadow_profile_id uuid REFERENCES shadow_profiles(id) ON DELETE SET NULL,
  grant_id text, -- Reference to the grant they're applying for
  project_title text NOT NULL,
  grant_type text NOT NULL, -- 'federal', 'state', 'foundation', 'corporate'
  funding_amount bigint, -- Amount requested in cents
  deadline timestamp with time zone,
  status text DEFAULT 'draft', -- 'draft', 'in_progress', 'review', 'submitted', 'awarded', 'rejected'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Grant Sections (stores each section of the grant)
CREATE TABLE IF NOT EXISTS grant_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES grant_writing_projects(id) ON DELETE CASCADE NOT NULL,
  section_type text NOT NULL, -- 'executive_summary', 'needs_statement', 'goals_objectives', 'methods', 'evaluation', 'budget', 'sustainability'
  title text NOT NULL,
  content text, -- The actual written content
  ai_suggestions jsonb, -- AI-generated improvements/suggestions
  compliance_notes jsonb, -- Legal/TPS compliance notes
  word_count integer DEFAULT 0,
  character_limit integer, -- If section has a limit
  version integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Professional Templates Library
CREATE TABLE IF NOT EXISTS grant_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name text NOT NULL,
  grant_type text NOT NULL,
  funding_agency text, -- 'NEA', 'NIH', 'NSF', etc.
  section_type text NOT NULL,
  template_content text NOT NULL,
  success_rate decimal, -- Historical success rate with this template
  pro_tips jsonb, -- Array of professional tips
  compliance_requirements jsonb, -- Legal requirements for this template
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TPS Compliance Rules Database
CREATE TABLE IF NOT EXISTS tps_compliance_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_name text NOT NULL,
  grant_type text NOT NULL,
  agency text,
  rule_category text, -- 'formatting', 'content', 'legal', 'budget'
  rule_description text NOT NULL,
  is_mandatory boolean DEFAULT true,
  penalty_for_violation text,
  workaround_strategy text, -- Legal ways to meet requirement
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. AI Assistant Conversations
CREATE TABLE IF NOT EXISTS grant_ai_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES grant_writing_projects(id) ON DELETE CASCADE,
  section_id uuid REFERENCES grant_sections(id) ON DELETE CASCADE,
  conversation_history jsonb NOT NULL, -- Array of messages
  tokens_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Successful Grant Examples (anonymized)
CREATE TABLE IF NOT EXISTS successful_grant_examples (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  grant_type text NOT NULL,
  funding_agency text,
  award_amount bigint,
  year_awarded integer,
  anonymized_content text, -- Redacted successful grant text
  key_strengths jsonb, -- What made this grant succeed
  sector text, -- 'arts', 'education', 'health', etc.
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE grant_writing_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tps_compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE successful_grant_examples ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grant_writing_projects
CREATE POLICY "Users can view own grant projects"
  ON grant_writing_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grant projects"
  ON grant_writing_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grant projects"
  ON grant_writing_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grant projects"
  ON grant_writing_projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for grant_sections
CREATE POLICY "Users can view own grant sections"
  ON grant_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM grant_writing_projects
    WHERE grant_writing_projects.id = grant_sections.project_id
    AND grant_writing_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own grant sections"
  ON grant_sections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM grant_writing_projects
    WHERE grant_writing_projects.id = grant_sections.project_id
    AND grant_writing_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own grant sections"
  ON grant_sections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM grant_writing_projects
    WHERE grant_writing_projects.id = grant_sections.project_id
    AND grant_writing_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own grant sections"
  ON grant_sections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM grant_writing_projects
    WHERE grant_writing_projects.id = grant_sections.project_id
    AND grant_writing_projects.user_id = auth.uid()
  ));

-- RLS Policies for templates (read-only for all authenticated users)
CREATE POLICY "All users can view templates"
  ON grant_templates FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for TPS compliance rules (read-only for all authenticated users)
CREATE POLICY "All users can view compliance rules"
  ON tps_compliance_rules FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for AI conversations
CREATE POLICY "Users can view own AI conversations"
  ON grant_ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI conversations"
  ON grant_ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for successful examples (read-only for all authenticated users)
CREATE POLICY "All users can view successful examples"
  ON successful_grant_examples FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_grant_projects_user_id ON grant_writing_projects(user_id);
CREATE INDEX idx_grant_sections_project_id ON grant_sections(project_id);
CREATE INDEX idx_grant_templates_type ON grant_templates(grant_type);
CREATE INDEX idx_tps_rules_type ON tps_compliance_rules(grant_type);
CREATE INDEX idx_ai_conversations_user_id ON grant_ai_conversations(user_id);
CREATE INDEX idx_successful_examples_type ON successful_grant_examples(grant_type);

-- Insert some starter professional templates
INSERT INTO grant_templates (template_name, grant_type, funding_agency, section_type, template_content, success_rate, pro_tips, compliance_requirements) VALUES
(
  'NEA Executive Summary - Professional',
  'federal',
  'NEA',
  'executive_summary',
  'PROJECT OVERVIEW

[Organization Name] respectfully requests $[Amount] from the National Endowment for the Arts to support [Project Name], a [duration]-[type] program that will [primary impact statement].

PROJECT IMPACT
This project will directly serve [number] [demographic] participants through [activities], with anticipated outcomes including:
- [Measurable Outcome 1]
- [Measurable Outcome 2]
- [Measurable Outcome 3]

ORGANIZATIONAL CAPACITY
[Organization Name] has [years] years of experience delivering [type] programs, with proven success in [key achievement]. Our team includes [key personnel credentials].

SUSTAINABILITY
Project sustainability will be ensured through [revenue model], partnerships with [partners], and [long-term plan].',
  0.67,
  '[
    "Lead with impact numbers in first sentence",
    "Use active voice throughout",
    "Keep under 500 words for NEA applications",
    "Emphasize community benefit over organizational needs",
    "Include diverse demographics in participant description"
  ]'::jsonb,
  '{
    "word_limit": 500,
    "required_elements": ["project description", "impact statement", "organizational capacity", "budget overview"],
    "formatting": "single-spaced, 12pt Times New Roman"
  }'::jsonb
),
(
  'NIH Specific Aims - Research Focus',
  'federal',
  'NIH',
  'goals_objectives',
  'SPECIFIC AIMS

Significance: [Disease/condition] affects [number] Americans annually, with [impact statistics]. Current treatments are limited by [gap in knowledge/treatment].

Innovation: This proposal introduces [novel approach] that addresses [critical gap] through [methodology]. This represents a paradigm shift from [current approach] to [new approach].

Hypothesis: We hypothesize that [clear, testable statement].

AIM 1: [Action verb] [specific objective]
Approach: [Brief methodology]
Expected Outcome: [Measurable result]
Impact: [How this advances field]

AIM 2: [Action verb] [specific objective]
Approach: [Brief methodology]
Expected Outcome: [Measurable result]
Impact: [How this advances field]

AIM 3: [Action verb] [specific objective]
Approach: [Brief methodology]
Expected Outcome: [Measurable result]
Impact: [How this advances field]

IMPACT: Successful completion will [transformative statement about field advancement].',
  0.54,
  '[
    "NIH success rates are 10-20%, so precision is critical",
    "Use strong action verbs: Determine, Establish, Define, Characterize",
    "Keep aims independent but complementary",
    "One page maximum - reviewers spend 30 seconds here",
    "End each aim with measurable impact",
    "Cite preliminary data to show feasibility"
  ]'::jsonb,
  '{
    "page_limit": 1,
    "format": "PDF",
    "required_sections": ["significance", "innovation", "hypothesis", "specific_aims"],
    "font": "Arial 11pt minimum"
  }'::jsonb
);

-- Insert TPS compliance rules examples
INSERT INTO tps_compliance_rules (rule_name, grant_type, agency, rule_category, rule_description, is_mandatory, penalty_for_violation, workaround_strategy) VALUES
(
  'Federal Single Audit Requirement',
  'federal',
  'All Federal Agencies',
  'legal',
  'Organizations expending $750,000+ in federal funds must undergo annual Single Audit per 2 CFR 200.501',
  true,
  'Ineligibility for future federal funding, potential repayment demands',
  'Budget federal grants to stay under $750K threshold across ALL federal sources, or plan audit costs into indirect rates'
),
(
  'NEA Accessibility Mandate',
  'federal',
  'NEA',
  'content',
  'All NEA-funded activities must meet ADA accessibility standards and include accessibility plan',
  true,
  'Grant rejection or requirement to return funds',
  'Include detailed accessibility accommodations in budget: ASL interpretation ($150-300/hr), CART services, wheelchair access verification, sensory-friendly performances'
),
(
  'Indirect Cost Rate Negotiation',
  'federal',
  'All Federal Agencies',
  'budget',
  'Indirect costs must be negotiated with cognizant federal agency or use 10% de minimis rate',
  false,
  'Reduced budget flexibility',
  'If no negotiated rate, claim 10% de minimis under 2 CFR 200.414(f). Takes 30 seconds vs. 6-month negotiation. Sacrifice ~5-8% potential recovery but gain speed.'
);

COMMENT ON TABLE grant_writing_projects IS 'Enterprise feature: Professional grant writing project management';
COMMENT ON TABLE grant_templates IS 'Enterprise feature: Professional grant writing templates with proven success rates';
COMMENT ON TABLE tps_compliance_rules IS 'Enterprise feature: TPS compliance database with legal workarounds';