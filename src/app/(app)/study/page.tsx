'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import DeckBrowser from '@/components/deck/DeckBrowser';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';

export default function StudyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Study Decks">
        <Link href="/study/stats">
          <Button size="sm">View Statistics</Button>
        </Link>
      </PageHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingState type="spinner" size="lg" />
            </div>
          }
        >
          <DeckBrowser />
        </Suspense>
      </main>
    </div>
  );
}
