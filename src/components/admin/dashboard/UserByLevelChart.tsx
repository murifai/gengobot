'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LevelData {
  level: string;
  count: number;
}

interface UserByLevelChartProps {
  data: LevelData[];
}

const LEVEL_COLORS: Record<string, string> = {
  N5: '#22c55e', // green-500
  N4: '#84cc16', // lime-500
  N3: '#eab308', // yellow-500
  N2: '#f97316', // orange-500
  N1: '#ef4444', // red-500
};

const LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

export function UserByLevelChart({ data }: UserByLevelChartProps) {
  // Sort data by JLPT level order
  const sortedData = [...data].sort((a, b) => {
    return LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
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
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="level" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => value.toLocaleString()}
              />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), 'Users']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {sortedData.map(item => (
            <div key={item.level} className="text-center">
              <div
                className="mx-auto mb-1 h-3 w-3 rounded-full"
                style={{ backgroundColor: LEVEL_COLORS[item.level] || '#6b7280' }}
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
