'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const LEVEL_INFO = [
  { level: 'N5', description: 'Beginner Level' },
  { level: 'N4', description: 'Elementary Level' },
  { level: 'N3', description: 'Intermediate Level' },
  { level: 'N2', description: 'Upper-Intermediate Level' },
  { level: 'N1', description: 'Advanced Level' },
];

interface LevelStats {
  totalQuestions: number;
  totalMondai: number;
}

export default function JLPTQuestionLevelSelectionPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, LevelStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/jlpt/stats');
        const data = await response.json();
        setStats(data.byLevel || {});
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JLPT Question Management</h1>
        <p className="text-muted-foreground">Select a JLPT level to manage questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVEL_INFO.map(levelInfo => {
          const levelStats = stats[levelInfo.level] || { totalQuestions: 0, totalMondai: 0 };

          return (
            <Card
              key={levelInfo.level}
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => router.push(`/admin/jlpt/questions/${levelInfo.level}`)}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{levelInfo.level}</CardTitle>
                <CardDescription className="text-sm font-medium">
                  {levelInfo.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Questions:</span>
                    <span className="font-semibold">
                      {loading ? '...' : levelStats.totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Mondai:</span>
                    <span className="font-semibold">
                      {loading ? '...' : levelStats.totalMondai}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
