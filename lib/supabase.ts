import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'admin' | 'student';
          class_number: number | null;
          profile_image: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          full_name: string;
          role: 'admin' | 'student';
          class_number?: number | null;
          profile_image?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: 'admin' | 'student';
          class_number?: number | null;
          profile_image?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};