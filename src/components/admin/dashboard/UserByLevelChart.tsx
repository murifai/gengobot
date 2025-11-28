'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { JLPT_COLORS, JLPT_LEVEL_ORDER } from '@/lib/constants/chart-theme';

interface LevelData {
  level: string;
  count: number;
}

interface UserByLevelChartProps {
  data: LevelData[];
}

const chartConfig = {
  count: {
    label: 'Users',
  },
  N5: {
    label: 'N5',
    color: JLPT_COLORS.N5,
  },
  N4: {
    label: 'N4',
    color: JLPT_COLORS.N4,
  },
  N3: {
    label: 'N3',
    color: JLPT_COLORS.N3,
  },
  N2: {
    label: 'N2',
    color: JLPT_COLORS.N2,
  },
  N1: {
    label: 'N1',
    color: JLPT_COLORS.N1,
  },
} satisfies ChartConfig;

export function UserByLevelChart({ data }: UserByLevelChartProps) {
  // Sort data by JLPT level order
  const sortedData = [...data].sort((a, b) => {
    return (
      JLPT_LEVEL_ORDER.indexOf(a.level as (typeof JLPT_LEVEL_ORDER)[number]) -
      JLPT_LEVEL_ORDER.indexOf(b.level as (typeof JLPT_LEVEL_ORDER)[number])
    );
  });

  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by JLPT Level</CardTitle>
        <CardDescription>
          Distribution of {totalUsers.toLocaleString()} users by proficiency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="level" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={value => value.toLocaleString()}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} strokeWidth={2} stroke="hsl(var(--border))">
              {sortedData.map(entry => (
                <Cell
                  key={entry.level}
                  fill={
                    JLPT_COLORS[entry.level as keyof typeof JLPT_COLORS] || 'hsl(var(--primary))'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {sortedData.map(item => (
            <div key={item.level} className="text-center">
              <div
                className="mx-auto mb-1 h-3 w-3 rounded-base border-2 border-border"
                style={{
                  backgroundColor: JLPT_COLORS[item.level as keyof typeof JLPT_COLORS] || '#6b7280',
                }}
              />
              <p className="text-xs font-medium">{item.level}</p>
              <p className="text-sm font-bold">{item.count.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {totalUsers > 0 ? ((item.count / totalUsers) * 100).toFixed(0) : 0}%
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
