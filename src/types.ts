export interface Profile {
  id: string;
  email: string;
  organization_type: string | null;
  state: string | null;
  focus_area: string | null;
  onboarding_completed: boolean;
  subscription_status: 'free' | 'active' | 'past_due' | 'canceled';
  subscription_tier: string | null;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
  // Added missing fields
  primary_fields?: string[]; 
  questionnaire_completed?: boolean;
}

export interface User {
  id: string;
  email?: string;
}

export interface Application {
  id: string;
  user_id: string;
  grant_id?: string;
  grant_title: string;
  funder_name: string;
  application_type: 'LOI' | 'Full Application' | 'Letter of Intent' | 'Proposal';
  status: 'Draft' | 'In Progress' | 'Submitted' | 'Under Review' | 'Awarded' | 'Declined' | 'Withdrawn';
  due_date?: string;
  submitted_date?: string;
  decision_date?: string;
  amount_requested?: number;
  amount_awarded?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Grant {
  id: number;
  opportunity_id: string;
  opportunity_number: string;
  title: string;
  agency_code: string;
  agency_name: string;
  description: string;
  award_ceiling: string;
  award_floor: string;
  close_date: string;
  post_date: string;
  archive_date: string;
  apply_url: string | null;
  eligible_applicants: string;
  category_of_funding_activity: string;
  state: string | null; 
  created_at: string;
  
  opportunityTitle?: string;
  opportunityCategory?: string;
}

export interface SavedGrant {
  id: number;
  user_id: string;
  opportunity_id: string;
  opportunity_title: string;
  agency_name: string;
  description: string;
  close_date: string;
  award_ceiling: number;
  notes: string | null;
  status: 'saved' | 'applied' | 'awarded' | 'rejected';
  created_at: string;
}

export interface AgencyTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}