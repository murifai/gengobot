import { Suspense } from 'react';
import Link from 'next/link';
import DeckBrowser from '@/components/deck/DeckBrowser';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Drill Decks - Gengobot',
  description: 'Browse and drill flashcard decks',
};

export default function DrillHubPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold">Dek Drill</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/app/drill/decks/new">
            <Button>Buat Dek</Button>
          </Link>
          <Link href="/app/drill/my-decks">
            <Button variant="outline">Dek Saya</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
    </div>
  );
}
