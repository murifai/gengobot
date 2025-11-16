/**
 * SEO Metadata Utilities
 * Phase 4: SEO & Meta Tags
 */

import type { Metadata } from 'next';

const SITE_NAME = 'GengoBot';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gengobot.com';
const DEFAULT_DESCRIPTION =
  'Belajar bahasa Jepang dengan AI. Latihan percakapan, drill kosakata, dan persiapan JLPT dengan teknologi AI terkini.';
const DEFAULT_OG_IMAGE = '/og-image.png';

/**
 * Base metadata for all pages
 */
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'belajar bahasa jepang',
    'japanese learning',
    'AI japanese tutor',
    'JLPT',
    'kosakata jepang',
    'percakapan jepang',
    'flashcard jepang',
    'gengo',
    'gengobot',
  ],
  authors: [{ name: 'GengoBot Team' }],
  creator: 'GengoBot',
  publisher: 'GengoBot',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    creator: '@gengobot',
  },
};

/**
 * Generate metadata for specific pages
 */
export const pageMetadata = {
  /**
   * Home / Landing page
   */
  home: (): Metadata => ({
    title: 'Belajar Bahasa Jepang dengan AI',
    description:
      'Platform pembelajaran bahasa Jepang berbasis AI. Latihan percakapan real-time, drill kosakata, dan persiapan JLPT dengan feedback instan.',
    openGraph: {
      title: 'GengoBot - Belajar Bahasa Jepang dengan AI',
      description: 'Platform pembelajaran bahasa Jepang berbasis AI',
      images: ['/og-home.png'],
    },
  }),

  /**
   * Dashboard / App home
   */
  dashboard: (): Metadata => ({
    title: 'Dashboard',
    description: 'Dashboard GengoBot - Pantau progres belajar bahasa Jepang Anda',
    robots: { index: false },
  }),

  /**
   * Kaiwa Hub
   */
  kaiwa: (): Metadata => ({
    title: 'Kaiwa - Latihan Percakapan',
    description:
      'Latihan percakapan bahasa Jepang dengan AI. Bebas ngobrol atau roleplay dengan skenario terstruktur.',
    openGraph: {
      title: 'Kaiwa - Latihan Percakapan Bahasa Jepang',
      description: 'Latihan percakapan bahasa Jepang dengan AI',
      images: ['/og-kaiwa.png'],
    },
  }),

  /**
   * Kaiwa Bebas
   */
  kaiwaBebas: (): Metadata => ({
    title: 'Ngobrol Bebas',
    description:
      'Percakapan bebas bahasa Jepang dengan AI character. Latihan speaking natural tanpa batasan.',
    robots: { index: false },
  }),

  /**
   * Kaiwa Roleplay
   */
  kaiwaRoleplay: (): Metadata => ({
    title: 'Roleplay - Latihan Terstruktur',
    description: 'Latihan percakapan terstruktur dengan skenario JLPT. Feedback real-time dari AI.',
    openGraph: {
      title: 'Roleplay - Latihan Percakapan Terstruktur',
      description: 'Latihan percakapan terstruktur dengan skenario JLPT',
      images: ['/og-roleplay.png'],
    },
  }),

  /**
   * Drill Hub
   */
  drill: (): Metadata => ({
    title: 'Drill - Latihan Kosakata',
    description:
      'Latihan kosakata bahasa Jepang dengan sistem SRS (Spaced Repetition). Buat deck sendiri atau gunakan deck pre-made.',
    openGraph: {
      title: 'Drill - Latihan Kosakata Bahasa Jepang',
      description: 'Latihan kosakata dengan sistem Spaced Repetition',
      images: ['/og-drill.png'],
    },
  }),

  /**
   * My Decks
   */
  myDecks: (): Metadata => ({
    title: 'Deck Saya',
    description: 'Daftar deck flashcard bahasa Jepang Anda',
    robots: { index: false },
  }),

  /**
   * Deck Detail
   */
  deckDetail: (deckName?: string): Metadata => ({
    title: deckName ? `${deckName} - Deck` : 'Deck',
    description: `Latihan flashcard ${deckName || 'bahasa Jepang'}`,
    robots: { index: false },
  }),

  /**
   * Profile Hub
   */
  profile: (): Metadata => ({
    title: 'Profile',
    description: 'Profile dan pengaturan akun GengoBot',
    robots: { index: false },
  }),

  /**
   * Progress
   */
  progress: (): Metadata => ({
    title: 'Progress Belajar',
    description: 'Pantau progress belajar bahasa Jepang Anda',
    robots: { index: false },
  }),

  /**
   * Characters
   */
  characters: (): Metadata => ({
    title: 'Karakter AI',
    description: 'Kelola karakter AI untuk latihan percakapan',
    robots: { index: false },
  }),

  /**
   * Settings
   */
  settings: (): Metadata => ({
    title: 'Pengaturan',
    description: 'Pengaturan akun dan preferensi',
    robots: { index: false },
  }),

  /**
   * Ujian (Coming Soon)
   */
  ujian: (): Metadata => ({
    title: 'Ujian JLPT - Coming Soon',
    description: 'Persiapan ujian JLPT dengan AI akan segera hadir!',
    openGraph: {
      title: 'Ujian JLPT - Coming Soon',
      description: 'Persiapan ujian JLPT dengan AI',
      images: ['/og-ujian.png'],
    },
  }),

  /**
   * Login
   */
  login: (): Metadata => ({
    title: 'Login',
    description: 'Login ke GengoBot',
    robots: { index: false },
  }),

  /**
   * Terms of Service
   */
  termsOfService: (): Metadata => ({
    title: 'Syarat & Ketentuan',
    description: 'Syarat dan ketentuan penggunaan GengoBot',
  }),

  /**
   * Privacy Policy
   */
  privacyPolicy: (): Metadata => ({
    title: 'Kebijakan Privasi',
    description: 'Kebijakan privasi GengoBot',
  }),
};

/**
 * Generate JSON-LD structured data
 */
export const structuredData = {
  /**
   * Website schema
   */
  website: () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }),

  /**
   * Organization schema
   */
  organization: () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/gengobot',
      'https://facebook.com/gengobot',
      'https://instagram.com/gengobot',
    ],
  }),

  /**
   * Educational platform schema
   */
  educationalOrganization: () => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    areaServed: 'ID',
    educationalCredentialAwarded: 'Japanese Language Proficiency',
  }),

  /**
   * Course schema
   */
  course: (courseData: { name: string; description: string; provider: string }) => ({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: courseData.name,
    description: courseData.description,
    provider: {
      '@type': 'Organization',
      name: courseData.provider,
    },
  }),
};
