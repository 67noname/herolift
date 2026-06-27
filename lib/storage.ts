'use client';

import { Workout, Stats } from './types';

const WORKOUTS_KEY = 'bench-press-workouts';

export const workoutStorage = {
  getWorkouts: (): Workout[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  addWorkout: (workout: Workout): void => {
    const workouts = workoutStorage.getWorkouts();
    workouts.push(workout);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  },

  updateWorkout: (id: string, workout: Workout): void => {
    const workouts = workoutStorage.getWorkouts();
    const index = workouts.findIndex((w) => w.id === id);
    if (index !== -1) {
      workouts[index] = workout;
      localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    }
  },

  deleteWorkout: (id: string): void => {
    const workouts = workoutStorage.getWorkouts();
    const filtered = workouts.filter((w) => w.id !== id);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
  },

  clearAllWorkouts: (): void => {
    localStorage.removeItem(WORKOUTS_KEY);
  },

  exportAsJson: (): string => {
    const workouts = workoutStorage.getWorkouts();
    return JSON.stringify(workouts, null, 2);
  },

  importFromJson: (json: string): void => {
    const workouts = JSON.parse(json);
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  },
};

export const calculateStats = (workouts: Workout[]): Stats => {
  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalTonnage: 0,
      personalBest: 0,
      averageWeight: 0,
      workoutsThisWeek: 0,
      workoutsThisMonth: 0,
      totalSets: 0,
    };
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let totalTonnage = 0;
  let personalBest = 0;
  let totalWeight = 0;
  let totalReps = 0;
  let totalSets = 0;
  let workoutsThisWeek = 0;
  let workoutsThisMonth = 0;

  workouts.forEach((workout) => {
    const workoutDate = new Date(workout.date);
    if (workoutDate >= monthAgo) workoutsThisMonth++;
    if (workoutDate >= weekAgo) workoutsThisWeek++;

    workout.sets.forEach((set) => {
      const tonnage = set.weight * set.reps;
      totalTonnage += tonnage;
      totalWeight += set.weight;
      totalReps += set.reps;
      totalSets += 1;

      if (set.weight > personalBest) {
        personalBest = set.weight;
      }
    });
  });

  return {
    totalWorkouts: workouts.length,
    totalTonnage: Math.round(totalTonnage),
    personalBest,
    averageWeight: totalSets > 0 ? Math.round(totalWeight / totalSets) : 0,
    workoutsThisWeek,
    workoutsThisMonth,
    totalSets,
  };
};

export const getWorkoutsByDateRange = (
  workouts: Workout[],
  startDate: Date,
  endDate: Date
): Workout[] => {
  return workouts.filter((workout) => {
    const date = new Date(workout.date);
    return date >= startDate && date <= endDate;
  });
};

export const groupWorkoutsByDate = (
  workouts: Workout[]
): Record<string, Workout[]> => {
  return workouts.reduce(
    (acc, workout) => {
      const date = workout.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(workout);
      return acc;
    },
    {} as Record<string, Workout[]>
  );
};
