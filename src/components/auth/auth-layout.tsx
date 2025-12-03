'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Auth main container
interface AuthProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc?: string;
}

export function Auth({ children, imageSrc, className, ...props }: AuthProps) {
  return (
    <div className={cn('container min-h-screen flex items-stretch', className)} {...props}>
      <div className="flex-1 flex flex-col justify-between py-10">
        {/* Header with logo */}
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Gengobot"
              width={150}
              height={40}
              className="h-8 w-auto drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            />
          </Link>
        </header>

        {/* Main content */}
        <main className="flex flex-col items-center justify-center">
          <div className="w-full max-w-[28rem] space-y-6">{children}</div>
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GengoBot. All rights reserved.
        </footer>
      </div>

      {/* Right side image */}
      {imageSrc && (
        <div className="hidden md:block basis-1/2 relative min-h-screen bg-muted">
          <Image src={imageSrc} alt="Authentication" fill className="object-cover" priority />
        </div>
      )}
    </div>
  );
}

// Auth header section
type AuthHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function AuthHeader({ children, className, ...props }: AuthHeaderProps) {
  return (
    <div className={cn('space-y-2 text-center', className)} {...props}>
      {children}
    </div>
  );
}

// Auth title
type AuthTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function AuthTitle({ children, className, ...props }: AuthTitleProps) {
  return (
    <h1 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h1>
  );
}

// Auth description
type AuthDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function AuthDescription({ children, className, ...props }: AuthDescriptionProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

// Auth form container
type AuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function AuthForm({ children, className, ...props }: AuthFormProps) {
  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {children}
    </div>
  );
}

// Auth footer
type AuthFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function AuthFooter({ children, className, ...props }: AuthFooterProps) {
  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {children}
    </div>
  );
}
