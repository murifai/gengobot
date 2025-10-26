import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ChatConversationClient from './ChatConversationClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatConversationPage({ params }: PageProps) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <ChatConversationClient conversationId={id} user={user} />;
}
