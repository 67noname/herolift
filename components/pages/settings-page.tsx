'use client';

import { motion } from 'framer-motion';
import { Trash2, Image, LogOut, Loader, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { useWorkouts } from '@/hooks/useWorkouts';
import { downloadWorkoutExcel } from '@/lib/export-excel';

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
  const { workouts, clearAllWorkouts, loading, error } =
    useWorkouts(user?.id || null);

  const handleExportExcel = () => {
    if (loading) return;

    if (error) {
      alert('Не удалось загрузить тренировки. Обнови страницу.');
      return;
    }

    if (workouts.length === 0) {
      alert('Нет загруженных тренировок для экспорта.');
      return;
    }

    try {
      downloadWorkoutExcel(workouts);
    } catch (err) {
      console.error('Ошибка экспорта Excel:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Не удалось создать Excel-файл.'
      );
    }
  };

    const handleExportPNG = async () => {
    if (isExporting) return;

    if (loading || error) {
      alert(
        loading
          ? 'Тренировки ещё загружаются. Попробуй через пару секунд.'
          : 'Не удалось загрузить тренировки. Обнови страницу.'
      );
      return;
    }

    setIsExporting(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Не удалось создать изображение.');
      }

      const accent = '#A8FF35';
      const fontFamily = 'Arial, Helvetica, sans-serif';

      const formatNumber = (value: number) =>
        value.toLocaleString('ru-RU', {
          maximumFractionDigits: 2,
        });

      const drawText = (
        text: string,
        x: number,
        y: number,
        size: number,
        color: string,
        maxWidth: number,
        bold = false,
        align: CanvasTextAlign = 'left'
      ) => {
        ctx.textAlign = align;
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = color;

        let fontSize = size;
        const setFont = () => {
          ctx.font = `${bold ? '700' : '400'} ${fontSize}px ${fontFamily}`;
        };

        setFont();

        while (ctx.measureText(text).width > maxWidth && fontSize > 12) {
          fontSize -= 1;
          setFont();
        }

        ctx.fillText(text, x, y, maxWidth);
      };

      const roundedRect = (
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(
          x + width,
          y + height,
          x + width - radius,
          y + height
        );
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };

      const totalWorkouts = workouts.length;
      const totalSets = workouts.reduce(
        (total, workout) => total + workout.sets.length,
        0
      );

      const totalTonnage = workouts.reduce(
        (total, workout) =>
          total +
          workout.sets.reduce(
            (sum, set) => sum + set.weight * set.reps,
            0
          ),
        0
      );

      const personalBest = workouts.reduce(
        (best, workout) =>
          workout.sets.reduce(
            (maximum, set) => Math.max(maximum, set.weight),
            best
          ),
        0
      );

      const sumWeights = workouts.reduce(
        (total, workout) =>
          total + workout.sets.reduce((sum, set) => sum + set.weight, 0),
        0
      );

      const averageWeight =
        totalSets > 0 ? Math.round(sumWeights / totalSets) : 0;

      const stats = [
        {
          label: 'Личный рекорд',
          value: `${formatNumber(personalBest)} кг`,
        },
        {
          label: 'Средний вес',
          value: `${formatNumber(averageWeight)} кг`,
        },
        {
          label: 'Общий тоннаж',
          value: `${formatNumber(totalTonnage)} кг`,
        },
        {
          label: 'Количество тренировок',
          value: formatNumber(totalWorkouts),
        },
      ];

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawText(
        'HeroLift',
        540,
        140,
        72,
        accent,
        952,
        true,
        'center'
      );

      drawText(
        'За всё время',
        540,
        200,
        28,
        '#A3A3A3',
        952,
        false,
        'center'
      );

      const cardWidth = 464;
      const cardHeight = 280;
      const gap = 24;
      const left = 64;
      const top = 280;

      stats.forEach((stat, index) => {
        const x = left + (index % 2) * (cardWidth + gap);
        const y = top + Math.floor(index / 2) * (cardHeight + gap);

        roundedRect(x, y, cardWidth, cardHeight, 32);

        ctx.fillStyle = '#121212';
        ctx.fill();

        ctx.strokeStyle = 'rgba(168, 255, 53, 0.22)';
        ctx.lineWidth = 2;
        ctx.stroke();

        drawText(
          stat.label,
          x + 36,
          y + 68,
          26,
          '#B0B0B0',
          cardWidth - 72
        );

        drawText(
          stat.value,
          x + 36,
          y + 170,
          60,
          accent,
          cardWidth - 72,
          true
        );

        ctx.fillStyle = 'rgba(168, 255, 53, 0.45)';
        ctx.fillRect(x + 36, y + 220, 44, 3);
      });

      const today = new Date();

      drawText(
        `Дата выгрузки: ${today.toLocaleDateString('ru-RU')}`,
        540,
        968,
        24,
        '#808080',
        952,
        false,
        'center'
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Не удалось сформировать PNG.'));
          }
        }, 'image/png');
      });

      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `HeroLift-${today.getFullYear()}-${month}-${day}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      console.error('Ошибка экспорта PNG:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Не удалось сохранить изображение.'
      );
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

        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleExportExcel}
          disabled={loading}
          className="w-full bg-card/40 border border-border/20 backdrop-blur-sm p-6 rounded-2xl flex items-center justify-between group disabled:opacity-50 hover:bg-card/60 hover:border-border/40 transition-all duration-300"
        >
          <div className="text-left">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              Экспорт Excel
            </h3>

            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Загрузка тренировок…'
                : 'Все тренировки в файле .xlsx'}
            </p>
          </div>

          <FileSpreadsheet
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
