'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface DomicileData {
  domicile: string;
  count: number;
}

interface UserByDomicileChartProps {
  data: DomicileData[];
}

const chartConfig = {
  count: {
    label: 'Users',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function UserByDomicileChart({ data }: UserByDomicileChartProps) {
  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);

  // Truncate long domicile names for display
  const formattedData = data.map(item => ({
    ...item,
    displayName: item.domicile.length > 15 ? item.domicile.substring(0, 12) + '...' : item.domicile,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users by Domicile</CardTitle>
        <CardDescription>
          Top 10 locations ({totalUsers.toLocaleString()} users with location data)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={formattedData}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={value => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              tickLine={false}
              axisLine={false}
              width={100}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? item.domicile : '';
                  }}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 4, 4, 0]}
              strokeWidth={2}
              stroke="hsl(var(--border))"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
