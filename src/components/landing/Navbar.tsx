'use client';

import Image from 'next/image';
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
            <Image
              src="/logo.png"
              alt="Gengobot"
              width={150}
              height={40}
              className="h-8 w-auto drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
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
