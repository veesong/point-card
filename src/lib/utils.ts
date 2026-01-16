import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化日期时间为中文格式
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

// 获取操作类型显示文本
export function getOperationTypeText(type: string): string {
  const map: Record<string, string> = {
    add: '加分',
    deduct: '扣分',
    undo: '撤销',
  };
  return map[type] || type;
}

// 获取操作类型颜色类
export function getOperationTypeColor(type: string): string {
  const map: Record<string, string> = {
    add: 'text-green-600 dark:text-green-400',
    deduct: 'text-red-600 dark:text-red-400',
    undo: 'text-amber-600 dark:text-amber-400',
  };
  return map[type] || 'text-foreground';
}

// 获取当前自然周的时间范围（周一 00:00:00 到周日 23:59:59）
export function getCurrentWeekRange(): { start: number; end: number } {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // 计算本周一
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // 计算本周日
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.getTime(),
    end: sunday.getTime(),
  };
}

// 获取星期几显示文本
export function getDayOfWeek(timestamp: number): string {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[new Date(timestamp).getDay()];
}

// 获取日期键值（用于分组）
export function getDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
