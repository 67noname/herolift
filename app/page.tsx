'use client';

import { useState } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { HomePage } from '@/components/pages/home-page';
import { HistoryPage } from '@/components/pages/history-page';
import { AnalyticsPage } from '@/components/pages/analytics-page';
import { RecordsPage } from '@/components/pages/records-page';
import { SettingsPage } from '@/components/pages/settings-page';
import { LoginPage } from '@/components/auth/login-page';
import { SetupPage } from '@/components/setup/setup-page';
import { useAuth } from '@/hooks/useAuth';
import { useWorkouts } from '@/hooks/useWorkouts';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const { user, loading: authLoading, isConfigured } = useAuth();
  const { workouts, addWorkout, deleteWorkout } = useWorkouts(user?.id || null);

  if (!isConfigured) {
    return <SetupPage />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      {currentTab === 'home' && (
        <HomePage workouts={workouts} onWorkoutAdded={addWorkout} />
      )}
      {currentTab === 'history' && (
        <HistoryPage workouts={workouts} onWorkoutDeleted={deleteWorkout} />
      )}
      {currentTab === 'analytics' && <AnalyticsPage workouts={workouts} />}
      {currentTab === 'records' && <RecordsPage workouts={workouts} />}
      {currentTab === 'settings' && <SettingsPage />}

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </main>
  );
}
