'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export function HomePage() {
  const { user, loading, openLoginModal } = useAuth();
  const searchParams = useSearchParams();

  // Auto-open login modal if redirected from protected route
  useEffect(() => {
    if (searchParams.get('login') === 'required') {
      openLoginModal();
    }
  }, [searchParams, openLoginModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--light)] via-[var(--tertiary-yellow)]/20 to-[var(--secondary)]/10 dark:from-[var(--dark)] dark:to-[var(--tertiary-purple)]/30 text-[var(--foreground)]">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--border)] bg-white/70 dark:bg-[var(--dark)]/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-[var(--primary)]">GengoBot</h1>
          <div className="flex gap-4">
            {loading ? (
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : user ? (
              <Link href="/dashboard">
                <Button className="bg-[var(--secondary)] text-[var(--dark)] hover:opacity-90">
                  Dasbor
                </Button>
              </Link>
            ) : (
              <>
                <Button variant="secondary" onClick={openLoginModal}>
                  Masuk
                </Button>
                <Button className="bg-[var(--primary)] hover:opacity-90" onClick={openLoginModal}>
                  Mulai
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-6 text-[var(--dark)] dark:text-[var(--light)]"
        >
          Kuasai Bahasa Jepang Lewat
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            Percakapan AI Interaktif
          </span>
        </motion.h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Latihan percakapan nyata sesuai situasi kerja dan kehidupan sehari-hari dengan AI yang
          menyesuaikan kemampuan kamu.
        </p>
        <div className="flex justify-center gap-4">
          {!loading && !user && (
            <>
              <Button
                size="lg"
                className="bg-[var(--primary)] text-white px-8 py-6 text-lg hover:opacity-90"
                onClick={openLoginModal}
              >
                Mulai Gratis
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-6 text-lg border border-[var(--secondary)] hover:bg-[var(--secondary)]/20"
              >
                Lihat Demo
              </Button>
            </>
          )}
          {!loading && user && (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-[var(--secondary)] text-[var(--dark)] px-8 py-6 text-lg hover:opacity-90"
              >
                Ke Dasbor
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h3 className="text-3xl font-bold mb-8 text-[var(--dark)] dark:text-[var(--light)]">
          Masalah yang Dihadapi Pembelajar
        </h3>
        <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-300 mb-10">
          Banyak pembelajar Jepang kesulitan berbicara lancar meski telah belajar bertahun-tahun.
          Hanya 12.9% yang merasa bisa berbicara dengan percaya diri.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            'Kurang kesempatan latihan dengan penutur asli.',
            'Pembelajaran fokus pada tata bahasa, bukan percakapan.',
            'Sulit mendapat umpan balik langsung saat berbicara.',
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-[var(--dark)]/60 rounded-xl shadow p-6">
              <p className="text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution Section */}
      <section className="bg-[var(--secondary)]/10 py-20 text-center">
        <h3 className="text-3xl font-bold mb-8 text-[var(--dark)] dark:text-[var(--light)]">
          Solusi: Aplikasi Gengobot
        </h3>
        <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-300 mb-12">
          Gengobot membantu kamu berlatih berbicara bahasa Jepang lewat simulasi tugas nyata seperti
          di tempat kerja, toko, atau transportasi umum.
        </p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-10">
        {[
          {
            icon: '🎯',
            title: 'Berbasis Tugas',
            desc: 'Latihan sesuai situasi nyata agar kamu siap di dunia kerja dan kehidupan sehari-hari.',
          },
          {
            icon: '🤖',
            title: 'AI Adaptif',
            desc: 'AI menyesuaikan percakapan dengan level dan konteks belajar kamu.',
          },
          {
            icon: '🎙️',
            title: 'Umpan Balik Langsung',
            desc: 'Dapatkan koreksi pengucapan dan struktur kalimat otomatis.',
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-[var(--dark)]/60 border border-[var(--border)] rounded-2xl p-8 shadow-md transition-all"
          >
            <div className="text-5xl mb-4">{f.icon}</div>
            <h4 className="text-xl font-semibold mb-2">{f.title}</h4>
            <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* UI Preview */}
      <section className="py-20 bg-[var(--light)]/60 dark:bg-[var(--dark)]/50 text-center">
        <h3 className="text-3xl font-bold mb-8 text-[var(--dark)] dark:text-[var(--light)]">
          Tampilan Aplikasi
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-10">
          Lihat bagaimana Gengobot membantu kamu berbicara seperti penutur asli.
        </p>
        <div className="flex justify-center">
          <div className="w-[320px] h-[640px] bg-gray-200 dark:bg-gray-700 rounded-3xl shadow-lg flex items-center justify-center text-gray-500">
            (Mockup App Preview)
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h3 className="text-3xl font-bold mb-10">Apa Kata Pengguna</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Ayu (N5)',
              text: 'AI-nya terasa seperti guru asli! Saya jadi lebih percaya diri berbicara.',
            },
            {
              name: 'Rizky (N4)',
              text: 'Skenarionya sangat realistis, saya bisa latihan seperti di tempat kerja Jepang.',
            },
            {
              name: 'Dina (N5)',
              text: 'Fitur feedback membantu saya tahu kesalahan pengucapan langsung.',
            },
          ].map((t, i) => (
            <div key={i} className="bg-white dark:bg-[var(--dark)]/60 rounded-xl p-6 shadow">
              <p className="text-gray-600 dark:text-gray-300 mb-3 italic">&ldquo;{t.text}&rdquo;</p>
              <p className="font-semibold text-[var(--primary)]">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Research & Credibility */}
      <section className="bg-[var(--secondary)]/10 py-20 text-center">
        <h3 className="text-3xl font-bold mb-6">Dibangun Berdasarkan Penelitian</h3>
        <p className="max-w-4xl mx-auto text-gray-600 dark:text-gray-300">
          Aplikasi ini dikembangkan melalui riset di bidang pendidikan bahasa Jepang dan teknologi
          AI. Berdasarkan model pembelajaran berbasis tugas (Task-Based Learning) dan evaluasi
          Can-do JF Standard (A1–A2).
        </p>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h3 className="text-3xl font-bold mb-10 text-[var(--dark)] dark:text-[var(--light)]">
          Pilih Paket Belajarmu
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Gratis',
              price: 'Rp0',
              desc: 'Akses 3 sesi percakapan per minggu.',
              features: ['AI Roleplay', 'Can-do Task A1', 'Riwayat Belajar'],
            },
            {
              name: 'Pro',
              price: 'Rp79.000/bulan',
              desc: 'Untuk latihan intensif harian.',
              features: ['Semua level A1–A2', 'Umpan Balik Suara', 'Laporan Kemajuan'],
            },
            {
              name: 'Edu Partner',
              price: 'Khusus Institusi',
              desc: 'Untuk lembaga pelatihan dan sekolah.',
              features: ['Manajemen Kelas', 'Monitoring Siswa', 'Integrasi LMS'],
            },
          ].map((p, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[var(--dark)]/60 border border-[var(--border)] rounded-2xl p-8 shadow-md"
            >
              <h4 className="text-2xl font-semibold text-[var(--primary)] mb-2">{p.name}</h4>
              <p className="text-xl font-bold mb-4">{p.price}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{p.desc}</p>
              <ul className="space-y-2 mb-6 text-gray-600 dark:text-gray-300">
                {p.features.map((f, idx) => (
                  <li key={idx}>• {f}</li>
                ))}
              </ul>
              <Button className="bg-[var(--primary)] hover:opacity-90 text-white px-6 py-3">
                Pilih Paket
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold mb-10 text-center">Pertanyaan Umum</h3>
        <div className="space-y-6 text-gray-600 dark:text-gray-300">
          <details className="bg-white dark:bg-[var(--dark)]/60 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Apakah Gengobot gratis?</summary>
            <p className="mt-2">
              Ya, tersedia versi gratis dengan fitur dasar untuk latihan mingguan.
            </p>
          </details>
          <details className="bg-white dark:bg-[var(--dark)]/60 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Apakah cocok untuk JLPT N5?</summary>
            <p className="mt-2">
              Cocok untuk level pemula (N5–N4). AI akan menyesuaikan level percakapan otomatis.
            </p>
          </details>
          <details className="bg-white dark:bg-[var(--dark)]/60 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">
              Apakah bisa digunakan tanpa internet?
            </summary>
            <p className="mt-2">Belum, koneksi internet dibutuhkan untuk fungsi AI.</p>
          </details>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] py-16 text-center text-white">
        <h3 className="text-3xl md:text-4xl font-bold mb-6">Mulai Perjalanan Belajarmu Sekarang</h3>
        <p className="mb-8 text-lg opacity-90">
          Gabung dan rasakan peningkatan kemampuan berbicara hanya dalam dua minggu.
        </p>
        {!user && (
          <Button
            size="lg"
            className="bg-white text-[var(--dark)] px-10 py-6 text-lg hover:opacity-90"
            onClick={openLoginModal}
          >
            Coba Gengobot Sekarang
          </Button>
        )}
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm bg-white/50 dark:bg-[var(--dark)]/50">
        <p>© {new Date().getFullYear()} GengoBot. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
