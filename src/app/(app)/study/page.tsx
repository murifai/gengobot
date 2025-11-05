import { Suspense } from 'react';
import Link from 'next/link';
import DeckBrowser from '@/components/deck/DeckBrowser';
import { LoadingState } from '@/components/ui/LoadingState';

export const metadata = {
  title: 'Study Decks - Gengobot',
  description: 'Browse and study flashcard decks',
};

export default function StudyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dek Belajar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jelajahi dek flashcard dan latih dengan pengulangan berjarak
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/study/decks/new">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              Buat Dek
            </button>
          </Link>
          <Link href="/study/my-decks">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Dek Saya
            </button>
          </Link>
          <Link href="/study/stats">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
