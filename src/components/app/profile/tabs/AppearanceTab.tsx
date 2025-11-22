'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Monitor } from 'lucide-react';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tampilan</CardTitle>
        <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
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

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Pilih Tema</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <Sun className="h-5 w-5" />
                <span className="text-sm font-medium">Terang</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <Moon className="h-5 w-5" />
                <span className="text-sm font-medium">Gelap</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  theme === 'system'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-sm font-medium">Sistem</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
