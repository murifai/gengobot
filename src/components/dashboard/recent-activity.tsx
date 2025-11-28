'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, MessageCircle, BookOpen, Clock } from 'lucide-react';
import { UI_TEXT, formatRelativeTimeID } from '@/lib/constants/ui-text';
import { ACTIVITY_COLORS } from '@/components/app/dashboard/AppDashboard';

type ActivityType = 'roleplay' | 'kaiwa_bebas' | 'drill' | 'task_complete' | 'cards_learned';

interface Activity {
  type: ActivityType;
  data: {
    title?: string;
    jlptLevel?: string;
    score?: number | null;
    word?: string;
    deckName?: string;
    quality?: number;
  };
  timestamp: Date | string;
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

// Map legacy types to new types
function normalizeActivityType(type: ActivityType): 'roleplay' | 'kaiwa_bebas' | 'drill' {
  if (type === 'task_complete') return 'roleplay';
  if (type === 'cards_learned') return 'drill';
  return type;
}

function ActivityIcon({ type }: { type: ActivityType }) {
  const normalizedType = normalizeActivityType(type);
  const colors = ACTIVITY_COLORS[normalizedType];

  const iconProps = {
    className: `h-4 w-4 ${colors.icon}`,
  };

  return (
    <div className={`p-2 rounded-lg ${colors.iconBg}`}>
      {normalizedType === 'roleplay' && <MessageSquare {...iconProps} />}
      {normalizedType === 'kaiwa_bebas' && <MessageCircle {...iconProps} />}
      {normalizedType === 'drill' && <BookOpen {...iconProps} />}
    </div>
  );
}

function getActivityTitle(activity: Activity): string {
  const type = normalizeActivityType(activity.type);

  if (type === 'drill') {
    return activity.data.word || activity.data.deckName || 'Flashcard';
  }

  return activity.data.title || (type === 'roleplay' ? 'Roleplay' : 'Kaiwa Bebas');
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  const safeActivities = Array.isArray(activities) ? activities : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (safeActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{UI_TEXT.dashboard.recentActivity}</CardTitle>
          <CardDescription>{UI_TEXT.dashboard.recentActivityDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {UI_TEXT.dashboard.noActivity} {UI_TEXT.dashboard.startLearning}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{UI_TEXT.dashboard.recentActivity}</CardTitle>
        <CardDescription>{UI_TEXT.dashboard.recentActivityDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {safeActivities.map((activity, index) => {
            const timestamp =
              typeof activity.timestamp === 'string'
                ? new Date(activity.timestamp)
                : activity.timestamp;

            const isValidDate = timestamp instanceof Date && !isNaN(timestamp.getTime());

            return (
              <div
                key={index}
                className="flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ActivityIcon type={activity.type} />
                  <span className="text-sm font-medium truncate">{getActivityTitle(activity)}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {isValidDate ? formatRelativeTimeID(timestamp) : UI_TEXT.common.recently}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
