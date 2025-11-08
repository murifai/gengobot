import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import ProgressClient from './ProgressClient';

export default async function ProgressPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return <ProgressClient user={user} />;
}
