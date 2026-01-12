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
