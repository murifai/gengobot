import Link from 'next/link';
import { BookOpen, GraduationCap, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AppPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Beranda</h1>
        <p className="text-muted-foreground">
          Welcome back! Let&apos;s continue your Japanese learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Kaiwa Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Kaiwa</CardTitle>
            </div>
            <CardDescription>Conversation practice</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/kaiwa">
              <Button variant="outline" className="w-full">
                Start Chatting
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Drill Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Drill</CardTitle>
            </div>
            <CardDescription>Flashcard study</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/drill">
              <Button variant="outline" className="w-full">
                Study Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Ujian Card */}
        <Card className="hover:shadow-lg transition-shadow opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Ujian</CardTitle>
            </div>
            <CardDescription>JLPT preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        {/* Profile Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/profile">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
