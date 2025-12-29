'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LEVELS = [
  {
    level: 'N5',
    totalQuestions: 86,
    totalMondai: 14,
    description: 'Beginner Level',
    color: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300',
  },
  {
    level: 'N4',
    totalQuestions: 105,
    totalMondai: 15,
    description: 'Elementary Level',
    color: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
  },
  {
    level: 'N3',
    totalQuestions: 104,
    totalMondai: 16,
    description: 'Intermediate Level',
    color: 'bg-amber-100 hover:bg-amber-200 border-amber-300',
  },
  {
    level: 'N2',
    totalQuestions: 104,
    totalMondai: 16,
    description: 'Upper-Intermediate Level',
    color: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
  },
  {
    level: 'N1',
    totalQuestions: 110,
    totalMondai: 17,
    description: 'Advanced Level',
    color: 'bg-red-100 hover:bg-red-200 border-red-300',
  },
];

export default function JLPTQuestionLevelSelectionPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JLPT Question Management</h1>
        <p className="text-muted-foreground">Select a JLPT level to manage questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVELS.map((levelData) => (
          <Card
            key={levelData.level}
            className={`cursor-pointer transition-all ${levelData.color} border-2`}
            onClick={() => router.push(`/admin/jlpt/questions/${levelData.level}`)}
          >
            <CardHeader>
              <CardTitle className="text-2xl">{levelData.level}</CardTitle>
              <CardDescription className="text-sm font-medium">
                {levelData.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Questions:</span>
                  <span className="font-semibold">{levelData.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Mondai:</span>
                  <span className="font-semibold">{levelData.totalMondai}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
