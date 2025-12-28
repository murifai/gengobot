'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export default function TryoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const levels = [
    {
      level: 'N5',
      title: 'JLPT N5',
      description: 'Tingkat Dasar',
      color: 'bg-green-500',
    },
    {
      level: 'N4',
      title: 'JLPT N4',
      description: 'Tingkat Dasar-Menengah',
      color: 'bg-blue-500',
    },
    {
      level: 'N3',
      title: 'JLPT N3',
      description: 'Tingkat Menengah',
      color: 'bg-yellow-500',
    },
    {
      level: 'N2',
      title: 'JLPT N2',
      description: 'Tingkat Menengah-Lanjut',
      color: 'bg-orange-500',
    },
    {
      level: 'N1',
      title: 'JLPT N1',
      description: 'Tingkat Lanjut',
      color: 'bg-red-500',
    },
  ];

  const handleStartTest = async (level: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/jlpt/tryout/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start test');
      }

      const data = await response.json();

      // Redirect to test page
      router.push(`/jlpt/tryout/${data.attemptId}`);
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error(error instanceof Error ? error.message : 'テストの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b-2 border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/jlpt"
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold">Pilih Level JLPT</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">
            Pilih level JLPT yang ingin kamu latih. Tes akan dimulai setelah kamu memilih level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map(({ level, title, description, color }) => (
            <Button
              key={level}
              onClick={() => handleStartTest(level)}
              disabled={loading}
              className="group h-auto p-6 rounded-base border-2 border-border bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] text-left flex flex-col items-start"
              variant="outline"
            >
              <div
                className={`w-12 h-12 rounded-base ${color} mb-4 flex items-center justify-center text-white font-bold text-xl`}
              >
                {level}
              </div>
              <h3 className="text-xl font-bold mb-1 text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
