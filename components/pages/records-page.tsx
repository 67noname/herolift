'use client';

import { Workout } from '@/lib/types';
import { calculateStats } from '@/lib/storage';
import { motion } from 'framer-motion';
import { Medal, Zap, TrendingUp, Flame } from 'lucide-react';
import { t } from '@/lib/i18n';

interface RecordsPageProps {
  workouts: Workout[];
}

export function RecordsPage({ workouts }: RecordsPageProps) {
  const stats = calculateStats(workouts);

  // Find PRs by weight
  let pr1rm = 0;
  let prHighestTonnage = 0;
  let prMostReps = 0;
  const weightRecords: Record<number, number> = {};

  workouts.forEach((workout) => {
    let sessionTonnage = 0;
    let maxReps = 0;

    workout.sets.forEach((set) => {
      pr1rm = Math.max(pr1rm, set.weight);
      prMostReps = Math.max(prMostReps, set.reps);
      sessionTonnage += set.weight * set.reps;
      maxReps = Math.max(maxReps, set.reps);

      if (!weightRecords[set.weight]) {
        weightRecords[set.weight] = 0;
      }
      weightRecords[set.weight] = Math.max(weightRecords[set.weight], set.reps);
    });

    prHighestTonnage = Math.max(prHighestTonnage, sessionTonnage);
  });

  const topWeights = Object.entries(weightRecords)
    .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
    .slice(0, 5);

  return (
    <div className="px-4 pt-6 pb-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary mb-1">🏆 {t.records.title}</h1>
        <p className="text-muted-foreground text-sm">{t.nav.records}</p>
      </motion.div>

      {workouts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 mt-6"
        >
          <p className="text-muted-foreground">No records yet. Start lifting!</p>
        </motion.div>
      ) : (
        <>
          {/* Main Records */}
          <div className="space-y-3 mt-6 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Personal Best (1RM)</span>
                <Medal size={24} className="text-primary drop-shadow-lg drop-shadow-primary/50" />
              </div>
              <p className="text-4xl font-bold neon-text">{pr1rm}</p>
              <p className="text-xs text-muted-foreground mt-2">lbs</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Highest Tonnage (Session)</span>
                <TrendingUp size={24} className="text-primary" />
              </div>
              <p className="text-4xl font-bold neon-text">{prHighestTonnage}</p>
              <p className="text-xs text-muted-foreground mt-2">lbs</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Most Reps (Single Set)</span>
                <Zap size={24} className="text-primary" />
              </div>
              <p className="text-4xl font-bold neon-text">{prMostReps}</p>
              <p className="text-xs text-muted-foreground mt-2">reps</p>
            </motion.div>
          </div>

          {/* Top Weights */}
          {topWeights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
            >
              <h3 className="font-semibold neon-text mb-4">Top Weight Lifts</h3>
              <div className="space-y-3">
                {topWeights.map(([weight, reps], idx) => (
                  <motion.div
                    key={weight}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold neon-text">#{idx + 1}</span>
                      <div>
                        <p className="font-semibold text-foreground">{weight} lbs</p>
                        <p className="text-xs text-muted-foreground">
                          {reps} rep{reps !== 1 ? 's' : ''} max
                        </p>
                      </div>
                    </div>
                    <span className="text-primary font-bold">{weight * reps}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300 mt-6"
          >
            <h3 className="font-semibold neon-text mb-4">All-Time Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Workouts</p>
                <p className="text-2xl font-bold neon-text">{stats.totalWorkouts}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Sets</p>
                <p className="text-2xl font-bold neon-text">{stats.totalSets}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Tonnage</p>
                <p className="text-2xl font-bold neon-text">{stats.totalTonnage}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Avg Weight</p>
                <p className="text-2xl font-bold neon-text">{stats.averageWeight}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
