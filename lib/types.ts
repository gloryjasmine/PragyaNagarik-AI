export interface Profile {
  name?: string;
  state?: string;
  age?: number;
  gender?: string;
  occupation?: string;
  education?: string;
  annual_income?: number;
  category?: string;
  caste_category?: string;
  preferred_language?: string;
  digital_comfort?: string;
}

export interface SchemeDocument {
  name: string;
  description: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  state?: string;
  state_ut?: string;
  government_level?: string;
  scheme_service_type?: string;
  department?: string;
  benefits: string[];
  eligibility: Record<string, any>;
  official_url: string;
  application_url: string | null;
  information_status?: string;
  verification_status?: string;
  last_verified_date?: string;
  is_active?: boolean;
  documents: SchemeDocument[];
}

export interface EligibilityResult {
  status: 'Eligible' | 'Needs review';
  score: number;
  matched_conditions: string[];
  failed_conditions: string[];
  missing_information: string[];
  required_documents: SchemeDocument[];
  explanation: string;
}

export interface RecommendationResult {
  scheme: Scheme;
  match_score: number;
  why: string[];
  eligibility: EligibilityResult;
}

export interface NavigatorStep {
  id: string;
  step_number: number;
  title: string;
  instruction: string;
  screenshot_url?: string | null;
  highlight_x?: number;
  highlight_y?: number;
  highlight_width?: number;
  highlight_height?: number;
}

export interface NavigatorGuide {
  scheme_id: string;
  official_only: boolean;
  steps: NavigatorStep[];
}
