'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ItemStatistics } from '@/lib/statistics';
import { getColor } from '@/lib/chartColors';

interface PieChartSectionProps {
  addScoreData: ItemStatistics[];
  addCountData: ItemStatistics[];
  deductScoreData: ItemStatistics[];
  deductCountData: ItemStatistics[];
}

type ChartType = 'score' | 'count';

interface SinglePieChartProps {
  data: ItemStatistics[];
  title: string;
  emptyMessage: string;
  startIndex: number; // 用于确定颜色起始位置
  chartType: ChartType;
}

function SinglePieChart({ data, title, emptyMessage, startIndex, chartType }: SinglePieChartProps) {
  const chartData = useMemo(
    () => data.map((item) => ({
      name: item.itemName,
      value: chartType === 'score' ? item.totalPoints : item.count,
      count: item.count,
      totalPoints: item.totalPoints,
    })),
    [data, chartType]
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
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(startIndex + index)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined, props?: { payload?: { count?: number; totalPoints?: number } }) => [
              chartType === 'score'
                ? `${value || 0}分 (${props?.payload?.count || 0}次)`
                : `${value || 0}次 (${props?.payload?.totalPoints || 0}分)`,
              name || '',
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SummaryTableProps {
  addData: ItemStatistics[];
  deductData: ItemStatistics[];
  addStartIndex: number;
  deductStartIndex: number;
}

function SummaryTable({ addData, deductData, addStartIndex, deductStartIndex }: SummaryTableProps) {
  if (addData.length === 0 && deductData.length === 0) {
    return null;
  }

  return (
    <div className="md:col-span-2 border rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">项目名称</th>
            <th className="p-2 text-right">次数</th>
            <th className="p-2 text-right">总积分</th>
          </tr>
        </thead>
        <tbody>
          {/* 加分项 */}
          {addData.map((item, index) => (
            <tr key={`add-${item.itemName}`} className="border-b last:border-0">
              <td className="p-2">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getColor(addStartIndex + index) }} />
                {item.itemName}
              </td>
              <td className="p-2 text-right">{item.count}</td>
              <td className="p-2 text-right font-semibold text-green-600">+{item.totalPoints}</td>
            </tr>
          ))}
          {/* 扣分项 */}
          {deductData.map((item, index) => (
            <tr key={`deduct-${item.itemName}`} className="border-b last:border-0">
              <td className="p-2">
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getColor(deductStartIndex + index) }} />
                {item.itemName}
              </td>
              <td className="p-2 text-right">{item.count}</td>
              <td className="p-2 text-right font-semibold text-red-600">-{item.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PieChartSection({ addScoreData, addCountData, deductScoreData, deductCountData }: PieChartSectionProps) {
  const hasAddData = addScoreData.length > 0 || addCountData.length > 0;
  const hasDeductData = deductScoreData.length > 0 || deductCountData.length > 0;

  if (!hasAddData && !hasDeductData) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg mb-2">本周暂无数据</p>
        <p className="text-sm">添加积分后会在这里显示统计信息</p>
      </div>
    );
  }

  // 计算颜色起始位置（使用按分数排序的数据来确定颜色）
  const addScoreLength = addScoreData.length;
  const addCountLength = addCountData.length;

  const addStartIndex = 0;
  const deductStartIndex = Math.max(addScoreLength, addCountLength);

  return (
    <div className="space-y-6">
      {/* 饼状图区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 加分项 - 按分数 */}
        <SinglePieChart
          data={addScoreData}
          title="加分项统计（按分数）"
          emptyMessage="本周暂无加分记录"
          startIndex={addStartIndex}
          chartType="score"
        />

        {/* 加分项 - 按次数 */}
        <SinglePieChart
          data={addCountData}
          title="加分项统计（按次数）"
          emptyMessage="本周暂无加分记录"
          startIndex={addStartIndex}
          chartType="count"
        />

        {/* 扣分项 - 按分数 */}
        <SinglePieChart
          data={deductScoreData}
          title="扣分项统计（按分数）"
          emptyMessage="本周暂无扣分记录"
          startIndex={deductStartIndex}
          chartType="score"
        />

        {/* 扣分项 - 按次数 */}
        <SinglePieChart
          data={deductCountData}
          title="扣分项统计（按次数）"
          emptyMessage="本周暂无扣分记录"
          startIndex={deductStartIndex}
          chartType="count"
        />
      </div>

      {/* 详细统计表格 */}
      <SummaryTable
        addData={addScoreData}
        deductData={deductScoreData}
        addStartIndex={addStartIndex}
        deductStartIndex={deductStartIndex}
      />
    </div>
  );
}
