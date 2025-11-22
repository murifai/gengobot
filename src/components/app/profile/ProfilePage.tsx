'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHeader } from './ProfileHeader';
import { PersonalTab } from './tabs/PersonalTab';
import { AccountSecurityTab } from './tabs/AccountSecurityTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { CharactersTab } from './tabs/CharactersTab';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  fullName: string | null;
  nickname: string | null;
  domicile: string | null;
  institution: string | null;
  proficiency: string;
  subscriptionPlan: string;
  createdAt: Date;
}

interface ProfilePageProps {
  user: UserProfile;
}

export function ProfilePage({ user }: ProfilePageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHeader user={user} />

      <Tabs defaultValue="personal" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="account">Account & Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="characters">Karakter</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalTab user={user} />
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <AccountSecurityTab user={user} />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <AppearanceTab />
        </TabsContent>

        <TabsContent value="characters" className="mt-6">
          <CharactersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
