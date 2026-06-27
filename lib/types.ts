export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface Workout {
  id: string;
  date: string;
  sets: WorkoutSet[];
  feeling: 'light' | 'normal' | 'heavy' | 'exhausted';
  notes: string;
  tags: string[];
}

export interface Stats {
  totalWorkouts: number;
  totalTonnage: number;
  personalBest: number;
  averageWeight: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  totalSets: number;
}

export interface AnalyticsData {
  period: 'week' | 'month' | 'year';
  averageWeight: number;
  maxWeight: number;
  totalWorkouts: number;
  totalTonnage: number;
  repsData: Array<{
    date: string;
    reps: number;
  }>;
  weightData: Array<{
    date: string;
    weight: number;
  }>;
}
