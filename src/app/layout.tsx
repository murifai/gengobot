import type { Metadata } from 'next';
import { Space_Grotesk, Shippori_Mincho, Zen_Kaku_Gothic_New } from 'next/font/google';
import { Providers } from '@/components/providers';
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
  weight: ['400', '700'], // Reduced from 4 weights to 2 for performance
  display: 'swap',
  preload: true,
});

const zenKakuGothic = Zen_Kaku_Gothic_New({
  variable: '--font-zen-kaku',
  subsets: ['latin'],
  weight: ['400', '700'], // Reduced from 3 weights to 2 for performance
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Gengobot-Ngobrol bahasa Jepang',
  description:
    'Tingkatkan kemampuan bahasa Jepang kamu lewat ngobrol sama AI kaya kamu ngobrol sama native',
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/favicon/site.webmanifest',
  appleWebApp: {
    title: 'Gengobot',
  },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
