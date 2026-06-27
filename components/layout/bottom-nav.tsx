'use client';

import { Home, History, BarChart3, Trophy, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { t } from '@/lib/i18n';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: t.nav.home, icon: Home },
  { id: 'history', label: t.nav.history, icon: History },
  { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
  { id: 'records', label: t.nav.records, icon: Trophy },
  { id: 'settings', label: t.nav.settings, icon: Settings },
];

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-card/40 border-t border-border/20 backdrop-blur-sm w-full safe-area-inset-b"
    >
      <div className="flex items-center justify-around px-0 py-2 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-3 transition-all relative"
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 40 }}
                />
              )}
              <Icon
                size={24}
                className={`transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors leading-tight text-center ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
