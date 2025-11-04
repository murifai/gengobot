'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap, MessageSquare, TrendingUp, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const dashboardCards = [
  {
    title: 'Task-Based Learning',
    description: 'Practice Japanese through interactive tasks and assessments',
    icon: GraduationCap,
    href: '/dashboard/tasks',
    buttonText: 'Start Learning',
  },
  {
    title: 'Study Decks',
    description: 'Review flashcards with spaced repetition for vocabulary, kanji, and grammar',
    icon: BookOpen,
    href: '/study',
    buttonText: 'Study Now',
    badge: '📚',
  },
  {
    title: 'Free Chat Mode',
    description: 'Have conversations with AI characters using text or voice input',
    icon: MessageSquare,
    href: '/dashboard/chat',
    buttonText: 'Start Chatting',
    badges: ['💬', '🎙️'],
  },
  {
    title: 'Progress Tracking',
    description: 'View your learning progress and statistics',
    icon: TrendingUp,
    href: '/dashboard/progress',
    buttonText: 'View Progress',
  },
  {
    title: 'Characters',
    description: 'Create and manage your AI conversation partners',
    icon: Users,
    href: '/dashboard/characters',
    buttonText: 'Manage Characters',
  },
  {
    title: 'Settings',
    description: 'Customize your learning experience',
    icon: Settings,
    href: '/dashboard/settings',
    buttonText: 'Open Settings',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
        <p className="text-muted-foreground">Continue your Japanese learning journey</p>
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
