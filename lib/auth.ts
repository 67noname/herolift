'use client';

import { getSupabase } from './supabase';

export const authService = {
  async sendMagicLink(email: string) {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase not configured');
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[v0] Magic link error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return null;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('[v0] Get user error:', error);
      return null;
    }
  },

  async logout() {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return { success: true };
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('[v0] Logout error:', error);
      throw error;
    }
  },

  onAuthStateChange(callback: (user: any | null) => void) {
  const supabase = getSupabase();

  if (!supabase) {
    callback(null);
    return () => {};
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}
