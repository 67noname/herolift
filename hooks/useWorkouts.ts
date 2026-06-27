'use client';

import { useState, useEffect, useCallback } from 'react';
import { dbService } from '@/lib/db';
import { Workout } from '@/lib/types';

export function useWorkouts(userId: string | null) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workouts on mount or when userId changes
  useEffect(() => {
    if (!userId) {
      setWorkouts([]);
      return;
    }

    const loadWorkouts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dbService.getWorkouts();
        setWorkouts(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load workouts';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();

    // Subscribe to real-time updates
    const unsubscribe = dbService.subscribeToWorkouts((updatedWorkouts) => {
      setWorkouts(updatedWorkouts);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);

  const addWorkout = useCallback(
    async (workout: Workout) => {
      try {
        setError(null);
        await dbService.addWorkout(workout);
        const updated = await dbService.getWorkouts();
        setWorkouts(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add workout';
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateWorkout = useCallback(
    async (id: string, workout: Workout) => {
      try {
        setError(null);
        await dbService.updateWorkout(id, workout);
        const updated = await dbService.getWorkouts();
        setWorkouts(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update workout';
        setError(message);
        throw err;
      }
    },
    []
  );

  const deleteWorkout = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await dbService.deleteWorkout(id);
        const updated = await dbService.getWorkouts();
        setWorkouts(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete workout';
        setError(message);
        throw err;
      }
    },
    []
  );

  const clearAllWorkouts = useCallback(async () => {
    try {
      setError(null);
      await dbService.clearAllWorkouts();
      setWorkouts([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear workouts';
      setError(message);
      throw err;
    }
  }, []);

  return {
    workouts,
    loading,
    error,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    clearAllWorkouts,
  };
}
