'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  UserAnalyticsTab,
  EarningReportsTab,
  PracticeStatsTab,
  ResearchTab,
} from '@/components/admin/statistik';
import { toast } from 'sonner';

export const dynamic = 'force-dynamic';

interface UserData {
  demographics: {
    byProficiency: Array<{ label: string; count: number }>;
    byAgeRange: Array<{ label: string; count: number }>;
    byGender: Array<{ label: string; count: number }>;
    byDomicile: Array<{ label: string; count: number }>;
    byInstitution: Array<{ label: string; count: number }>;
  };
  learningProfile: {
    byLearningDuration: Array<{ label: string; count: number }>;
  };
  japanExperience: {
    hasLivedInJapan: Array<{ label: string; count: number }>;
    byStayDuration: Array<{ label: string; count: number }>;
  };
  users: Array<Record<string, unknown>>;
}

interface EarningsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byMonth: Array<{ month: string; total: number }>;
  };
  expenses: {
    total: number;
    apiUsage: number;
  };
  profit: {
    total: number;
    margin: string;
  };
  subscriptions: {
    byTier: { FREE: number; BASIC: number; PRO: number };
    total: number;
    paid: number;
    conversionRate: string;
  };
  payments: {
    total: number;
    completed: number;
    recent: Array<{
      id: string;
      amount: number;
      status: string;
      plan: string;
      billingCycle: string;
      createdAt: string;
      user: { id: string; name: string | null; email: string };
    }>;
  };
}

interface PracticeData {
  roleplay: {
    tasks: Array<{
      taskId: string;
      taskTitle: string;
      category: string;
      difficulty: string;
      totalAttempts: number;
      completions: number;
      completionRate: string;
      avgDuration: number;
      avgScore: string;
    }>;
    summary: {
      totalTasks: number;
      totalAttempts: number;
      completedAttempts: number;
      completionRate: string;
    };
  };
  freeChat: {
    totalConversations: number;
    avgMessages: string;
  };
  decks: {
    all: Array<{
      deckId: string;
      deckName: string;
      creatorType: string;
      isPublic: boolean;
      cardCount: number;
      studySessions: number;
    }>;
    admin: Array<{
      deckId: string;
      deckName: string;
      creatorType: string;
      isPublic: boolean;
      cardCount: number;
      studySessions: number;
    }>;
    user: Array<{
      deckId: string;
      deckName: string;
      creatorType: string;
      isPublic: boolean;
      cardCount: number;
      studySessions: number;
    }>;
    summary: {
      totalDecks: number;
      adminDecks: number;
      userDecks: number;
      totalSessions: number;
    };
  };
}

export default function StatistikPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [usersRes, earningsRes, practicesRes] = await Promise.all([
          fetch('/api/admin/analytics/users'),
          fetch('/api/admin/analytics/earnings'),
          fetch('/api/admin/analytics/practices'),
        ]);

        if (!usersRes.ok || !earningsRes.ok || !practicesRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const [users, earnings, practices] = await Promise.all([
          usersRes.json(),
          earningsRes.json(),
          practicesRes.json(),
        ]);

        setUserData(users);
        setEarningsData(earnings);
        setPracticeData(practices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleExport = async (type: string) => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/admin/analytics/export?type=${type}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `export-${type}.xlsx`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export completed', {
        description: `${filename} has been downloaded`,
      });
    } catch (err) {
      toast.error('Export failed', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading statistics</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistik</h1>
        <p className="text-muted-foreground">Detailed analytics and reporting for GengoBot</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="earnings">Pendapatan</TabsTrigger>
          <TabsTrigger value="practices">Praktik</TabsTrigger>
          <TabsTrigger value="research">Riset</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          {userData && (
            <UserAnalyticsTab
              demographics={userData.demographics}
              learningProfile={userData.learningProfile}
              japanExperience={userData.japanExperience}
              onExport={() => handleExport('users')}
              isExporting={isExporting}
            />
          )}
        </TabsContent>

        <TabsContent value="earnings" className="mt-6">
          {earningsData && (
            <EarningReportsTab
              revenue={earningsData.revenue}
              expenses={earningsData.expenses}
              profit={earningsData.profit}
              subscriptions={earningsData.subscriptions}
              payments={earningsData.payments}
              onExport={() => handleExport('earnings')}
              isExporting={isExporting}
            />
          )}
        </TabsContent>

        <TabsContent value="practices" className="mt-6">
          {practiceData && (
            <PracticeStatsTab
              roleplay={practiceData.roleplay}
              freeChat={practiceData.freeChat}
              decks={practiceData.decks}
            />
          )}
        </TabsContent>

        <TabsContent value="research" className="mt-6">
          <ResearchTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
