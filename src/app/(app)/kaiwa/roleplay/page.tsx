import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import TasksClient from '@/components/app/kaiwa/TasksClient';

export const dynamic = 'force-dynamic';

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
