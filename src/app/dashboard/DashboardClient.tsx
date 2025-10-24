'use client';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">GengoBot Dashboard</h1>
            <Button onClick={handleSignOut} variant="secondary">
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h2>
          <p className="text-gray-600 dark:text-gray-400">Logged in as: {user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Task-Based Learning
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Practice Japanese through interactive tasks and assessments
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard/tasks')}>
              Start Learning
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Study Decks
              </h3>
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Review flashcards with spaced repetition for vocabulary, kanji, and grammar
            </p>
            <Button className="w-full" onClick={() => router.push('/study')}>
              Study Now
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Free Chat Mode
              </h3>
              <div className="flex gap-1">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  💬
                </span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                  🎙️
                </span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Have conversations with AI characters using text or voice input
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard/chat')}>
              Start Chatting
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Progress Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              View your learning progress and statistics
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard/progress')}>
              View Progress
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Characters</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create and manage your AI conversation partners
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard/characters')}>
              Manage Characters
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Settings</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Customize your learning experience
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard/settings')}>
              Open Settings
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
