import { Suspense } from 'react';
import { HomePage } from './HomePage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800" />
      }
    >
      <HomePage />
    </Suspense>
  );
}
