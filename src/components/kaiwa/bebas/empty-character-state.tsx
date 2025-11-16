'use client';

import { Button } from '@/components/ui/Button';
import { UserPlus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyCharacterStateProps {
  onQuickCreate: () => void;
}

export function EmptyCharacterState({ onQuickCreate }: EmptyCharacterStateProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
        <Users className="h-16 w-16 text-gray-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
        まだキャラクターがいません
        <br />
        No Characters Yet
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        会話を始めるには、まずキャラクターを作成してください。クイック作成で簡単に始められます！
        <br />
        <br />
        To start chatting, create your first character. Use Quick Create to get started easily!
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={onQuickCreate} size="lg" className="gap-2">
          <UserPlus className="h-5 w-5" />
          クイック作成 / Quick Create
        </Button>

        <Button
          onClick={() => router.push('/app/profile/characters/new')}
          variant="outline"
          size="lg"
        >
          詳細作成 / Full Setup
        </Button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-w-md">
        <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
          💡 <strong>ヒント / Tip:</strong> クイック作成なら、名前と関係性だけで会話を始められます！
          <br />
          Quick Create lets you start chatting with just a name and relationship!
        </p>
      </div>
    </div>
  );
}
