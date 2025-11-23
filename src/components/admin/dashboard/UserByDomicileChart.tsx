'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DomicileData {
  domicile: string;
  count: number;
}

interface UserByDomicileChartProps {
  data: DomicileData[];
}

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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => value.toLocaleString()}
              />
              <YAxis
                type="category"
                dataKey="displayName"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Users']}
                labelFormatter={label => {
                  const item = formattedData.find(d => d.displayName === label);
                  return item ? item.domicile : label;
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
