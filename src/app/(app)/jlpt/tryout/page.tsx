import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'JLPT Tryout - Pilih Level',
  description: 'Select JLPT level for online practice test',
};

export default function TryoutPage() {
  const levels = [
    {
      level: 'N5',
      title: 'JLPT N5',
      description: 'Tingkat Dasar',
      color: 'bg-green-500',
    },
    {
      level: 'N4',
      title: 'JLPT N4',
      description: 'Tingkat Dasar-Menengah',
      color: 'bg-blue-500',
    },
    {
      level: 'N3',
      title: 'JLPT N3',
      description: 'Tingkat Menengah',
      color: 'bg-yellow-500',
    },
    {
      level: 'N2',
      title: 'JLPT N2',
      description: 'Tingkat Menengah-Lanjut',
      color: 'bg-orange-500',
    },
    {
      level: 'N1',
      title: 'JLPT N1',
      description: 'Tingkat Lanjut',
      color: 'bg-red-500',
    },
  ];

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
          <h1 className="text-2xl font-bold">Pilih Level JLPT</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">
            Pilih level JLPT yang ingin kamu latih. Tes akan dimulai setelah kamu mengkonfirmasi
            pilihan level.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map(({ level, title, description, color }) => (
            <button
              key={level}
              disabled
              className="group p-6 rounded-base border-2 border-border bg-card hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div
                className={`w-12 h-12 rounded-base ${color} mb-4 flex items-center justify-center text-white font-bold text-xl`}
              >
                {level}
              </div>
              <h3 className="text-xl font-bold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="mt-4 text-xs text-muted-foreground italic">
                Coming soon in Phase 2
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-base border-2 border-primary/20 bg-primary/5">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Tryout online akan tersedia di Phase
            2 pengembangan. Sementara waktu, kamu bisa menggunakan Kalkulator Offline untuk
            menghitung nilai dari buku latihan.
          </p>
        </div>
      </div>
    </div>
  );
}
