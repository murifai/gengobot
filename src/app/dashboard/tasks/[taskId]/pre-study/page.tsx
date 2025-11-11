import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import PreTaskStudyClient from './PreTaskStudyClient';

export default async function PreTaskStudyPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const session = await auth();
  const user = session?.user;

  if (!user || !user.email) {
    redirect('/login');
  }

  return (
    <PreTaskStudyClient
      user={
        user as {
          id: string;
          email: string;
          name?: string | null;
          image?: string | null;
          isAdmin: boolean;
        }
      }
      taskId={taskId}
    />
  );
}
