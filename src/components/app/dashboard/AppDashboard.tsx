'use client';

import { useRouter } from 'next/navigation';
import { Mic, BookMarked, GraduationCap } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { useEffect, useState } from 'react';

interface KaiwaStats {
  totalMinutes: number;
  sessionsCount: number;
  weeklyBreakdown: { date: string; minutes: number }[];
}

interface DrillStats {
  totalCards: number;
  masteredCards: number;
  masteryPercentage: number;
}

interface WeeklyStats {
  dates: string[];
  kaiwaMinutes: number[];
  cardsLearned: number[];
}

interface Activity {
  type: 'task_complete' | 'cards_learned';
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
  const router = useRouter();
  const [kaiwaStats, setKaiwaStats] = useState<KaiwaStats | null>(null);
  const [drillStats, setDrillStats] = useState<DrillStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [kaiwa, drill, weekly, activity] = await Promise.all([
          fetch('/api/stats/kaiwa').then(r => r.json()),
          fetch('/api/stats/drill').then(r => r.json()),
          fetch('/api/stats/weekly').then(r => r.json()),
          fetch('/api/activity/recent').then(r => r.json()),
        ]);

        setKaiwaStats(kaiwa);
        setDrillStats(drill);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Beranda</h1>
        <p className="text-muted-foreground">
          Welcome back! Let&apos;s continue your Japanese learning journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Menit Latihan Kaiwa"
          value={kaiwaStats?.totalMinutes || 0}
          description={`${kaiwaStats?.sessionsCount || 0} sessions this week`}
          icon={Mic}
          isLoading={isLoading}
          onClick={() => router.push('/app/kaiwa')}
        />
        <StatsCard
          title="Kartu yang Sudah Hafal"
          value={drillStats?.masteredCards || 0}
          description={`${drillStats?.masteryPercentage || 0}% of ${drillStats?.totalCards || 0} total cards`}
          icon={BookMarked}
          isLoading={isLoading}
          onClick={() => router.push('/app/drill')}
        />
        <StatsCard
          title="Streak Belajar"
          value="0 days"
          description="Keep it up!"
          icon={GraduationCap}
          isLoading={isLoading}
        />
      </div>

      {/* Weekly Activity Chart */}
      <div className="mb-8">
        <ActivityChart
          dates={weeklyStats?.dates || []}
          kaiwaMinutes={weeklyStats?.kaiwaMinutes || []}
          cardsLearned={weeklyStats?.cardsLearned || []}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <RecentActivity activities={recentActivity} isLoading={isLoading} />
      </div>
    </div>
  );
}
