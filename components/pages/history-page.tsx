'use client';

import { Workout } from '@/lib/types';
import { motion } from 'framer-motion';
import { Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { t } from '@/lib/i18n';

interface HistoryPageProps {
  workouts: Workout[];
  onWorkoutDeleted: (id: string) => void;
}

export function HistoryPage({ workouts, onWorkoutDeleted }: HistoryPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const sortedWorkouts = [...workouts].reverse();

  const handleDelete = (id: string) => {
    onWorkoutDeleted(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary mb-1">📜 {t.history.title}</h1>
        <p className="text-muted-foreground text-sm">{t.nav.history}</p>
      </motion.div>

      <div className="mt-6 space-y-3">
        {sortedWorkouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">{t.history.noWorkouts}</p>
          </motion.div>
        ) : (
          sortedWorkouts.map((workout, idx) => {
            const isExpanded = expandedId === workout.id;
            const totalTonnage = workout.sets.reduce((acc, set) => acc + set.weight * set.reps, 0);
            const maxWeight = Math.max(...workout.sets.map((s) => s.weight), 0);

            return (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : workout.id)}
                  className="w-full text-left bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{workout.date}</p>
                      <p className="text-sm text-muted-foreground capitalize">{workout.feeling}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{maxWeight} {t.common.lbs}</p>
                      <p className="text-xs text-muted-foreground">{workout.sets.length} {t.editor.sets}</p>
                    </div>
                  </div>

                  {/* Quick Preview */}
                  {!isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {workout.sets.slice(0, 3).map((set, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-secondary text-xs">
                          {set.weight}×{set.reps}
                        </span>
                      ))}
                      {workout.sets.length > 3 && (
                        <span className="px-2 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">
                          +{workout.sets.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl mt-2 space-y-3"
                  >
                    {/* All Sets */}
                    <div>
                      <h4 className="font-semibold neon-text mb-2">All Sets</h4>
                      <div className="space-y-2">
                        {workout.sets.map((set, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2 px-3 bg-secondary/50 rounded-lg"
                          >
                            <span className="text-sm text-muted-foreground">Set {idx + 1}</span>
                            <span className="font-medium">
                              {set.weight} lbs × {set.reps} reps
                            </span>
                            <span className="text-xs text-primary">
                              {set.weight * set.reps} lbs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="py-2 px-3 bg-secondary/50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Total Tonnage</p>
                        <p className="font-bold neon-text">{totalTonnage} lbs</p>
                      </div>
                      <div className="py-2 px-3 bg-secondary/50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Max Weight</p>
                        <p className="font-bold neon-text">{maxWeight} lbs</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {workout.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm text-foreground">{workout.notes}</p>
                      </div>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(workout.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} /> Delete Workout
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
