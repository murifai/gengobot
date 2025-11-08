import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import TasksClient from './TasksClient';

export default async function TasksPage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return <TasksClient user={user} />;
}
