import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { LazyFreeConversationClient } from '@/lib/performance/lazy-imports';

export const dynamic = 'force-dynamic';

export default async function KaiwaBebasPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    redirect('/login');
  }

  return (
    <LazyFreeConversationClient
      user={
        user as {
          id: string;
          email: string;
          name?: string | null;
          image?: string | null;
          isAdmin: boolean;
        }
      }
    />
  );
}
