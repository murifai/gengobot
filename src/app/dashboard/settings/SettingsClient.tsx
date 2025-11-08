'use client';

import { User } from '@/types/user';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface DbUser {
  id: string;
  name: string | null;
  email: string;
  proficiency: string;
  preferredTaskCategories: unknown;
}

interface SettingsClientProps {
  user: User;
  dbUser: DbUser | null;
}

export default function SettingsClient({ user, dbUser }: SettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(dbUser?.name || '');
  const [proficiency, setProficiency] = useState(dbUser?.proficiency || 'N5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/users/${dbUser?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, proficiency }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <Button onClick={() => router.push('/dashboard')} variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Account Settings
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-400">Settings saved successfully!</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Japanese Proficiency Level
              </label>
              <select
                value={proficiency}
                onChange={e => setProficiency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="N5">N5 - Beginner</option>
                <option value="N4">N4 - Elementary</option>
                <option value="N3">N3 - Intermediate</option>
                <option value="N2">N2 - Advanced</option>
                <option value="N1">N1 - Expert</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your current JLPT proficiency level
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                loading={loading}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
