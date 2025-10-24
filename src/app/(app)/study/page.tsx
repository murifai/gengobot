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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Study Decks</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse flashcard decks and practice with spaced repetition
          </p>
        </div>
        <Link href="/study/stats">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            View Statistics
          </button>
        </Link>
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
