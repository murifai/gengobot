import { Suspense } from 'react';
import Link from 'next/link';
import DeckBrowser from '@/components/deck/DeckBrowser';
import { LoadingState } from '@/components/ui/LoadingState';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Drill Decks - Gengobot',
  description: 'Browse and drill flashcard decks',
};

export default function DrillHubPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dek Drill</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jelajahi dek flashcard dan latih dengan pengulangan berjarak
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/app/drill/decks/new">
            <button className="px-4 py-2 bg-tertiary-green hover:brightness-90 text-white rounded-lg transition-all">
              Buat Dek
            </button>
          </Link>
          <Link href="/app/drill/my-decks">
            <button className="px-4 py-2 bg-tertiary-purple hover:brightness-90 text-white rounded-lg transition-all">
              Dek Saya
            </button>
          </Link>
          <Link href="/app/profile/progress">
            <button className="px-4 py-2 bg-secondary hover:brightness-90 text-white rounded-lg transition-all">
              Lihat Statistik
            </button>
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingState type="spinner" size="lg" />
          </div>
        }
      >
        <DeckBrowser />
      </Suspense>
    </div>
  );
}
