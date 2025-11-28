'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { TIER_COLORS, TIER_LABELS } from '@/lib/constants/chart-theme';

interface SubscriberChartProps {
  byTier: {
    FREE: number;
    BASIC: number;
    PRO: number;
  };
  total: number;
  paid: number;
}

const chartConfig = {
  users: {
    label: 'Users',
  },
  FREE: {
    label: TIER_LABELS.FREE,
    color: TIER_COLORS.FREE,
  },
  BASIC: {
    label: TIER_LABELS.BASIC,
    color: TIER_COLORS.BASIC,
  },
  PRO: {
    label: TIER_LABELS.PRO,
    color: TIER_COLORS.PRO,
  },
} satisfies ChartConfig;

export function SubscriberChart({ byTier, total, paid }: SubscriberChartProps) {
  const data = Object.entries(byTier).map(([tier, count]) => ({
    name: TIER_LABELS[tier as keyof typeof TIER_LABELS],
    value: count,
    tier,
    fill: TIER_COLORS[tier as keyof typeof TIER_COLORS],
  }));

  const paidPercentage = total > 0 ? ((paid / total) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscribers by Tier</CardTitle>
        <CardDescription>
          {paid} paid subscribers ({paidPercentage}% conversion)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={2}
              stroke="hsl(var(--border))"
            >
              {data.map(entry => (
                <Cell key={entry.tier} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {Object.entries(byTier).map(([tier, count]) => (
            <div key={tier} className="space-y-1">
              <div
                className="h-2 w-full rounded-base border-2 border-border"
                style={{ backgroundColor: TIER_COLORS[tier as keyof typeof TIER_COLORS] }}
              />
              <p className="text-xs font-medium">{TIER_LABELS[tier as keyof typeof TIER_LABELS]}</p>
              <p className="text-lg font-bold">{count.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
