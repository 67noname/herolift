'use client';

import { useState } from 'react';
import { Workout, WorkoutSet } from '@/lib/types';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';
import { t } from '@/lib/i18n';

interface WorkoutEditorProps {
  onSave: (workout: Workout) => void;
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

export function WorkoutEditor({ onSave, onClose }: WorkoutEditorProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sets, setSets] = useState<WorkoutSet[]>([{ weight: 0, reps: 0 }]);
  const [feeling, setFeeling] = useState('excellent');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAddSet = () => {
    setSets([...sets, { weight: 0, reps: 0 }]);
  };

  const handleUpdateSet = (index: number, field: 'weight' | 'reps', value: number) => {
    const updated = [...sets];
    updated[index][field] = value;
    setSets(updated);
  };

  const handleRemoveSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    setError('');

    if (!date) {
      setError(t.editor.validation.dateRequired);
      return;
    }

    const validSets = sets.filter((s) => s.weight > 0 && s.reps > 0);
    if (validSets.length === 0) {
      setError(t.editor.validation.minSets);
      return;
    }

    const workout: Workout = {
      id: Date.now().toString(),
      date,
      sets: validSets,
      feeling,
      notes,
      tags: selectedTags,
    };

    onSave(workout);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 500 }}
        animate={{ y: 0 }}
        exit={{ y: 500 }}
        transition={{ type: 'spring', damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-card/40 border-t border-border/20 backdrop-blur-sm rounded-t-3xl max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/40 border-b border-border/20 flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-primary">
            {t.editor.addWorkout}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/20 border border-destructive/50 text-destructive text-sm p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              📅 {t.editor.date}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* Sets */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              💪 {t.editor.sets}
            </label>
            <div className="space-y-2">
              {sets.map((set, index) => (
                <div key={index} className="flex gap-2 items-end bg-secondary/30 p-3 rounded-lg">
                  <div className="w-8 flex items-center justify-center text-xs font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1">
                      {t.editor.weight}
                    </label>
                    <input
                      type="number"
                      value={set.weight || ''}
                      onChange={(e) =>
                        handleUpdateSet(index, 'weight', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-background border border-border/50 rounded px-2 py-1 text-foreground text-sm focus:outline-none focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-muted-foreground mb-1">
                      {t.editor.reps}
                    </label>
                    <input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e) =>
                        handleUpdateSet(index, 'reps', parseFloat(e.target.value) || 0)
                      }
                      className="w-full bg-background border border-border/50 rounded px-2 py-1 text-foreground text-sm focus:outline-none focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                  {sets.length > 1 && (
                    <button
                      onClick={() => handleRemoveSet(index)}
                      className="p-2 hover:bg-destructive/20 rounded transition-colors text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={handleAddSet}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-primary font-medium text-sm"
            >
              <Plus size={16} /> {t.editor.addSet}
            </button>
          </div>

          {/* Feeling */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              😊 {t.editor.feeling}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {feelingOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFeeling(option.key)}
                  className={`py-2 rounded-lg font-medium text-xs transition-all ${
                    feeling === option.key
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  <div>{option.emoji}</div>
                  <div className="text-xs leading-tight">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              🏷️ {t.editor.tags}
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              📝 {t.editor.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:border-primary resize-none h-16"
              placeholder={t.editor.notes}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-lg shadow-lg shadow-primary/50 transition-all text-sm mt-6 mb-4"
          >
            {t.editor.save}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
