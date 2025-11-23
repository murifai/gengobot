'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

interface Subscriber {
  id: string;
  tier: 'FREE' | 'BASIC' | 'PRO';
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface RecentSubscribersProps {
  subscribers: Subscriber[];
}

const TIER_STYLES = {
  FREE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  BASIC: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PRO: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

export function RecentSubscribers({ subscribers }: RecentSubscribersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Subscribers</CardTitle>
        <CardDescription>Latest paid subscription activations</CardDescription>
      </CardHeader>
      <CardContent>
        {subscribers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No paid subscribers yet</p>
        ) : (
          <div className="space-y-4">
            {subscribers.map(sub => (
              <div key={sub.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={sub.user.image || undefined} alt={sub.user.name || ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(sub.user.name, sub.user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">
                      {sub.user.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">{sub.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={TIER_STYLES[sub.tier]}>
                    {sub.tier}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
