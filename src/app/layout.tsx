import type { Metadata } from 'next';
import { Sora, Shippori_Mincho } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const shipporiMincho = Shippori_Mincho({
  variable: '--font-shippori',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Gengotalk - AI-Powered Japanese Learning',
  description:
    'Enhance your Japanese speaking skills through task-based interactive roleplay conversations powered by AI',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sora.variable} ${shipporiMincho.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
