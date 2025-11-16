'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="w-full max-w-md space-y-4 text-center">
      <h2 className="text-2xl font-bold text-foreground">Authentication Error</h2>
      <p className="text-muted-foreground">
        {error === 'Configuration' && 'There is a problem with the server configuration.'}
        {error === 'AccessDenied' && 'You do not have permission to sign in.'}
        {error === 'Verification' && 'The verification token has expired or has already been used.'}
        {!error && 'An error occurred during authentication.'}
      </p>
      <Link
        href="/login"
        className="inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Back to login
      </Link>
    </div>
  );
}
