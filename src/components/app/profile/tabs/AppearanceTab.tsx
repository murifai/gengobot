'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon } from 'lucide-react';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tampilan</CardTitle>
        <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="dark-mode" className="text-base font-medium">
                Mode Gelap
              </Label>
              <p className="text-sm text-muted-foreground">
                Gunakan tema gelap untuk tampilan yang lebih nyaman di mata
              </p>
            </div>
          </div>
          <Switch
            id="dark-mode"
            checked={theme === 'dark'}
            onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
