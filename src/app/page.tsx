'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GengoBot</h1>
            <div className="flex gap-4">
              {loading ? (
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : user ? (
                <Link href="/dashboard">
                  <Button>Dasbor</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="secondary">Masuk</Button>
                  </Link>
                  <Link href="/login">
                    <Button>Mulai</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Kuasai Bahasa Jepang Melalui
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Percakapan Bertenaga AI
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Tingkatkan kemampuan berbicara bahasa Jepang Anda melalui percakapan roleplay interaktif
            berbasis tugas yang didukung oleh teknologi AI canggih.
          </p>
          <div className="flex gap-4 justify-center">
            {!loading && !user && (
              <>
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Mulai Belajar Gratis
                  </Button>
                </Link>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Lihat Demo
                </Button>
              </>
            )}
            {!loading && user && (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6">
                  Ke Dasbor
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Pembelajaran Berbasis Tugas
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Latih bahasa Jepang melalui skenario dunia nyata dan tugas interaktif yang dirancang
              untuk meningkatkan keterampilan bahasa praktis Anda.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Karakter AI
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Terlibat dalam percakapan alami dengan karakter bertenaga AI yang menyesuaikan dengan
              tingkat pembelajaran dan minat Anda.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Pengenalan Suara
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tingkatkan pengucapan Anda dengan teknologi pengenalan suara canggih dan dapatkan
              umpan balik instan tentang cara bicara Anda.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
