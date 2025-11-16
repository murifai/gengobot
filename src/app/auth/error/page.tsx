import { Suspense } from 'react';
import { AuthErrorContent } from './AuthErrorContent';

export const dynamic = 'force-dynamic';

export default function AuthError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
