import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import TaskAttemptClient from './TaskAttemptClient';

export default async function TaskAttemptPage({
  params,
}: {
  params: Promise<{ taskId: string; attemptId: string }>;
}) {
  const { taskId, attemptId } = await params;
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return <TaskAttemptClient user={user} taskId={taskId} attemptId={attemptId} />;
}
