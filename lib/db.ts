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
    const supabase = getSupabase();

    const { error } = await supabase.rpc('edit_workout_v1', {
      p_workout_id: id,
      p_date: workout.date,
      p_feeling: workout.feeling,
      p_notes: workout.notes ?? '',
      p_tags: workout.tags ?? [],
      p_sets: workout.sets.map((set) => ({
        weight: set.weight,
        reps: set.reps,
      })),
    });

    if (error) {
      console.error('Ошибка изменения тренировки:', error);
      throw error;
    }
  },

 async deleteWorkout(id: string): Promise<void> {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.rpc('delete_workout', {
      p_workout_id: id,
    });

    if (error) throw error;
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
  // Realtime временно отключен
  return null;
},
};
