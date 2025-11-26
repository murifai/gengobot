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
    <div className="min-h-screen bg-main">
      <nav className="bg-background border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <Button onClick={() => router.push('/dashboard')} variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Account Settings</h2>

          {error && (
            <div className="mb-4 p-4 bg-primary/10 border-2 border-primary rounded-base">
              <p className="text-primary">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-tertiary-green/10 border-2 border-tertiary-green rounded-base">
              <p className="text-tertiary-green">Settings saved successfully!</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={user.email || ''}
                disabled
                className="bg-secondary-background"
              />
              <p className="mt-1 text-sm text-muted-foreground">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
              <Input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Japanese Proficiency Level
              </label>
              <select
                value={proficiency}
                onChange={e => setProficiency(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary"
              >
                <option value="N5">N5 - Beginner</option>
                <option value="N4">N4 - Elementary</option>
                <option value="N3">N3 - Intermediate</option>
                <option value="N2">N2 - Advanced</option>
                <option value="N1">N1 - Expert</option>
              </select>
              <p className="mt-1 text-sm text-muted-foreground">
                Your current JLPT proficiency level
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} disabled={loading} size="lg" className="w-full">
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
