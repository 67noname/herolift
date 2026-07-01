'use client';

import { useState } from 'react';
import { Workout } from '@/lib/types';
import { calculateStats } from '@/lib/storage';
import { WorkoutEditor } from '@/components/workout/workout-editor';
import { FloatingButton } from '@/components/layout/floating-button';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { t } from '@/lib/i18n';

interface HomePageProps {
  workouts: Workout[];
  onWorkoutAdded: (workout: Workout) => void;
}

export function HomePage({ workouts, onWorkoutAdded }: HomePageProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [newRecord, setNewRecord] = useState<{
  weight: number;
  previousWeight: number;
} | null>(null);
  const stats = calculateStats(workouts);
  const lastWorkout = workouts[workouts.length - 1];

  const maxWeight = lastWorkout
    ? Math.max(...lastWorkout.sets.map((s) => s.weight))
    : 0;
  const bestSet = lastWorkout
    ? lastWorkout.sets.reduce((max, set) => (set.weight > max.weight ? set : max))
    : null;
  const currentBestWeight =
  workouts.length > 0
    ? Math.max(...workouts.flatMap((workout) => workout.sets.map((set) => set.weight)))
    : 0;

const handleWorkoutSave = (workout: Workout) => {
  const workoutBestWeight =
    workout.sets.length > 0
      ? Math.max(...workout.sets.map((set) => set.weight))
      : 0;

  if (workoutBestWeight > currentBestWeight) {
    setNewRecord({
      weight: workoutBestWeight,
      previousWeight: currentBestWeight,
    });
  } else {
    setNewRecord(null);
  }

  onWorkoutAdded(workout);
  setShowEditor(false);
};

  return (
    <>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-primary mb-1">{t.appName}</h1>
          <p className="text-muted-foreground text-sm">{t.nav.home}</p>
        </motion.div>

        {newRecord && (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className="bg-primary/10 border border-primary/30 backdrop-blur-sm p-4 rounded-2xl mt-6"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-bold text-primary mb-1">
          🏆 Новый рекорд!
        </h3>

        <p className="text-sm text-foreground">
          Ты обновил максимум: {newRecord.weight} {t.common.lbs}
        </p>

        {newRecord.previousWeight > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Было: {newRecord.previousWeight} {t.common.lbs} · Прирост: +
            {newRecord.weight - newRecord.previousWeight} {t.common.lbs}
          </p>
        )}
      </div>

      <button
        onClick={() => setNewRecord(null)}
        className="text-muted-foreground hover:text-primary transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  </motion.div>
)}

        {/* Last Workout Card */}
        {lastWorkout && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl mt-6 mb-6"
          >
            <h3 className="font-semibold text-primary mb-3 text-sm">
              📅 {t.home.lastWorkout}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.home.date}:</span>
                <span className="text-foreground font-medium">{lastWorkout.date}</span>
              </div>
              {bestSet && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t.home.bestSet}:</span>
                  <span className="text-primary font-bold">
                    {bestSet.weight} {t.common.lbs} × {bestSet.reps}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.home.setCount}:</span>
                <span className="text-foreground font-medium">{lastWorkout.sets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t.home.feeling}:</span>
                <span className="text-primary font-medium capitalize">
                  {lastWorkout.feeling}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards - 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Best Day */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground leading-tight">
                🏆 {t.home.bestDay}
              </span>
            </div>
            <p className="text-2xl font-bold text-primary">{maxWeight}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.common.lbs}</p>
          </motion.div>

          {/* Average Weight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground leading-tight">
                📊 {t.home.avgWeight}
              </span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.averageWeight}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.common.lbs}</p>
          </motion.div>

          {/* Total Tonnage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground leading-tight">
                💪 {t.home.totalTonnage}
              </span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.totalTonnage}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.common.lbs}</p>
          </motion.div>

          {/* Total Workouts */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground leading-tight">
                🔥 {t.records.totalWorkouts}
              </span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground mt-1">тренировок</p>
          </motion.div>
        </div>

        {/* Empty State */}
        {workouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar size={48} className="text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">{t.home.noWorkouts}</p>
            <p className="text-xs text-muted-foreground">
              {t.editor.save}
            </p>
          </motion.div>
        )}
      </div>

      {/* Floating Button */}
      <FloatingButton onClick={() => setShowEditor(true)} />

      {/* Workout Editor Modal */}
      {showEditor && (
        <WorkoutEditor onSave={handleWorkoutSave} onClose={() => setShowEditor(false)} />
      )}
    </>
  );
}
