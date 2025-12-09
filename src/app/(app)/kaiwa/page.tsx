import Link from 'next/link';
import { MessageSquare, Users, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default function KaiwaHubPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center gap-4">
        <Link
          href="/app"
          className="p-2 hover:bg-accent rounded-base transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-7 h-7 text-foreground" />
        </Link>
        <h1 className="text-2xl font-bold">Kaiwa</h1>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ngobrol Bebas Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Ngobrol Bebas</CardTitle>
              </div>
              <CardDescription>
                Latihan ngobrol santai bareng karakter AI favorit kamu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ngobrol tanpa aturan ribet. Cocok buat latihan percakapan sehari hari ningkatin
                bahasa Jepang kamu!
              </p>
              <Link href="/kaiwa/bebas">
                <Button className="w-full">Mulai Ngobrol</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Roleplay Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Roleplay</CardTitle>
              </div>
              <CardDescription>
                Latihan percakapan dengan tema dengan skenario yang jelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Latihan situasi tertentu dan tingkatkan kemampuan kamu menggunakan bahasa Jepang
                yang sesuai dengan kondisinya.
              </p>
              <Link href="/kaiwa/roleplay">
                <Button className="w-full">Lihat Tema</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
