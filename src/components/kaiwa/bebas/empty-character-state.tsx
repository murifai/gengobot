'use client';

import { Button } from '@/components/ui/Button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

export function EmptyCharacterState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
        <Users className="h-16 w-16 text-gray-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
        Belum Ada Karakter
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        Untuk memulai percakapan, buat karakter AI pertama Anda terlebih dahulu.
      </p>

      <Link href="/app/profile/characters/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Buat Karakter
        </Button>
      </Link>
    </div>
  );
}
