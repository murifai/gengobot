'use client';

import { LazyActivityChart, LazyRecentActivity } from '@/lib/performance/lazy-imports';
import { useEffect, useState } from 'react';
import { UI_TEXT } from '@/lib/constants/ui-text';

// Activity type colors for consistent styling (exported for use in other components)
export const ACTIVITY_COLORS = {
  roleplay: {
    bg: 'bg-[#ff5e75]/10',
    border: 'border-[#ff5e75]/30',
    icon: 'text-[#ff5e75]',
    iconBg: 'bg-[#ff5e75]/20',
    chart: '#ff5e75',
  },
  kaiwa_bebas: {
    bg: 'bg-[#73cfd9]/10',
    border: 'border-[#73cfd9]/30',
    icon: 'text-[#73cfd9]',
    iconBg: 'bg-[#73cfd9]/20',
    chart: '#73cfd9',
  },
  drill: {
    bg: 'bg-[#7fbf50]/10',
    border: 'border-[#7fbf50]/30',
    icon: 'text-[#7fbf50]',
    iconBg: 'bg-[#7fbf50]/20',
    chart: '#7fbf50',
  },
} as const;

interface WeeklyStats {
  dates: string[];
  roleplayMinutes: number[];
  kaiwaBetasMinutes: number[];
  cardsLearned: number[];
  // Legacy support
  kaiwaMinutes?: number[];
}

interface Activity {
  type: 'roleplay' | 'kaiwa_bebas' | 'drill' | 'task_complete' | 'cards_learned';
  data: {
    title?: string;
    jlptLevel?: string;
    score?: number | null;
    word?: string;
    deckName?: string;
    quality?: number;
  };
  timestamp: Date | string;
}

export default function AppDashboard() {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [weekly, activity] = await Promise.all([
          fetch('/api/stats/weekly').then(r => r.json()),
          fetch('/api/activity/recent').then(r => r.json()),
        ]);

        setWeeklyStats(weekly);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Helper to get weekly stats with legacy fallback
  const getWeeklyRoleplayMinutes = () =>
    weeklyStats?.roleplayMinutes ?? weeklyStats?.kaiwaMinutes ?? [];
  const getWeeklyFreeChatMinutes = () => weeklyStats?.kaiwaBetasMinutes ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{UI_TEXT.dashboard.title}</h1>
        <p className="text-muted-foreground">{UI_TEXT.dashboard.welcomeBack}</p>
      </div>

      {/* Weekly Activity Charts */}
      <div className="mb-8">
        <LazyActivityChart
          dates={weeklyStats?.dates || []}
          roleplayMinutes={getWeeklyRoleplayMinutes()}
          freeChatMinutes={getWeeklyFreeChatMinutes()}
          cardsLearned={weeklyStats?.cardsLearned || []}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <LazyRecentActivity activities={recentActivity} isLoading={isLoading} />
      </div>
    </div>
  );
}
