import Link from 'next/link';
import { Settings, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProfileHubPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and track your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Settings</CardTitle>
            </div>
            <CardDescription>Account and app preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your account settings and preferences
            </p>
            <Link href="/app/profile/settings">
              <Button variant="outline" className="w-full">
                Open Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Progress</CardTitle>
            </div>
            <CardDescription>Your learning statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View your learning progress and achievements
            </p>
            <Link href="/app/profile/progress">
              <Button variant="outline" className="w-full">
                View Progress
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Characters Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>Characters</CardTitle>
            </div>
            <CardDescription>Manage AI conversation partners</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create and manage your AI characters
            </p>
            <Link href="/app/profile/characters">
              <Button variant="outline" className="w-full">
                Manage Characters
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
