'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';

interface DailyUsage {
  date: string;
  displayDate: string;
  kaiwa: number;
  drill: number;
  total: number;
}

interface CreditUsageChartProps {
  className?: string;
  days?: number;
}

export function CreditUsageChart({ className, days = 30 }: CreditUsageChartProps) {
  const [data, setData] = useState<DailyUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/subscription/usage-chart?days=${days}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch usage data');
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [days]);

  if (isLoading) {
    return (
      <div className={`h-[250px] flex items-center justify-center ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-[250px] flex items-center justify-center ${className}`}>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`h-[250px] flex items-center justify-center ${className}`}>
        <p className="text-sm text-muted-foreground">Belum ada data penggunaan</p>
      </div>
    );
  }

  // Calculate totals for the legend
  const totalKaiwa = data.reduce((sum, d) => sum + d.kaiwa, 0);
  const totalDrill = data.reduce((sum, d) => sum + d.drill, 0);

  return (
    <div className={className}>
      {/* Summary stats */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#ff5e75]" />
          <span className="text-muted-foreground">Kaiwa:</span>
          <span className="font-medium">{totalKaiwa.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#1dcddc]" />
          <span className="text-muted-foreground">Drill:</span>
          <span className="font-medium">{totalDrill.toLocaleString()}</span>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '2px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '4px 4px 0px hsl(var(--border))',
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString() + ' kredit AI',
                name === 'kaiwa' ? 'Kaiwa' : 'Drill',
              ]}
              labelFormatter={label => `Tanggal: ${label}`}
            />
            <Bar
              dataKey="kaiwa"
              name="Kaiwa"
              fill="#ff5e75"
              stackId="usage"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="drill"
              name="Drill"
              fill="#1dcddc"
              stackId="usage"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
