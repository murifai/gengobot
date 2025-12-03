'use client';

import { LazyActivityChart, LazyRecentActivity } from '@/lib/performance/lazy-imports';
import { useEffect, useState } from 'react';
import { UI_TEXT } from '@/lib/constants/ui-text';

// Activity type colors for consistent styling (exported for use in other components)
export const ACTIVITY_COLORS = {
  roleplay: {
    bg: 'bg-[#ff5e75]/10',
    border: 'border-border',
    icon: 'text-white',
    iconBg: 'bg-[#ff5e75] border-2 border-border',
    chart: '#ff5e75',
  },
  kaiwa_bebas: {
    bg: 'bg-[#73cfd9]/10',
    border: 'border-border',
    icon: 'text-white',
    iconBg: 'bg-[#73cfd9] border-2 border-border',
    chart: '#73cfd9',
  },
  drill: {
    bg: 'bg-[#7fbf50]/10',
    border: 'border-border',
    icon: 'text-white',
    iconBg: 'bg-[#7fbf50] border-2 border-border',
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
  // Card type breakdown
  kanjiCards?: number[];
  vocabularyCards?: number[];
  grammarCards?: number[];
  totalMasteredCards?: number;
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
        <h1 className="text-2xl font-bold">{UI_TEXT.dashboard.title}</h1>
      </div>

      {/* Weekly Activity Charts */}
      <div className="mb-8">
        <LazyActivityChart
          dates={weeklyStats?.dates || []}
          roleplayMinutes={getWeeklyRoleplayMinutes()}
          freeChatMinutes={getWeeklyFreeChatMinutes()}
          cardsLearned={weeklyStats?.cardsLearned || []}
          kanjiCards={weeklyStats?.kanjiCards}
          vocabularyCards={weeklyStats?.vocabularyCards}
          grammarCards={weeklyStats?.grammarCards}
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
