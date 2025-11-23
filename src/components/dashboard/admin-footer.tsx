'use client';

import Link from 'next/link';

export function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background px-4 py-4">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {currentYear} GengoBot. All rights reserved.
        </p>
        <nav className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/support"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}
