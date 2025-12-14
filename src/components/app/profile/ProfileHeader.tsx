'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Mail, Pencil } from 'lucide-react';
import { UserProfile } from './ProfilePage';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@prisma/client';

interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { tier, isLoading: isLoadingSubscription } = useSubscription();

  const getTierLabel = () => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return 'Pro';
      case SubscriptionTier.BASIC:
        return 'Basic';
      default:
        return 'Free';
    }
  };

  const getTierBadgeVariant = (): 'default' | 'primary' | 'secondary' => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return 'primary';
      case SubscriptionTier.BASIC:
        return 'secondary';
      default:
        return 'default';
    }
  };
  // Display full name first, fallback to Google account name
  const displayName = user.fullName || user.name || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(user.createdAt).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.image || undefined} alt={displayName} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {isLoadingSubscription ? (
            <Badge variant="secondary">...</Badge>
          ) : (
            <Badge variant={getTierBadgeVariant()}>{getTierLabel()}</Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Member sejak {memberSince}</span>
          </div>
        </div>
      </div>

      <Link href="/profile/edit">
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </Link>
    </div>
  );
}
