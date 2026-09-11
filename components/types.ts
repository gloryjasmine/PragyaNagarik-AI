import { Scheme, SchemeDocument } from '../lib/types';

export type ScreenName =
  | 'splash'
  | 'onboarding'
  | 'language'
  | 'login'
  | 'signup'
  | 'otp'
  | 'profile-setup'
  | 'dashboard'
  | 'copilot'
  | 'schemes'
  | 'scheme-detail'
  | 'eligibility'
  | 'documents'
  | 'navigator'
  | 'services'
  | 'saved'
  | 'notifications'
  | 'profile'
  | 'help'
  | 'compare'
  | 'admin-login'
  | 'admin-dashboard';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  district: string;
  age: number;
  gender?: string;
  occupation: string;
  education?: string;
  annual_income: number;
  category: string;
  preferred_language: string;
  digital_comfort: 'Standard' | 'Comfortable' | 'Large Text';
  role: 'citizen' | 'admin';
  profile_completed?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'recommendation' | 'update' | 'document' | 'tip';
  title: string;
  message: string;
  time: string;
  read: boolean;
  schemeId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  schemeId?: string;
  verificationNote?: string;
  suggestedAction?: {
    label: string;
    action: () => void;
  };
}
