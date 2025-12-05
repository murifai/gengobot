'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileHeader } from './ProfileHeader';
import { PersonalTab } from './tabs/PersonalTab';
import { SubscriptionTab } from './tabs/SubscriptionTab';
import { SettingTab } from './tabs/SettingTab';
import { User, CreditCard, Settings } from 'lucide-react';

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

const tabs = [
  { value: 'personal', label: 'Profil', icon: User },
  { value: 'billing', label: 'Langganan', icon: CreditCard },
  { value: 'setting', label: 'Settings', icon: Settings },
];

export function ProfilePage({ user }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileHeader user={user} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map(tab => {
            const Icon = tab.icon;

            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalTab user={user} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <SubscriptionTab />
        </TabsContent>

        <TabsContent value="setting" className="mt-6">
          <SettingTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
