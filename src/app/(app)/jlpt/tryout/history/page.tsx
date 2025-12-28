'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp, Award, Clock, Filter, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { JLPTLoadingState, TestHistoryLoadingSkeleton } from '@/components/jlpt/common/LoadingState';
import { JLPTErrorState } from '@/components/jlpt/common/ErrorState';
import type { JLPTLevel, TestStatus } from '@/lib/jlpt/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TestAttempt {
  id: string;
  level: JLPTLevel;
  status: TestStatus;
  totalScore: number | null;
  isPassed: boolean | null;
  startedAt: string;
  completedAt: string | null;
  sectionScores: Record<string, any>;
}

export default function TestHistoryPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TestStatus | 'all'>('all');

  useEffect(() => {
    fetchHistory();
  }, [selectedLevel, selectedStatus]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`/api/jlpt/history/attempts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setAttempts(data.attempts);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const completedAttempts = attempts.filter(a => a.status === 'completed' && a.totalScore !== null);

  // Prepare chart data
  const chartData = completedAttempts
    .slice(0, 10)
    .reverse()
    .map((attempt, index) => ({
      name: `Test ${index + 1}`,
      score: attempt.totalScore,
      date: new Date(attempt.completedAt!).toLocaleDateString('ja-JP'),
      level: attempt.level,
    }));

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">受験履歴</h1>
        </div>
        <TestHistoryLoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <JLPTErrorState
          title="履歴の読み込みエラー"
          message="受験履歴の読み込み中にエラーが発生しました。"
          error={error}
          onRetry={fetchHistory}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">受験履歴</h1>
        <p className="text-muted-foreground">
          これまでの受験記録とスコアの推移を確認できます
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">フィルター:</span>
        </div>

        {/* Level Filter */}
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value as JLPTLevel | 'all')}
          className="px-3 py-1.5 border-2 border-border rounded-md text-sm bg-background"
        >
          <option value="all">全レベル</option>
          <option value="N5">N5</option>
          <option value="N4">N4</option>
          <option value="N3">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as TestStatus | 'all')}
          className="px-3 py-1.5 border-2 border-border rounded-md text-sm bg-background"
        >
          <option value="all">全ステータス</option>
          <option value="completed">完了</option>
          <option value="in_progress">進行中</option>
          <option value="abandoned">中断</option>
        </select>

        {attempts.length > 0 && (
          <div className="ml-auto text-sm text-muted-foreground">
            {attempts.length} 件の記録
          </div>
        )}
      </div>

      {/* Score Trend Chart */}
      {chartData.length > 0 && (
        <div className="mb-8 p-6 border-2 border-border rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">スコア推移</h2>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 180]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border-2 border-border rounded-lg p-3 shadow-lg">
                        <div className="font-semibold">{data.date}</div>
                        <div className="text-sm text-muted-foreground">{data.level}</div>
                        <div className="text-lg font-bold text-primary mt-1">
                          {data.score} / 180
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                name="総合得点"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Test List */}
      {attempts.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">受験履歴がありません</h3>
          <p className="text-muted-foreground mb-6">
            JLPTの模擬試験を受験すると、ここに履歴が表示されます
          </p>
          <Button asChild>
            <Link href="/jlpt/tryout">模擬試験を開始</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt) => (
            <Link
              key={attempt.id}
              href={`/jlpt/results/${attempt.id}`}
              className="block"
            >
              <div className="border-2 border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={attempt.isPassed ? 'default' : 'destructive'}>
                      {attempt.level}
                    </Badge>
                    <Badge
                      variant={
                        attempt.status === 'completed'
                          ? 'default'
                          : attempt.status === 'in_progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {attempt.status === 'completed' ? '完了' : attempt.status === 'in_progress' ? '進行中' : '中断'}
                    </Badge>
                  </div>

                  {attempt.isPassed !== null && (
                    <Badge
                      variant={attempt.isPassed ? 'default' : 'outline'}
                      className={cn(
                        attempt.isPassed && 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      {attempt.isPassed ? '合格' : '不合格'}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(attempt.startedAt).toLocaleDateString('ja-JP')}
                  </div>
                  {attempt.completedAt && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(attempt.completedAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>

                {attempt.totalScore !== null && (
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {attempt.totalScore} / 180
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
