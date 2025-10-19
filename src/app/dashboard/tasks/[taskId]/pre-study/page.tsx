import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PreTaskStudyClient from './PreTaskStudyClient';

export default async function PreTaskStudyPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <PreTaskStudyClient user={user} taskId={taskId} />;
}
