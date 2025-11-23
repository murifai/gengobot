'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SubscriberChartProps {
  byTier: {
    FREE: number;
    BASIC: number;
    PRO: number;
  };
  total: number;
  paid: number;
}

const COLORS = {
  FREE: '#94a3b8', // slate-400
  BASIC: '#3b82f6', // blue-500
  PRO: '#8b5cf6', // violet-500
};

const TIER_LABELS = {
  FREE: 'Free',
  BASIC: 'Basic',
  PRO: 'Pro',
};

export function SubscriberChart({ byTier, total, paid }: SubscriberChartProps) {
  const data = Object.entries(byTier).map(([tier, count]) => ({
    name: TIER_LABELS[tier as keyof typeof TIER_LABELS],
    value: count,
    tier,
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
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map(entry => (
                  <Cell key={entry.tier} fill={COLORS[entry.tier as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Users']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {Object.entries(byTier).map(([tier, count]) => (
            <div key={tier} className="space-y-1">
              <div
                className="h-2 w-full rounded"
                style={{ backgroundColor: COLORS[tier as keyof typeof COLORS] }}
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
