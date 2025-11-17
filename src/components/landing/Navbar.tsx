'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, loading, openLoginModal } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 flex justify-between items-center h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold text-foreground">GengoBot</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Lorem
            </Link>
            <Link
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ipsum
            </Link>
            <Link
              href="#faq"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dolor
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {loading ? (
            <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          ) : user ? (
            <Link href="/dashboard">
              <Button className="bg-primary hover:opacity-90">Consectetur</Button>
            </Link>
          ) : (
            <>
              <Button variant="ghost" onClick={openLoginModal}>
                Adipiscing
              </Button>
              <Button className="bg-primary hover:opacity-90" onClick={openLoginModal}>
                Elit
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
