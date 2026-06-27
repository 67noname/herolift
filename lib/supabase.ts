'use client';

import { createClient } from '@supabase/supabase-js';

let supabase: any = null;
let cachedUrl: string | null = null;

export function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Create new client if not cached or URL changed
  if (supabase === null || cachedUrl !== supabaseUrl) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    cachedUrl = supabaseUrl;
  }

  return supabase;
}

export function hasSupabaseConfigured() {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export type Database = {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          feeling: string;
          notes: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          date: string;
          feeling: string;
          notes: string;
          tags: string[];
        };
        Update: {
          date?: string;
          feeling?: string;
          notes?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          weight: number;
          reps: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          weight: number;
          reps: number;
        };
        Update: {
          weight?: number;
          reps?: number;
        };
      };
    };
  };
};
