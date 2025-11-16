import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import PreTaskStudyClient from '@/app/dashboard/tasks/[taskId]/pre-study/PreTaskStudyClient';

export const dynamic = 'force-dynamic';

export default async function TaskPreStudyPage({
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
