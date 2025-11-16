import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import FreeConversationClient from './FreeConversationClient';

export default async function KaiwaBebasPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    redirect('/login');
  }

  return (
    <FreeConversationClient
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
