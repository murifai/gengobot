'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle2, Loader2, XCircle, Chrome } from 'lucide-react';

export default function ExtensionAuthPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [authState, setAuthState] = useState<'loading' | 'success' | 'error' | 'unauthorized'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function generateExtensionToken() {
      if (status === 'loading') return;

      if (!session?.user?.email) {
        setAuthState('unauthorized');
        return;
      }

      try {
        const response = await fetch('/api/extension/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate',
            email: session.user.email,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to generate token');
        }

        const data = await response.json();

        // Store token info in localStorage for the extension to read
        // The extension will read this via content script
        const authData = {
          token: data.token,
          user: data.user,
          expiresAt: data.expiresAt,
          timestamp: Date.now(),
        };
        localStorage.setItem('gengo_extension_auth', JSON.stringify(authData));
        console.log('[Gengobot] Auth data stored in localStorage');

        // Dispatch event for extension content script
        // Dispatch multiple times with delays to ensure content script catches it
        const dispatchAuthEvent = () => {
          window.dispatchEvent(
            new CustomEvent('gengo-extension-auth', {
              detail: {
                token: data.token,
                user: data.user,
                expiresAt: data.expiresAt,
              },
            })
          );
          console.log('[Gengobot] Auth event dispatched');
        };

        // Dispatch immediately and with delays
        dispatchAuthEvent();
        setTimeout(dispatchAuthEvent, 100);
        setTimeout(dispatchAuthEvent, 500);
        setTimeout(dispatchAuthEvent, 1000);

        setAuthState('success');

        // Auto-close window after success if opened by extension
        const autoClose = searchParams?.get('autoClose');
        if (autoClose === 'true') {
          setTimeout(() => {
            window.close();
          }, 2000);
        }
      } catch (error) {
        console.error('Extension auth error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        setAuthState('error');
      }
    }

    generateExtensionToken();
  }, [session, status, searchParams]);

  if (status === 'loading' || authState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-3 border-border shadow-brutal">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <CardTitle>Menghubungkan ke Gengo Reader</CardTitle>
            <CardDescription>Mohon tunggu sebentar...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (authState === 'unauthorized') {
    // Preserve autoClose parameter in returnTo URL
    const autoClose = searchParams?.get('autoClose');
    const returnTo = autoClose ? `/extension/auth?autoClose=${autoClose}` : '/extension/auth';
    const loginUrl = `/login?returnTo=${encodeURIComponent(returnTo)}`;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-3 border-border shadow-brutal">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Login Diperlukan</CardTitle>
            <CardDescription>
              Silakan login ke Gengobot terlebih dahulu untuk menghubungkan extension.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <a href={loginUrl}>Login dengan Google</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authState === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-3 border-border shadow-brutal">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Terjadi Kesalahan</CardTitle>
            <CardDescription>{errorMessage || 'Gagal menghubungkan extension.'}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-3 border-border shadow-brutal">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <CardTitle>Berhasil Terhubung!</CardTitle>
          <CardDescription>
            Gengo Reader extension sudah terhubung dengan akun Gengobot kamu.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border-2 border-border bg-muted p-4">
            <div className="flex items-center gap-3">
              <Chrome className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{session?.user?.name || 'User'}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Kamu sekarang bisa menambahkan kata dari halaman web ke deck Gengobot. Tab ini akan
            tertutup otomatis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
