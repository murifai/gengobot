'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const SECTIONS = [
  {
    section: 'vocabulary',
    name: '言語知識（文字・語彙）',
    nameEn: 'Vocabulary',
    color: 'bg-purple-100 hover:bg-purple-200 border-purple-300',
  },
  {
    section: 'grammar_reading',
    name: '言語知識（文法）・読解',
    nameEn: 'Grammar & Reading',
    color: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300',
  },
  {
    section: 'listening',
    name: '聴解',
    nameEn: 'Listening',
    color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300',
  },
];

interface SectionStats {
  questions: number;
  mondai: number;
}

export default function JLPTQuestionSectionSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const level = params?.level as string;

  const [sectionData, setSectionData] = useState<Record<string, SectionStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/jlpt/stats');
        const data = await response.json();
        setSectionData(data.bySection?.[level] || {});
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [level]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/admin/jlpt/questions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Levels
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">JLPT {level} Question Management</h1>
        <p className="text-muted-foreground">Select a section to manage questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map(section => {
          const counts = sectionData[section.section] || { questions: 0, mondai: 0 };

          return (
            <Card
              key={section.section}
              className={`cursor-pointer transition-all ${section.color} border-2`}
              onClick={() => router.push(`/admin/jlpt/questions/${level}/${section.section}`)}
            >
              <CardHeader>
                <div>
                  <CardTitle className="text-lg">{section.name}</CardTitle>
                  <CardDescription className="text-sm font-medium">
                    {section.nameEn}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Questions:</span>
                    <span className="font-semibold">{loading ? '...' : counts.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mondai:</span>
                    <span className="font-semibold">{loading ? '...' : counts.mondai}</span>
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
