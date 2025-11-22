'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Settings } from 'lucide-react';

export function CharactersTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Karakter AI
        </CardTitle>
        <CardDescription>Kelola karakter AI untuk latihan percakapan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/app/profile/characters" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Settings className="h-4 w-4" />
              Kelola Karakter
            </Button>
          </Link>
          <Link href="/app/profile/characters/new">
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Buat Karakter Baru
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
