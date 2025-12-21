export interface GrantDeadline {
  id: string;
  user_id: string;
  grant_id: string;
  grant_title: string;
  funder_name: string;
  deadline: string; // ISO date
  is_rolling: boolean;
  status: 'upcoming' | 'submitted' | 'awarded' | 'declined' | 'missed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  deadlines: GrantDeadline[];
  count: number;
}

export interface CalendarMonth {
  month: number; // 0-11
  year: number;
  days: CalendarDay[];
  firstDayOfWeek: number; // 0-6 (Sunday-Saturday)
}

export interface DeadlineStats {
  total: number;
  upcoming: number;
  submitted: number;
  awarded: number;
  declined: number;
  missed: number;
  daysUntilNext: number | null;
  nextDeadlineDate: string | null;
}
