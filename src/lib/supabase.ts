import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lazy initialization to allow ErrorBoundary to catch configuration errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
    
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n\n` +
      `Please create a .env file in the project root with:\n` +
      `VITE_SUPABASE_URL=your_supabase_url\n` +
      `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n` +
      `Get these values from: https://supabase.com/dashboard -> Your Project -> Settings -> API`
    );
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Create a Proxy to intercept all property access and call getSupabaseClient() lazily
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export type Profile = {
  id: string;
  full_name: string;
  target_role: string;
  graduation_year: number | null;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  total_hours: number;
  completed_hours: number;
  status: string;
  priority: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type PracticeProblem = {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  difficulty: string;
  platform: string;
  problem_url: string;
  status: string;
  attempts: number;
  notes: string;
  solved_at: string | null;
  created_at: string;
};

export type Company = {
  id: string;
  user_id: string;
  name: string;
  role: string;
  application_status: string;
  application_deadline: string | null;
  ctc: string;
  preparation_notes: string;
  interview_date: string | null;
  created_at: string;
  updated_at: string;
};

export type StudySession = {
  id: string;
  user_id: string;
  topic_id: string | null;
  duration_minutes: number;
  session_date: string;
  notes: string;
  created_at: string;
};
