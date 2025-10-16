import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TaskAttemptClient from './TaskAttemptClient';

export default async function TaskAttemptPage({
  params,
}: {
  params: Promise<{ taskId: string; attemptId: string }>;
}) {
  const { taskId, attemptId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <TaskAttemptClient user={user} taskId={taskId} attemptId={attemptId} />;
}
