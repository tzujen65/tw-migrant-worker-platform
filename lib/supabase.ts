import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

export type UserRole = 'admin' | 'company_admin' | 'user';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  company_name?: string;
  company_tax_id?: string;
  phone?: string;
  is_approved: boolean;
  email_confirmed: boolean;
  created_at: string;
  updated_at?: string;
};

export type Job = {
  id: number;
  title: string;
  country: string;
  category: string;
  salary_min: number;
  salary_max: number;
  location: string;
  shift: string;
  deadline: string | null;
  description: string;
  is_active: boolean;
  created_at: string;
  company_id?: number;
  company_name?: string;
};

export type Agency = {
  id: number;
  name: string;
  country: string;
  services: string;
  description: string;
  is_verified: boolean;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
};

export type Application = {
  id: number;
  job_id: number;
  job_title: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  message?: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'rejected';
  created_at: string;
};

