'use client';

import { getSupabase } from './supabase';
import { Workout, WorkoutSet } from './types';

export const dbService = {
  async getWorkouts(): Promise<Workout[]> {
    try {
      const supabase = getSupabase();
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      // Fetch sets for each workout
      const workoutsWithSets = await Promise.all(
        (workouts || []).map(async (workout) => {
          const supabase = getSupabase();
          const { data: sets, error: setsError } = await supabase
            .from('workout_sets')
            .select('*')
            .eq('workout_id', workout.id);

          if (setsError) throw setsError;

          return {
            id: workout.id,
            date: workout.date,
            sets: (sets || []).map((set) => ({
              weight: set.weight,
              reps: set.reps,
            })),
            feeling: workout.feeling,
            notes: workout.notes,
            tags: workout.tags || [],
          };
        })
      );

      return workoutsWithSets;
    } catch (error) {
      console.error('[v0] Get workouts error:', error);
      return [];
    }
  },

  async addWorkout(workout: Workout): Promise<void> {
  const supabase = getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: createdWorkout, error: workoutError } = await supabase
    .from('workouts')
    .insert({
      id: workout.id,
      user_id: user.id,
      date: workout.date,
      feeling: workout.feeling,
      notes: workout.notes,
      tags: workout.tags,
    })
    .select()
    .single();

  if (workoutError) throw workoutError;

  const { error: setsError } = await supabase
    .from('workout_sets')
    .insert(
      workout.sets.map((set) => ({
        workout_id: createdWorkout.id,
        weight: set.weight,
        reps: set.reps,
      }))
    );

  if (setsError) throw setsError;
},
  async updateWorkout(id: string, workout: Workout): Promise<void> {
    try {
      const supabase = getSupabase();
      // Update workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({
          date: workout.date,
          feeling: workout.feeling,
          notes: workout.notes,
          tags: workout.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (workoutError) throw workoutError;

      // Delete old sets
      const { error: deleteError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', id);

      if (deleteError) throw deleteError;

      // Insert new sets
      if (workout.sets.length > 0) {
        const setsToInsert = workout.sets.map((set) => ({
          workout_id: id,
          weight: set.weight,
          reps: set.reps,
        }));

        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(setsToInsert);

        if (setsError) throw setsError;
      }
    } catch (error) {
      console.error('[v0] Update workout error:', error);
      throw error;
    }
  },

  async deleteWorkout(id: string): Promise<void> {
    try {
      const supabase = getSupabase();
      // Delete sets first (cascade)
      const { error: setsError } = await supabase
        .from('workout_sets')
        .delete()
        .eq('workout_id', id);

      if (setsError) throw setsError;

      // Delete workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (workoutError) throw workoutError;
    } catch (error) {
      console.error('[v0] Delete workout error:', error);
      throw error;
    }
  },

  async clearAllWorkouts(): Promise<void> {
    try {
      const supabase = getSupabase();
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete all workouts for user
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('[v0] Clear all workouts error:', error);
      throw error;
    }
  },

  subscribeToWorkouts(
    callback: (workouts: Workout[]) => void
  ): (() => void) | null {
    try {
      const supabase = getSupabase();
      const subscription = supabase
        .channel('workouts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'workouts',
          },
          async () => {
            // Refetch all workouts on any change
            const workouts = await dbService.getWorkouts();
            callback(workouts);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('[v0] Subscribe error:', error);
      return null;
    }
  },
};
