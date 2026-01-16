'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DailyStatistics } from '@/lib/statistics';
import { BAR_CHART_COLORS } from '@/lib/chartColors';

interface BarChartSectionProps {
  data: DailyStatistics[];
}

export function BarChartSection({ data }: BarChartSectionProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">本周暂无数据</p>
        <p className="text-sm">添加积分后会在这里显示每日统计</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="dayOfWeek"
          className="text-sm"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis
          className="text-sm"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => [
            `${value || 0}分`,
            name === 'addPoints' ? '加分' : '扣分',
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
          }}
        />
        <Legend
          formatter={(value: string) =>
            value === 'addPoints' ? '加分' : '扣分'
          }
        />
        <Bar
          dataKey="addPoints"
          fill={BAR_CHART_COLORS.add}
          name="加分"
        />
        <Bar
          dataKey="deductPoints"
          fill={BAR_CHART_COLORS.deduct}
          name="扣分"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
