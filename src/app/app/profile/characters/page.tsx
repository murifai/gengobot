import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { User } from '@/types/user';
import CharactersClient from '@/app/dashboard/characters/CharactersClient';

export default async function CharactersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user: User = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    isAdmin: session.user.isAdmin,
  };

  return <CharactersClient user={user} />;
}
