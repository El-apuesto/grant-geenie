export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  state: string;
  org_type: string;
  questionnaire_completed: boolean;
  has_coupon_code: string | null;
  subscription_status: string | null; // 'active', 'past_due', 'canceled', etc.
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean | null;
  created_at: string;
  // Questionnaire fields
  business_location?: string;
  legal_entity?: string;
  annual_revenue?: string;
  grant_amount?: string[];
  primary_fields?: string[]; // Used for fiscal sponsor matching
  demographic_focus?: string[];
  project_stage?: string;
  fiscal_sponsor?: string;
}

export interface Grant {
  id: string;
  title: string;
  funder_name: string;
  funder_type: string;
  description: string;
  award_min: number;
  award_max: number;
  deadline: string | null;
  is_rolling: boolean;
  is_active: boolean;
  apply_url: string;
  states: string[] | null;
  countries: string[] | null;
  entity_types: string[] | null;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  grant_id: string | null;
  grant_title: string;
  funder_name: string;
  application_type: 'LOI' | 'Full Application' | 'Letter of Intent' | 'Proposal';
  status: 'Draft' | 'In Progress' | 'Submitted' | 'Under Review' | 'Awarded' | 'Declined' | 'Withdrawn';
  due_date: string | null;
  submitted_date: string | null;
  decision_date: string | null;
  amount_requested: number | null;
  amount_awarded: number | null;
  notes: string | null;
  attachments: any[];
  created_at: string;
  updated_at: string;
}
