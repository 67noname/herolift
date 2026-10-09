'use client';

import { useRef, useState } from 'react';
import { Workout, WorkoutSet } from '@/lib/types';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { t } from '@/lib/i18n';

interface WorkoutEditorProps {
  initialWorkout?: Workout;
  onSave: (workout: Workout) => Promise<void>;
  onClose: () => void;
}

const feelingOptions = [
  { key: 'excellent', emoji: '😀', label: t.home.excellent },
  { key: 'good', emoji: '🙂', label: t.home.good },
  { key: 'normal', emoji: '😐', label: t.home.normal },
  { key: 'hard', emoji: '😫', label: t.home.hard },
];

const tagOptions = [
  t.editor.technique,
  t.editor.unload,
  t.editor.strength,
  t.editor.easy,
];

export function WorkoutEditor({
  initialWorkout,
  onSave,
  onClose,
}: WorkoutEditorProps) {
  const [date, setDate] = useState(() => {
    if (initialWorkout) return initialWorkout.date;

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
  });

  const [sets, setSets] = useState<WorkoutSet[]>(() =>
    initialWorkout?.sets.length
      ? initialWorkout.sets.map((set) => ({ ...set }))
      : [{ weight: 0, reps: 0 }]
  );

  const [feeling, setFeeling] = useState(
    initialWorkout?.feeling ?? 'excellent'
  );
  const [notes, setNotes] = useState(initialWorkout?.notes ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    () => [...(initialWorkout?.tags ?? [])]
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const availableTags = [...new Set([...tagOptions, ...selectedTags])];

  const closeEditor = () => {
    if (!savingRef.current) onClose();
  };

  const updateSet = (
    index: number,
    field: 'weight' | 'reps',
    value: number
  ) => {
    setSets((previous) =>
      previous.map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      )
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((item) => item !== tag)
        : [...previous, tag]
    );
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    setError('');

    if (!date) {
      setError(t.editor.validation.dateRequired);
      return;
    }

    if (
      sets.length === 0 ||
      sets.some(
        (set) =>
          !Number.isFinite(set.weight) ||
          set.weight <= 0 ||
          set.weight >= 1000000 ||
          !Number.isInteger(set.reps) ||
          set.reps < 1 ||
          set.reps > 1000000
      )
    ) {
      setError(
        'Проверь каждый подход: вес должен быть больше нуля, повторения — целым положительным числом. Лишний подход можно удалить.'
      );
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      await onSave({
        id: initialWorkout?.id ?? crypto.randomUUID(),
        date,
        sets: sets.map((set) => ({ ...set })),
        feeling,
        notes,
        tags: [...selectedTags],
      });

      onClose();
    } catch (err) {
      console.error('Ошибка сохранения тренировки:', err);

      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String(err.message)
            : 'Не удалось сохранить тренировку. Попробуй ещё раз.';

      setError(message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-background border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50"
      onClick={closeEditor}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-editor-title"
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: 'spring', damping: 30 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full bg-card border-t border-border/20 rounded-t-3xl max-h-[95dvh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-card border-b border-border/20 flex items-center justify-between p-4">
          <h2
            id="workout-editor-title"
            className="text-lg font-bold text-primary"
          >
            {initialWorkout ? 'Изменить тренировку' : t.editor.addWorkout}
          </h2>

          <button
            type="button"
            onClick={closeEditor}
            disabled={saving}
            aria-label="Закрыть"
            className="p-2 hover:bg-secondary/50 rounded-lg disabled:opacity-50"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <fieldset
          disabled={saving}
          className="min-w-0 p-4 space-y-4 disabled:opacity-70"
        >
          {error && (
            <div
              role="alert"
              className="bg-destructive/20 border border-destructive/50 text-destructive text-sm p-3 rounded-lg"
            >
              {error}
            </div>
          )}

          <label className="block text-xs text-muted-foreground">
            📅 {t.editor.date}
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={`${inputClass} mt-2`}
            />
          </label>

          <div>
            <p className="text-xs text-muted-foreground mb-2">
              💪 {t.editor.sets}
            </p>

            <div className="space-y-2">
              {sets.map((set, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-end bg-secondary/30 p-3 rounded-lg"
                >
                  <span className="self-center text-xs text-muted-foreground">
                    #{index + 1}
                  </span>

                  <label className="flex-1 min-w-0 text-xs text-muted-foreground">
                    {t.editor.weight}
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={set.weight || ''}
                      onChange={(event) =>
                        updateSet(
                          index,
                          'weight',
                          Number(event.target.value)
                        )
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="0"
                    />
                  </label>

                  <label className="flex-1 min-w-0 text-xs text-muted-foreground">
                    {t.editor.reps}
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={set.reps || ''}
                      onChange={(event) =>
                        updateSet(index, 'reps', Number(event.target.value))
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="0"
                    />
                  </label>

                  {sets.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Удалить подход ${index + 1}`}
                      onClick={() =>
                        setSets((previous) =>
                          previous.filter((_, i) => i !== index)
                        )
                      }
                      className="p-2 text-destructive hover:bg-destructive/20 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setSets((previous) => [
                  ...previous,
                  { weight: 0, reps: 0 },
                ])
              }
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary/50 text-primary text-sm"
            >
              <Plus size={16} />
              {t.editor.addSet}
            </button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">
              😊 {t.editor.feeling}
            </p>

            {!feelingOptions.some((option) => option.key === feeling) && (
              <p className="text-sm text-foreground mb-2">
                Сохранённое самочувствие: {feeling}
              </p>
            )}

            <div className="grid grid-cols-4 gap-2">
              {feelingOptions.map((option) => (
                <button
                  type="button"
                  key={option.key}
                  onClick={() => setFeeling(option.key)}
                  aria-pressed={feeling === option.key}
                  className={`py-2 rounded-lg text-xs transition-colors ${
                    feeling === option.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-foreground'
                  }`}
                >
                  <span className="block">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">
              🏷️ {t.editor.tags}
            </p>

            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selectedTags.includes(tag)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-foreground'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-xs text-muted-foreground">
            📝 {t.editor.notes}
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className={`${inputClass} mt-2 resize-none h-20`}
              placeholder={t.editor.notes}
            />
          </label>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg text-sm mb-4 disabled:opacity-50"
          >
            {saving ? 'Сохранение…' : t.editor.save}
          </button>
        </fieldset>
      </motion.div>
    </motion.div>
  );
}
