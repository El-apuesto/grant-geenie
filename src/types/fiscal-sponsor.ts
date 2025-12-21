// =====================================================
// FISCAL SPONSORS - TYPESCRIPT TYPES
// =====================================================

export interface FiscalSponsor {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  country: string;
  focus_areas: string[];
  eligibility: string | null;
  fee_structure: string | null;
  services: string | null;
  website: string | null;
  accepts_applications: boolean;
  min_project_size: string | null;
  geographic_focus: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FiscalSponsorMatch {
  sponsor_id: number;
  sponsor_name: string;
  sponsor_city: string | null;
  sponsor_state: string | null;
  sponsor_website: string | null;
  sponsor_focus_areas: string[];
  sponsor_fee_structure: string | null;
  sponsor_eligibility: string | null;
  match_score: number;
  match_reasons: string[];
}

export interface FiscalSponsorSearchParams {
  focusAreas: string[];
  state?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

// Helper function to call the matching function
export async function matchFiscalSponsors(
  supabase: any,
  params: FiscalSponsorSearchParams
): Promise<FiscalSponsorMatch[]> {
  const { data, error } = await supabase.rpc('match_fiscal_sponsors', {
    user_focus_areas: params.focusAreas,
    user_state: params.state || null,
    user_country: params.country || 'USA',
    match_limit: params.limit || 5,
    match_offset: params.offset || 0,
  });

  if (error) {
    console.error('Error matching fiscal sponsors:', error);
    return [];
  }

  return data || [];
}
