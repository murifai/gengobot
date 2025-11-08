import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import ChatClient from './ChatClient';

export default async function ChatPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return <ChatClient user={user} />;
}
