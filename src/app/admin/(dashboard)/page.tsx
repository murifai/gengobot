'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  Users,
  FolderKanban,
  Bot,
  Settings,
  BookOpen,
  Layers,
  CreditCard,
  Tag,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const adminCards = [
  {
    title: 'Analytics',
    description: 'View system-wide analytics and user statistics',
    icon: BarChart3,
    href: '/admin/analytics',
    buttonText: 'View Analytics',
  },
  {
    title: 'Users',
    description: 'Manage user accounts and permissions',
    icon: Users,
    href: '/admin/users',
    buttonText: 'Manage Users',
  },
  {
    title: 'Tasks',
    description: 'Manage conversation tasks and scenarios',
    icon: FolderKanban,
    href: '/admin/tasks',
    buttonText: 'Manage Tasks',
  },
  {
    title: 'Decks',
    description: 'Manage flashcard decks and study materials',
    icon: BookOpen,
    href: '/admin/decks',
    buttonText: 'Manage Decks',
  },
  {
    title: 'Categories',
    description: 'Organize tasks and decks by category',
    icon: Layers,
    href: '/admin/categories',
    buttonText: 'Manage Categories',
  },
  {
    title: 'Characters',
    description: 'Create and manage AI characters',
    icon: Bot,
    href: '/admin/characters',
    buttonText: 'Manage Characters',
  },
  {
    title: 'Subscription',
    description: 'Monitor subscription metrics and revenue',
    icon: CreditCard,
    href: '/admin/subscription',
    buttonText: 'View Metrics',
  },
  {
    title: 'Vouchers',
    description: 'Manage voucher codes and promotions',
    icon: Tag,
    href: '/admin/vouchers',
    buttonText: 'Manage Vouchers',
  },
  {
    title: 'Settings',
    description: 'Configure application settings',
    icon: Settings,
    href: '/admin/settings',
    buttonText: 'View Settings',
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your GengoBot application from here</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {adminCards.map(card => (
          <Card key={card.title} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <card.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={card.href}>
                <Button className="w-full" size="sm">
                  {card.buttonText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Overview of your system metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">0</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="text-3xl font-bold text-tertiary-green">0</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="text-3xl font-bold text-secondary">0</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-muted-foreground">Characters</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
