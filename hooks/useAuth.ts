'use client';

import { useEffect, useState, useCallback } from 'react';
import { authService } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    const supabase = getSupabase();
    
    if (!supabase) {
      setIsConfigured(false);
      setLoading(false);
      return;
    }

    setIsConfigured(true);

    // Check current user on mount
    authService.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }).catch((err) => {
      console.warn('[v0] Failed to get current user:', err);
      setLoading(false);
    });

    // Subscribe to auth changes
    try {
      const unsubscribe = authService.onAuthStateChange((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (err) {
      console.warn('[v0] Failed to subscribe to auth changes:', err);
      setLoading(false);
    }
  }, []);

  const sendMagicLink = useCallback(
    async (email: string) => {
      try {
        setError(null);
        await authService.sendMagicLink(email);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send magic link';
        setError(message);
        return { success: false, error: message };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isConfigured,
    sendMagicLink,
    logout,
  };
}
