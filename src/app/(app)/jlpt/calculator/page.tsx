import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'JLPT Calculator - Hitung Nilai',
  description: 'Calculate JLPT scores from practice tests',
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b-2 border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/jlpt"
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold">Kalkulator Nilai JLPT</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">
            Hitung nilai JLPT dari hasil latihan di buku seperti Sou Matome, Kanzen Master, atau tes
            sampel resmi JLPT.
          </p>
        </div>

        <div className="rounded-base border-2 border-border bg-card p-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold mb-4">Dalam Pengembangan</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Fitur kalkulator offline sedang dalam tahap pengembangan dan akan tersedia di Phase 4
              (Week 6).
            </p>

            <div className="inline-block p-4 rounded-base bg-accent/50 text-left max-w-md">
              <h3 className="font-semibold mb-2">Fitur yang Akan Hadir:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Input nilai per mondai
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Perhitungan otomatis dengan sistem JLPT
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Hasil lulus/tidak lulus
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Riwayat perhitungan tersimpan
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Export hasil ke CSV
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link
            href="/jlpt"
            className="p-4 rounded-base border-2 border-border bg-card hover:shadow-lg transition-all text-center"
          >
            <div className="font-semibold mb-1">← Kembali ke Menu Utama</div>
            <div className="text-sm text-muted-foreground">Lihat fitur JLPT lainnya</div>
          </Link>

          <Link
            href="/jlpt/tryout"
            className="p-4 rounded-base border-2 border-primary/20 bg-primary/5 hover:shadow-lg transition-all text-center"
          >
            <div className="font-semibold mb-1">Coba Tryout Online →</div>
            <div className="text-sm text-muted-foreground">Simulasi tes JLPT lengkap</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
