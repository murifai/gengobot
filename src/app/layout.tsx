import type { Metadata } from 'next';
import { Space_Grotesk, Shippori_Mincho, Zen_Kaku_Gothic_New } from 'next/font/google';
import { Providers } from '@/components/providers';
import { ReactEditLoader } from '@/components/dev/react-edit-loader';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap', // Better font loading performance
  preload: true,
  variable: '--font-space-grotesk',
});

const shipporiMincho = Shippori_Mincho({
  variable: '--font-shippori',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const zenKakuGothic = Zen_Kaku_Gothic_New({
  variable: '--font-zen-kaku',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
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
      <body
        className={`${spaceGrotesk.className} ${shipporiMincho.variable} ${zenKakuGothic.variable} antialiased`}
      >
        <ReactEditLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
