'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, UserPlus, Activity } from 'lucide-react';

interface ActiveUsersCardProps {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export function ActiveUsersCard({
  totalUsers,
  activeUsers,
  newUsersThisMonth,
}: ActiveUsersCardProps) {
  const activePercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Users Overview</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Total registered users</p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-tertiary-green" />
              <span className="text-sm">Active (30d)</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{activeUsers.toLocaleString()}</span>
              <span className="ml-1 text-xs text-muted-foreground">({activePercentage}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <span className="text-sm">New this month</span>
            </div>
            <span className="font-medium">{newUsersThisMonth.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Activity rate</span>
            <span>{activePercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-base bg-secondary-background border-2 border-border overflow-hidden">
            <div
              className="h-full bg-tertiary-green transition-all"
              style={{ width: `${Math.min(parseFloat(activePercentage), 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
