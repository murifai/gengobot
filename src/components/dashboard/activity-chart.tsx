'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

interface ChartData {
  dates: string[];
  data: number[];
  color: string;
  unit: string;
  label: string;
}

function MiniChart({ dates, data, color, unit, label }: ChartData) {
  const maxValue = useMemo(() => Math.max(...data, 0), [data]);

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="h-40 flex items-end justify-around gap-2">
        {data.map((value, index) => {
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const date = new Date(dates[index]);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-muted rounded-t-lg relative" style={{ height: '100%' }}>
                <div
                  className="absolute bottom-0 w-full rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${height}%`, backgroundColor: color }}
                  title={`${value} ${unit}`}
                />
              </div>
              <span className="text-xs text-muted-foreground">{dayName}</span>
              <span className="text-xs font-medium">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ActivityChartProps {
  dates: string[];
  kaiwaMinutes: number[];
  cardsLearned: number[];
  isLoading?: boolean;
}

export function ActivityChart({
  dates,
  kaiwaMinutes,
  cardsLearned,
  isLoading,
}: ActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="h-48 flex items-end justify-around gap-2">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-full w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Your learning activity over the past 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MiniChart
            dates={dates}
            data={kaiwaMinutes}
            color="hsl(var(--primary))"
            unit="minutes"
            label="Kaiwa Minutes"
          />
          <MiniChart
            dates={dates}
            data={cardsLearned}
            color="hsl(217, 91%, 60%)"
            unit="cards"
            label="Cards Reviewed"
          />
        </div>
      </CardContent>
    </Card>
  );
}
