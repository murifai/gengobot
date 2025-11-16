import Link from 'next/link';
import { MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default function KaiwaHubPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Kaiwa</h1>
        <p className="text-muted-foreground">Practice Japanese conversation with AI characters</p>
      </div>

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
              Free conversation practice with your favorite AI characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Chat naturally without constraints. Perfect for practicing everyday conversation and
              improving your fluency.
            </p>
            <Link href="/app/kaiwa/bebas">
              <Button className="w-full">Start Free Chat</Button>
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
              Task-based conversation practice with structured scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Practice specific situations and improve your skills with guided roleplay tasks
              tailored to your JLPT level.
            </p>
            <Link href="/app/kaiwa/roleplay">
              <Button className="w-full">Browse Tasks</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
