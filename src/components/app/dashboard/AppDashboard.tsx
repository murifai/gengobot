'use client';

import { LazyActivityChart, LazyRecentActivity } from '@/lib/performance/lazy-imports';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, Layers, MessageSquare, Play, ArrowRight, Sparkles, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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

interface DashboardData {
  user: {
    id: string;
    displayName: string;
    nickname: string | null;
    fullName: string | null;
    name: string | null;
    image: string | null;
    proficiency: string;
  };
  greeting: {
    text: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
  };
  subscription: {
    tier: string;
    status: string;
    periodEnd: string;
  } | null;
  credits: {
    total: number;
    used: number;
    remaining: number;
    isTrialActive: boolean;
    trialDaysRemaining?: number;
    trialDailyUsed?: number;
    trialDailyLimit?: number;
  } | null;
  lastActivity: {
    deck: {
      deckId: string;
      deckName: string;
      lastStudied: string;
      isInProgress?: boolean;
      currentCardIndex?: number;
      cardsReviewed?: number;
    } | null;
    roleplay: {
      attemptId: string;
      taskId: string;
      taskTitle: string;
      isCompleted: boolean;
      lastActive: string;
    } | null;
    freeChat: {
      sessionId: string;
      characterId: string;
      characterName: string;
      lastActive: string;
    } | null;
  };
}

export default function AppDashboard() {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [weekly, activity, dashboard] = await Promise.all([
          fetch('/api/stats/weekly').then(r => r.json()),
          fetch('/api/activity/recent').then(r => r.json()),
          fetch('/api/dashboard').then(r => r.json()),
        ]);

        setWeeklyStats(weekly);
        setRecentActivity(activity);
        setDashboardData(dashboard);
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

  // Format credits with thousand separator
  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(credits);
  };

  // Get most recent activity for continue button
  const getMostRecentActivity = () => {
    if (!dashboardData?.lastActivity) return null;

    const { deck, roleplay, freeChat } = dashboardData.lastActivity;
    const activities: { type: string; timestamp: Date; data: unknown }[] = [];

    if (deck) {
      activities.push({
        type: 'deck',
        timestamp: new Date(deck.lastStudied),
        data: deck,
      });
    }
    if (roleplay) {
      activities.push({
        type: 'roleplay',
        timestamp: new Date(roleplay.lastActive),
        data: roleplay,
      });
    }
    if (freeChat) {
      activities.push({
        type: 'freeChat',
        timestamp: new Date(freeChat.lastActive),
        data: freeChat,
      });
    }

    if (activities.length === 0) return null;

    // Sort by most recent
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return activities[0];
  };

  const mostRecentActivity = getMostRecentActivity();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Greeting Section */}
      <div className="mb-8">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
        ) : dashboardData ? (
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold">
              {dashboardData.greeting.text}
              <span className="ml-2">{dashboardData.user.displayName}</span>
              <Sparkles className="inline-block ml-2 h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground">
              {dashboardData.greeting.timeOfDay === 'morning' && 'Semangat belajar hari ini!'}
              {dashboardData.greeting.timeOfDay === 'afternoon' && 'Lanjutkan belajarmu!'}
              {dashboardData.greeting.timeOfDay === 'evening' && 'Malam yang produktif!'}
            </p>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">Beranda</h1>
        )}
      </div>

      {/* Credit Balance Card */}
      {dashboardData?.credits && (
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl font-bold">
                      {formatCredits(dashboardData.credits.remaining)}
                    </span>
                    <span className="text-muted-foreground">kredit AI tersisa</span>
                    {dashboardData.credits.isTrialActive && (
                      <Badge variant="warning" size="sm">
                        Trial: {dashboardData.credits.trialDaysRemaining} hari
                      </Badge>
                    )}
                  </div>
                  {dashboardData.credits.total > 0 && (
                    <div className="mt-1">
                      <Progress
                        value={dashboardData.credits.used}
                        max={dashboardData.credits.total}
                        className="h-2 w-full max-w-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Trial daily limit */}
                {dashboardData.credits.isTrialActive &&
                  dashboardData.credits.trialDailyLimit &&
                  dashboardData.credits.trialDailyUsed !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Hari ini:</span>
                      <span className="font-medium">
                        {formatCredits(dashboardData.credits.trialDailyUsed)} /{' '}
                        {formatCredits(dashboardData.credits.trialDailyLimit)}
                      </span>
                    </div>
                  )}

                {/* Upgrade button for users with 0 credits */}
                {dashboardData.credits.remaining === 0 && (
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Continue Last Activity */}
          {mostRecentActivity && (
            <Link
              href={
                mostRecentActivity.type === 'deck'
                  ? `/app/drill/${(mostRecentActivity.data as DashboardData['lastActivity']['deck'])?.deckId}`
                  : mostRecentActivity.type === 'roleplay'
                    ? (mostRecentActivity.data as DashboardData['lastActivity']['roleplay'])
                        ?.isCompleted
                      ? `/app/kaiwa/roleplay/${(mostRecentActivity.data as DashboardData['lastActivity']['roleplay'])?.taskId}`
                      : `/app/kaiwa/roleplay/${(mostRecentActivity.data as DashboardData['lastActivity']['roleplay'])?.taskId}/attempt/${(mostRecentActivity.data as DashboardData['lastActivity']['roleplay'])?.attemptId}`
                    : `/app/kaiwa/bebas`
              }
              className="block"
            >
              <Card
                className={cn(
                  'hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer',
                  'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30'
                )}
              >
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <Play className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        Lanjutkan{' '}
                        {mostRecentActivity.type === 'deck'
                          ? (mostRecentActivity.data as DashboardData['lastActivity']['deck'])
                              ?.deckName
                          : mostRecentActivity.type === 'roleplay'
                            ? (mostRecentActivity.data as DashboardData['lastActivity']['roleplay'])
                                ?.taskTitle
                            : 'Kaiwa Bebas'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {mostRecentActivity.type === 'deck' &&
                          ((mostRecentActivity.data as DashboardData['lastActivity']['deck'])
                            ?.isInProgress
                            ? `Kartu ${(mostRecentActivity.data as DashboardData['lastActivity']['deck'])?.currentCardIndex ?? 0} sedang berlangsung`
                            : 'Drill Kartu')}
                        {mostRecentActivity.type === 'roleplay' && 'Roleplay'}
                        {mostRecentActivity.type === 'freeChat' && 'Percakapan Bebas'}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Deck Cards */}
          <Link href="/drill" className="block">
            <Card className="hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn('p-2 rounded-lg', ACTIVITY_COLORS.drill.iconBg, 'border-none')}
                  >
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Dek Kartu</p>
                    <p className="text-sm text-muted-foreground">Latihan flashcard</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Conversation Practice */}
          <Link href="/kaiwa" className="block">
            <Card className="hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      ACTIVITY_COLORS.kaiwa_bebas.iconBg,
                      'border-none'
                    )}
                  >
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Latihan Percakapan</p>
                    <p className="text-sm text-muted-foreground">Kaiwa & Roleplay</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
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
