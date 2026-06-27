'use client';

import { useState } from 'react';
import { Workout } from '@/lib/types';
import { getWorkoutsByDateRange, calculateStats } from '@/lib/storage';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { t } from '@/lib/i18n';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsPageProps {
  workouts: Workout[];
}

export function AnalyticsPage({ workouts }: AnalyticsPageProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();

    if (period === 'week') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setMonth(now.getMonth() - 1);
    }

    return { start, end: now };
  };

  const { start, end } = getDateRange();
  const periodWorkouts = getWorkoutsByDateRange(workouts, start, end);
  const stats = calculateStats(periodWorkouts);

  // Prepare chart data
  const chartData = {
    labels: periodWorkouts.map((w) => w.date),
    maxWeightData: periodWorkouts.map((w) => Math.max(...w.sets.map((s) => s.weight), 0)),
    tonnageData: periodWorkouts.map((w) => w.sets.reduce((acc, s) => acc + s.weight * s.reps, 0)),
  };

  const lineChartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Max Weight (lbs)',
        data: chartData.maxWeightData,
        borderColor: '#A8FF35',
        backgroundColor: 'rgba(168, 255, 53, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#A8FF35',
        pointBorderColor: '#050505',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const barChartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Tonnage (lbs)',
        data: chartData.tonnageData,
        backgroundColor: '#A8FF35',
        borderColor: '#88dd22',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#f5f5f5',
          usePointStyle: true,
        },
      },
    },
    scales: {
      y: {
        backgroundColor: 'transparent',
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#a0a0a0',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a0a0a0',
        },
      },
    },
  };

  const periodLabels = {
    week: t.home.week,
    month: t.home.month,
  };

  return (
    <div className="px-4 pt-6 pb-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary mb-1">📊 {t.analytics.title}</h1>
        <p className="text-muted-foreground text-sm">{t.nav.analytics}</p>
      </motion.div>

      {/* Period Selector */}
      <div className="flex gap-2 mt-6 mb-6">
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              period === p
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
        >
          <p className="text-xs text-muted-foreground mb-1">{t.analytics.avgWeight}</p>
          <p className="text-2xl font-bold text-primary">{stats.averageWeight}</p>
          <p className="text-xs text-muted-foreground">{t.common.lbs}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
        >
          <p className="text-xs text-muted-foreground mb-1">{t.analytics.workoutCount}</p>
          <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
          <p className="text-xs text-muted-foreground">тренировок</p>
        </motion.div>
      </div>

      {/* Charts */}
      {chartData.labels.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300 mb-6"
          >
            <h3 className="font-semibold text-primary mb-4">{t.analytics.maxWeight}</h3>
            <div style={{ maxHeight: '300px', position: 'relative' }}>
              <Line data={lineChartConfig} options={chartOptions} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm p-4 rounded-2xl hover:bg-card/60 hover:border-border/40 transition-all duration-300"
          >
            <h3 className="font-semibold neon-text mb-4">Tonnage by Workout</h3>
            <div style={{ maxHeight: '300px', position: 'relative' }}>
              <Bar data={barChartConfig} options={chartOptions} />
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No data for this period</p>
        </motion.div>
      )}
    </div>
  );
}
