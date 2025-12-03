'use client';

import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/Card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Kaiwa chart config (roleplay + free chat)
const kaiwaChartConfig = {
  roleplay: {
    label: 'Roleplay',
    color: '#f2727d', // pink/salmon
  },
  freeChat: {
    label: 'Kaiwa Bebas',
    color: '#73cfd9', // cyan
  },
} satisfies ChartConfig;

// Drill chart config with different card types
const drillChartConfig = {
  kanji: {
    label: 'Kanji',
    color: '#f2eda0', // yellow
  },
  vocabulary: {
    label: 'Kosakata',
    color: '#98D8AA', // green
  },
  grammar: {
    label: 'Bunpo',
    color: '#73cfd9', // cyan
  },
} satisfies ChartConfig;

interface KaiwaChartData {
  date: string;
  roleplay: number;
  freeChat: number;
}

interface DrillChartData {
  date: string;
  kanji: number;
  vocabulary: number;
  grammar: number;
}

interface ActivityChartProps {
  dates: string[];
  roleplayMinutes: number[];
  freeChatMinutes: number[];
  cardsLearned: number[];
  isLoading?: boolean;
  kaiwaMinutes?: number[];
  // Card type breakdown
  kanjiCards?: number[];
  vocabularyCards?: number[];
  grammarCards?: number[];
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="grid gap-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full rounded-base" />
      </CardContent>
    </Card>
  );
}

// Filter data based on time range
function filterDataByRange<T extends { date: string }>(data: T[], timeRange: string): T[] {
  if (data.length === 0) return data;

  const now = new Date();
  let daysToSubtract = 7;
  if (timeRange === '30d') {
    daysToSubtract = 30;
  } else if (timeRange === '90d') {
    daysToSubtract = 90;
  }

  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToSubtract);

  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate;
  });
}

// Kaiwa Chart Component
function KaiwaChart({ data }: { data: KaiwaChartData[] }) {
  const [timeRange, setTimeRange] = React.useState('7d');
  const filteredData = filterDataByRange(data, timeRange);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Latihan Percakapan</CardTitle>
          </div>
          <CardAction>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                aria-label="Pilih rentang waktu"
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <SelectValue placeholder="7 hari" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 hari</SelectItem>
                <SelectItem value="30d">30 hari</SelectItem>
                <SelectItem value="90d">3 bulan</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={kaiwaChartConfig} className="aspect-auto h-[200px] w-full">
          <AreaChart data={filteredData} margin={{ left: -20, right: 12 }}>
            <CartesianGrid vertical={false} className="stroke-border" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="text-xs"
              tickFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              tickFormatter={value => `${value}m`}
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--border)', strokeWidth: 2 }}
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="freeChat"
              type="natural"
              fill="var(--color-freeChat)"
              stroke="var(--border)"
              strokeWidth={2}
            />
            <Area
              dataKey="roleplay"
              type="natural"
              fill="var(--color-roleplay)"
              stroke="var(--border)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Drill Chart Component
function DrillChart({ data }: { data: DrillChartData[] }) {
  const [timeRange, setTimeRange] = React.useState('7d');
  const filteredData = filterDataByRange(data, timeRange);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Drill flashcard</CardTitle>
          </div>
          <CardAction>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                aria-label="Pilih rentang waktu"
                className="focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <SelectValue placeholder="7 hari" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 hari</SelectItem>
                <SelectItem value="30d">30 hari</SelectItem>
                <SelectItem value="90d">3 bulan</SelectItem>
              </SelectContent>
            </Select>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={drillChartConfig} className="aspect-auto h-[200px] w-full">
          <AreaChart data={filteredData} margin={{ left: -20, right: 12 }}>
            <CartesianGrid vertical={false} className="stroke-border" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="text-xs"
              tickFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                });
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <ChartTooltip
              cursor={{ stroke: 'var(--border)', strokeWidth: 2 }}
              content={
                <ChartTooltipContent
                  labelFormatter={value => {
                    return new Date(value).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="kanji"
              type="natural"
              fill="var(--color-kanji)"
              stroke="var(--border)"
              strokeWidth={2}
              stackId="cards"
            />
            <Area
              dataKey="vocabulary"
              type="natural"
              fill="var(--color-vocabulary)"
              stroke="var(--border)"
              strokeWidth={2}
              stackId="cards"
            />
            <Area
              dataKey="grammar"
              type="natural"
              fill="var(--color-grammar)"
              stroke="var(--border)"
              strokeWidth={2}
              stackId="cards"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ActivityChart({
  dates,
  roleplayMinutes,
  freeChatMinutes,
  cardsLearned,
  isLoading,
  kaiwaMinutes,
  kanjiCards,
  vocabularyCards,
  grammarCards,
}: ActivityChartProps) {
  // Prepare kaiwa data
  const kaiwaData: KaiwaChartData[] = React.useMemo(() => {
    const roleplay = roleplayMinutes.length > 0 ? roleplayMinutes : kaiwaMinutes || [];
    const freeChat = freeChatMinutes.length > 0 ? freeChatMinutes : [];

    return dates.map((date, index) => ({
      date,
      roleplay: roleplay[index] || 0,
      freeChat: freeChat[index] || 0,
    }));
  }, [dates, roleplayMinutes, freeChatMinutes, kaiwaMinutes]);

  // Prepare drill data with card type breakdown
  const drillData: DrillChartData[] = React.useMemo(() => {
    // If we have card type breakdown, use it; otherwise fallback to total
    const hasBreakdown = kanjiCards && vocabularyCards && grammarCards;

    return dates.map((date, index) => ({
      date,
      kanji: hasBreakdown ? kanjiCards[index] || 0 : 0,
      vocabulary: hasBreakdown ? vocabularyCards[index] || 0 : cardsLearned[index] || 0,
      grammar: hasBreakdown ? grammarCards[index] || 0 : 0,
    }));
  }, [dates, cardsLearned, kanjiCards, vocabularyCards, grammarCards]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <KaiwaChart data={kaiwaData} />
      <DrillChart data={drillData} />
    </div>
  );
}
