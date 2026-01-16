import type { PointLog } from '@/types';
import { getCurrentWeekRange, getDateKey, getDayOfWeek } from './utils';

export interface ItemStatistics {
  itemName: string;
  count: number;
  totalPoints: number;
}

export interface DailyStatistics {
  date: string;
  dayOfWeek: string;
  addPoints: number;
  deductPoints: number;
}

// 过滤当前周日志
export function filterCurrentWeekLogs(logs: PointLog[], memberId: string): PointLog[] {
  const { start, end } = getCurrentWeekRange();

  return logs.filter((log) => {
    if (log.memberId !== memberId) return false;
    if (log.isUndone) return false;
    if (log.operationType === 'undo') return false;
    return log.timestamp >= start && log.timestamp <= end;
  });
}

// 转换为饼图数据
export function transformToPieChartData(logs: PointLog[]): ItemStatistics[] {
  const itemMap = new Map<string, { count: number; totalPoints: number }>();

  logs.forEach((log) => {
    const existing = itemMap.get(log.itemName) || { count: 0, totalPoints: 0 };
    itemMap.set(log.itemName, {
      count: existing.count + 1,
      totalPoints: existing.totalPoints + log.points,
    });
  });

  return Array.from(itemMap.entries())
    .map(([itemName, data]) => ({ itemName, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

// 转换为加分项饼图数据
export function transformToAddPieChartData(logs: PointLog[]): ItemStatistics[] {
  const addLogs = logs.filter((log) => log.operationType === 'add');
  return transformToPieChartData(addLogs);
}

// 转换为扣分项饼图数据（使用绝对值）
export function transformToDeductPieChartData(logs: PointLog[]): ItemStatistics[] {
  const deductLogs = logs.filter((log) => log.operationType === 'deduct');
  const itemMap = new Map<string, { count: number; totalPoints: number }>();

  deductLogs.forEach((log) => {
    const existing = itemMap.get(log.itemName) || { count: 0, totalPoints: 0 };
    itemMap.set(log.itemName, {
      count: existing.count + 1,
      totalPoints: existing.totalPoints + Math.abs(log.points),
    });
  });

  return Array.from(itemMap.entries())
    .map(([itemName, data]) => ({ itemName, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

// 转换为柱状图数据
export function transformToBarChartData(logs: PointLog[]): DailyStatistics[] {
  const { start, end } = getCurrentWeekRange();
  const dayMap = new Map<string, { addPoints: number; deductPoints: number }>();

  // 初始化本周所有天数为零
  const oneDay = 24 * 60 * 60 * 1000;
  for (let time = start; time <= end; time += oneDay) {
    const dateKey = getDateKey(time);
    dayMap.set(dateKey, { addPoints: 0, deductPoints: 0 });
  }

  // 按日期和操作类型聚合积分
  logs.forEach((log) => {
    const dateKey = getDateKey(log.timestamp);
    const existing = dayMap.get(dateKey) || { addPoints: 0, deductPoints: 0 };

    if (log.operationType === 'add') {
      existing.addPoints += log.points;
    } else if (log.operationType === 'deduct') {
      existing.deductPoints += Math.abs(log.points);
    }

    dayMap.set(dateKey, existing);
  });

  return Array.from(dayMap.entries())
    .map(([date, data]) => ({
      date,
      dayOfWeek: getDayOfWeek(new Date(date).getTime()),
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
