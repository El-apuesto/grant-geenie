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
}

export interface Grant {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  state: string | null; // null = federal
  org_types: string[];
  url: string;
  created_at: string;
}
