'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, BookOpen, Clock } from 'lucide-react';

interface Activity {
  type: 'task_complete' | 'cards_learned';
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

// Simple relative time formatter without external dependencies
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
}

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  // Safety check for activities prop
  const safeActivities = Array.isArray(activities) ? activities : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
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
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No recent activity. Start learning to see your progress here!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest learning activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safeActivities.map((activity, index) => {
            const timestamp =
              typeof activity.timestamp === 'string'
                ? new Date(activity.timestamp)
                : activity.timestamp;

            // Validate timestamp is a valid Date
            const isValidDate = timestamp instanceof Date && !isNaN(timestamp.getTime());

            return (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === 'task_complete' ? 'bg-green-100' : 'bg-blue-100'
                  }`}
                >
                  {activity.type === 'task_complete' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {activity.type === 'task_complete' ? (
                    <>
                      <p className="text-sm font-medium truncate">
                        Completed: {activity.data.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.data.jlptLevel}
                        {activity.data.score !== null && activity.data.score !== undefined
                          ? ` • Score: ${activity.data.score}%`
                          : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">Reviewed: {activity.data.word}</p>
                      <p className="text-xs text-muted-foreground">{activity.data.deckName}</p>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {isValidDate ? formatRelativeTime(timestamp) : 'Recently'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
