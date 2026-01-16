'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ItemStatistics } from '@/lib/statistics';
import { getColor } from '@/lib/chartColors';

interface PieChartSectionProps {
  addData: ItemStatistics[];
  deductData: ItemStatistics[];
}

interface SinglePieChartProps {
  data: ItemStatistics[];
  title: string;
  emptyMessage: string;
  startIndex: number; // 用于确定颜色起始位置
}

function SinglePieChart({ data, title, emptyMessage, startIndex }: SinglePieChartProps) {
  const chartData = useMemo(
    () => data.map((item) => ({
      name: item.itemName,
      value: item.totalPoints,
      count: item.count,
    })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(entry) => `${entry.name}: ${entry.value}分`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(startIndex + index)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined, props?: { payload?: { count?: number } }) => [
              `${value || 0}分 (${props?.payload?.count || 0}次)`,
              name || '',
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* 详细统计表格 */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">项目名称</th>
              <th className="p-2 text-right">次数</th>
              <th className="p-2 text-right">总积分</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.itemName} className="border-b last:border-0">
                <td className="p-2">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getColor(startIndex + index) }} />
                  {item.itemName}
                </td>
                <td className="p-2 text-right">{item.count}</td>
                <td className="p-2 text-right font-semibold">+{item.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PieChartSection({ addData, deductData }: PieChartSectionProps) {
  const hasAddData = addData.length > 0;
  const hasDeductData = deductData.length > 0;

  if (!hasAddData && !hasDeductData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">本周暂无数据</p>
        <p className="text-sm">添加积分后会在这里显示统计信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 加分项饼图 */}
      <SinglePieChart
        data={addData}
        title="加分项统计"
        emptyMessage="本周暂无加分记录"
        startIndex={0}
      />

      {/* 扣分项饼图 */}
      <SinglePieChart
        data={deductData}
        title="扣分项统计"
        emptyMessage="本周暂无扣分记录"
        startIndex={addData.length} // 从加分项之后开始
      />
    </div>
  );
}
