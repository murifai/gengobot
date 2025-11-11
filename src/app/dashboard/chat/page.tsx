import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import ChatClient from './ChatClient';

export default async function ChatPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    redirect('/login');
  }

  return (
    <ChatClient
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
