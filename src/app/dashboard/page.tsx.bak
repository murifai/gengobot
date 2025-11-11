'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap, MessageSquare, TrendingUp, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const dashboardCards = [
  {
    title: 'Pembelajaran Berbasis Tugas',
    description: 'Latih bahasa Jepang melalui tugas dan penilaian interaktif',
    icon: GraduationCap,
    href: '/dashboard/tasks',
    buttonText: 'Mulai Belajar',
  },
  {
    title: 'Dek Belajar',
    description:
      'Tinjau flashcard dengan pengulangan berjarak untuk kosakata, kanji, dan tata bahasa',
    icon: BookOpen,
    href: '/study',
    buttonText: 'Belajar Sekarang',
    badge: '📚',
  },
  {
    title: 'Mode Obrolan Bebas',
    description: 'Lakukan percakapan dengan karakter AI menggunakan teks atau input suara',
    icon: MessageSquare,
    href: '/dashboard/chat',
    buttonText: 'Mulai Mengobrol',
    badges: ['💬', '🎙️'],
  },
  {
    title: 'Pelacakan Kemajuan',
    description: 'Lihat kemajuan belajar dan statistik Anda',
    icon: TrendingUp,
    href: '/dashboard/progress',
    buttonText: 'Lihat Kemajuan',
  },
  {
    title: 'Karakter',
    description: 'Buat dan kelola mitra percakapan AI Anda',
    icon: Users,
    href: '/dashboard/characters',
    buttonText: 'Kelola Karakter',
  },
  {
    title: 'Pengaturan',
    description: 'Sesuaikan pengalaman belajar Anda',
    icon: Settings,
    href: '/dashboard/settings',
    buttonText: 'Buka Pengaturan',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Selamat datang kembali!</h1>
        <p className="text-muted-foreground">Lanjutkan perjalanan belajar bahasa Jepang Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map(card => (
          <Card key={card.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <card.icon className="h-8 w-8 text-primary" />
                {card.badge && <span className="text-2xl">{card.badge}</span>}
                {card.badges && (
                  <div className="flex gap-1">
                    {card.badges.map((badge, index) => (
                      <span key={index} className="text-xs bg-secondary/10 px-2 py-1 rounded">
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button className="w-full" onClick={() => router.push(card.href)}>
                {card.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
