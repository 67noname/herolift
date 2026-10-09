'use client';

import { useState } from 'react';
import { Workout } from '@/lib/types';
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import { WorkoutEditor } from '@/components/workout/workout-editor';
import { t } from '@/lib/i18n';

interface HistoryPageProps {
  workouts: Workout[];
  onWorkoutDeleted: (id: string) => void | Promise<void>;
  onWorkoutUpdated: (id: string, workout: Workout) => Promise<void>;
}

export function HistoryPage({
  workouts,
  onWorkoutDeleted,
  onWorkoutUpdated,
}: HistoryPageProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = async (id: string) => {
    if (deletingId) return;

    setDeletingId(id);

    try {
      await onWorkoutDeleted(id);
      setExpandedId(null);
    } catch (error) {
      console.error('Ошибка удаления тренировки:', error);
      alert('Не удалось удалить тренировку. Попробуй ещё раз.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-primary mb-1">
            📜 {t.history.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t.nav.history}
          </p>
        </motion.div>

        <div className="mt-6 space-y-3">
          {sortedWorkouts.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {t.history.noWorkouts}
            </p>
          ) : (
            sortedWorkouts.map((workout, index) => {
              const isExpanded = expandedId === workout.id;
              const totalTonnage = workout.sets.reduce(
                (total, set) => total + set.weight * set.reps,
                0
              );
              const maxWeight = Math.max(
                ...workout.sets.map((set) => set.weight),
                0
              );

              return (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : workout.id)
                    }
                    className="w-full text-left bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl hover:bg-card/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {workout.date}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {workout.feeling}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {maxWeight} {t.common.lbs}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {workout.sets.length} {t.editor.sets}
                        </p>
                      </div>
                    </div>

                    {(workout.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {workout.tags.map((tag, tagIndex) => (
                          <span
                            key={`${tag}-${tagIndex}`}
                            className="max-w-full break-words px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {!isExpanded && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {workout.sets.slice(0, 3).map((set, setIndex) => (
                          <span
                            key={setIndex}
                            className="px-2 py-1 rounded-lg bg-secondary text-xs"
                          >
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

                  {isExpanded && (
                    <div className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl mt-2 space-y-3">
                      <div>
                        <h4 className="font-semibold text-primary mb-2">
                          Все подходы
                        </h4>

                        <div className="space-y-2">
                          {workout.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className="flex justify-between items-center gap-2 py-2 px-3 bg-secondary/50 rounded-lg"
                            >
                              <span className="text-xs text-muted-foreground">
                                #{setIndex + 1}
                              </span>
                              <span className="font-medium text-sm">
                                {set.weight} {t.common.lbs} × {set.reps}
                              </span>
                              <span className="text-xs text-primary">
                                {set.weight * set.reps} {t.common.lbs}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="py-2 px-3 bg-secondary/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">
                            Общий тоннаж
                          </p>
                          <p className="font-bold text-primary">
                            {totalTonnage} {t.common.lbs}
                          </p>
                        </div>

                        <div className="py-2 px-3 bg-secondary/50 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">
                            Максимальный вес
                          </p>
                          <p className="font-bold text-primary">
                            {maxWeight} {t.common.lbs}
                          </p>
                        </div>
                      </div>

                      {workout.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Заметки
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                            {workout.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-stretch gap-2">
                        <button
                          type="button"
                          disabled={deletingId !== null}
                          onClick={() => void handleDelete(workout.id)}
                          className="flex-1 flex items-center justify-center gap-2 min-h-12 py-3 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors text-sm font-bold disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                          {deletingId === workout.id
                            ? 'Удаление…'
                            : 'Удалить тренировку'}
                        </button>

                        <button
                          type="button"
                          disabled={deletingId !== null}
                          onClick={() => setEditingWorkout(workout)}
                          aria-label="Изменить тренировку"
                          title="Изменить тренировку"
                          className="w-12 shrink-0 flex items-center justify-center bg-secondary/50 hover:bg-primary/15 border border-primary/20 text-primary rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Pencil size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {editingWorkout && (
        <WorkoutEditor
          key={editingWorkout.id}
          initialWorkout={editingWorkout}
          onSave={async (updatedWorkout) => {
            await onWorkoutUpdated(editingWorkout.id, updatedWorkout);
          }}
          onClose={() => setEditingWorkout(null)}
        />
      )}
    </>
  );
}
