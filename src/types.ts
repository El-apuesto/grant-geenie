export interface Profile {
  id: string;
  email: string;
  organization_type: string | null; // Reverted to organization_type
  state: string | null;
  focus_area: string | null;
  onboarding_completed: boolean;
  subscription_status: 'free' | 'active' | 'past_due' | 'canceled';
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
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
  state: string | null; // For state-specific filtering
  created_at: string;
  
  // These fields are returned by the Grants.gov API but might not be in our DB
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