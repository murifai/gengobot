import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import TasksClient from '@/app/dashboard/tasks/TasksClient';

export default async function KaiwaRoleplayPage() {
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    redirect('/login');
  }

  return (
    <TasksClient
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
