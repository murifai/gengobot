import Link from 'next/link';
import { ChevronLeft, BookOpen, Calculator, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'JLPT Tryout - Gengobot',
  description: 'Practice JLPT tests and calculate your scores',
};

export default function JLPTLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/app"
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold">JLPT Tryout & Calculator</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Latihan JLPT & Kalkulator Nilai</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Latih kemampuan bahasa Jepang kamu dengan simulasi tes JLPT yang lengkap atau hitung
            nilai dari tes latihanmu dengan kalkulator kami.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Online Tryout Card */}
          <Link
            href="/jlpt/tryout"
            className="group relative overflow-hidden rounded-base border-2 border-border bg-card p-8 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-base bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Tryout Online</h3>
                <p className="text-muted-foreground">
                  Simulasi tes JLPT lengkap dengan timer dan sistem penilaian resmi
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Tes lengkap untuk level N5 - N1
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Timer otomatis per seksi
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Hasil detail dengan breakdown per mondai
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Riwayat tes tersimpan otomatis
              </li>
            </ul>

            <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
              Mulai Tryout
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </div>
          </Link>

          {/* Calculator Card */}
          <Link
            href="/jlpt/calculator"
            className="group relative overflow-hidden rounded-base border-2 border-border bg-card p-8 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-base bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Kalkulator Offline</h3>
                <p className="text-muted-foreground">
                  Hitung nilai dari buku latihan atau tes sampel JLPT
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Input nilai per mondai
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Sistem penilaian JLPT resmi
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Hasil lulus/tidak lulus
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Riwayat perhitungan tersimpan
              </li>
            </ul>

            <div className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
              Buka Kalkulator
              <ChevronLeft className="w-5 h-5 rotate-180" />
            </div>
          </Link>
        </div>

        {/* History Section */}
        <div className="rounded-base border-2 border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-base bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Pantau Progresmu</h3>
          </div>

          <p className="text-muted-foreground mb-4">
            Semua hasil tryout dan perhitungan tersimpan otomatis. Kamu bisa melihat perkembangan
            nilai dan mengidentifikasi area yang perlu ditingkatkan.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3 p-4 rounded-base bg-accent/50">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <div className="font-semibold mb-1">Grafik Perkembangan</div>
                <div className="text-muted-foreground">Lihat tren nilai dari waktu ke waktu</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-base bg-accent/50">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
              <div>
                <div className="font-semibold mb-1">Analisis Detail</div>
                <div className="text-muted-foreground">Breakdown per seksi dan mondai</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 rounded-base border-2 border-primary/20 bg-primary/5">
          <h3 className="font-bold mb-2 text-primary">💡 Tips Penggunaan</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[80px]">Tryout:</span>
              Pilih level JLPT yang sesuai, kerjakan tes seperti ujian asli dengan timer.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[80px]">Kalkulator:</span>
              Masukkan jumlah benar per mondai dari buku latihan seperti Sou Matome atau Kanzen
              Master.
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-foreground min-w-[80px]">Sistem Nilai:</span>
              Menggunakan weighted scoring dan normalisasi seperti JLPT resmi.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
