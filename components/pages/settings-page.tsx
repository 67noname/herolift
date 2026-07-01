'use client';

import { motion } from 'framer-motion';
import { Trash2, Image, LogOut, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useWorkouts } from '@/hooks/useWorkouts';

interface SettingsPageProps {
  onLogout?: () => void;
}

type AppTheme = 'graphite' | 'green' | 'mono';
type SoundMode = 'on' | 'off';

export function SettingsPage({ onLogout }: SettingsPageProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<AppTheme>('graphite');
  const [soundMode, setSoundMode] = useState<SoundMode>('on');

  useEffect(() => {
    const savedTheme =
      (localStorage.getItem('theme') as AppTheme | null) || 'graphite';

    setTheme(savedTheme);

      if (savedTheme === 'green' || savedTheme === 'mono') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  const savedSoundMode =
    (localStorage.getItem('soundMode') as SoundMode | null) || 'on';

  setSoundMode(savedSoundMode);
}, []);
  
  const changeTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'green' || newTheme === 'mono') {
      document.documentElement.setAttribute('data-theme', newTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };
  const changeSoundMode = (newMode: SoundMode) => {
  setSoundMode(newMode);
  localStorage.setItem('soundMode', newMode);
};

  const { user, logout } = useAuth();
  const { workouts, clearAllWorkouts } = useWorkouts(user?.id || null);
    const handleExportPNG = async () => {
    setIsExporting(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not found');

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#A8FF35';
      ctx.font = 'bold 48px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.appName, canvas.width / 2, 80);

      ctx.fillStyle = '#A8FF35';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.fillText(
        new Date().toLocaleDateString('ru-RU'),
        canvas.width / 2,
        130
      );

      const totalWorkouts = workouts.length;

      const totalSets = workouts.reduce(
        (acc, workout) => acc + workout.sets.length,
        0
      );

      const totalTonnage = workouts.reduce(
        (acc, workout) =>
          acc +
          workout.sets.reduce(
            (sum, set) => sum + set.weight * set.reps,
            0
          ),
        0
      );

      const personalBest = workouts.reduce(
        (max, workout) =>
          Math.max(max, ...workout.sets.map((set) => set.weight)),
        0
      );

      const avgWeight =
        totalSets > 0
          ? Math.round(
              workouts.reduce(
                (acc, workout) =>
                  acc +
                  workout.sets.reduce(
                    (sum, set) => sum + set.weight,
                    0
                  ),
                0
              ) / totalSets
            )
          : 0;

      const statY = 250;

      const stats = [
        {
          label: '🏆 ' + t.records.personalBest,
          value: personalBest + ' ' + t.common.lbs,
        },
        {
          label: '📊 ' + t.analytics.avgWeight,
          value: avgWeight + ' ' + t.common.lbs,
        },
        {
          label: '💪 ' + t.analytics.totalTonnage,
          value: totalTonnage.toLocaleString() + ' ' + t.common.lbs,
        },
        {
          label: '🔥 ' + t.records.totalWorkouts,
          value: totalWorkouts,
        },
      ];
            stats.forEach((stat, i) => {
        const x = 60 + (i % 2) * 480;
        const y = statY + Math.floor(i / 2) * 200;

        ctx.shadowColor = '#A8FF35';
        ctx.shadowBlur = 10;

        ctx.fillStyle = '#151515';
        ctx.fillRect(x, y, 420, 180);

        ctx.strokeStyle = 'rgba(255,255,255,.10)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 420, 180);

        ctx.shadowBlur = 0;

        ctx.fillStyle = '#a0a0a0';
        ctx.font = '18px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(stat.label, x + 30, y + 58);

        ctx.fillStyle = '#A8FF35';
        ctx.font = 'bold 40px Inter, sans-serif';
        ctx.fillText(String(stat.value), x + 30, y + 125);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);

          const element = document.createElement('a');
          element.href = url;
          element.download = `herolift-${new Date()
            .toISOString()
            .split('T')[0]}.png`;

          element.click();

          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Ошибка при экспорте');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllWorkouts();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('[v0] Clear workouts error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      await logout();

      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('[v0] Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
    return (
    <div className="px-4 pt-6 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-primary mb-1">
          ⚙️ {t.settings.title}
        </h1>

        <p className="text-muted-foreground text-sm">
          {t.nav.settings}
        </p>
      </motion.div>

      <div className="mt-6 space-y-3">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleExportPNG}
          disabled={isExporting}
          className="w-full bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl flex items-center justify-between group disabled:opacity-50 hover:bg-card/60 hover:border-border/40 transition-all duration-300"
        >
          <div className="text-left">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {t.settings.exportPNG}
            </h3>

            <p className="text-sm text-muted-foreground">
              📊 Поделиться результатами
            </p>
          </div>

          <Image
            size={24}
            className="text-primary group-hover:scale-110 transition-transform"
          />
        </motion.button>
                <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.03 }}
          className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                🎨 Тема приложения
              </h3>

              <p className="text-sm text-muted-foreground">
                Выберите оформление HeroLift
              </p>
            </div>
          </div>

          <div className="flex bg-secondary rounded-full p-1">
            <button
              onClick={() => changeTheme('graphite')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                theme === 'graphite'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Graphite
            </button>

            <button
              onClick={() => changeTheme('green')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                theme === 'green'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Hero Green
            </button>

            <button
              onClick={() => changeTheme('mono')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                theme === 'mono'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Hero Mono
            </button>
          </div>
        </motion.div>

                <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.04 }}
          className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                🔊 Звуки
              </h3>

              <p className="text-sm text-muted-foreground">
                Управление звуками приложения
              </p>
            </div>
          </div>

          <div className="flex bg-secondary rounded-full p-1">
            <button
              onClick={() => changeSoundMode('on')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                soundMode === 'on'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Вкл все
            </button>

            <button
              onClick={() => changeSoundMode('off')}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                soundMode === 'off'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              Выкл все
            </button>
          </div>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl flex items-center justify-between group disabled:opacity-50 hover:bg-destructive/10 transition-all duration-300"
        >
          <div className="text-left">
            <h3 className="font-semibold text-destructive group-hover:text-destructive/80 transition-colors">
              Выход
            </h3>

            <p className="text-sm text-muted-foreground">
              Завершить сеанс
            </p>
          </div>

          {isLoggingOut ? (
            <Loader
              size={24}
              className="text-destructive animate-spin"
            />
          ) : (
            <LogOut
              size={24}
              className="text-destructive group-hover:scale-110 transition-transform"
            />
          )}
        </motion.button>
                <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
          className="w-full bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl flex items-center justify-between group hover:bg-destructive/10 transition-all duration-300"
        >
          <div className="text-left">
            <h3 className="font-semibold text-destructive group-hover:text-destructive/80 transition-colors">
              {t.settings.clearData}
            </h3>

            <p className="text-sm text-muted-foreground">
              🗑️ Удалить все навсегда
            </p>
          </div>

          <Trash2
            size={24}
            className="text-destructive group-hover:scale-110 transition-transform"
          />
        </motion.button>

        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 border border-destructive/50 backdrop-blur-sm p-6 rounded-2xl"
          >
            <p className="text-foreground mb-4 font-medium">
              {t.settings.clearConfirm}
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              Это действие необратимо. Все данные о тренировках будут удалены.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                className="flex-1 py-3 bg-destructive text-destructive-foreground font-bold rounded-lg hover:bg-destructive/90 transition-colors text-sm"
              >
                {t.settings.deleteConfirm}
              </button>

              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-secondary text-foreground font-bold rounded-lg hover:bg-secondary/80 transition-colors text-sm"
              >
                {t.settings.cancel}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl mt-6 text-center"
      >
        <p className="text-sm text-primary font-medium mb-2">
          {t.appName}
        </p>

        <p className="text-xs text-muted-foreground">
          {t.settings.version}
        </p>

        <p className="text-xs text-muted-foreground mt-3">
          ✨ Премиум трекер тренировок
        </p>
      </motion.div>
    </div>
  );
}
