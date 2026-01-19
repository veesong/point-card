/**
 * 同步状态指示器组件
 */

import { Cloud, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { SyncStatus } from '@/types';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  lastSyncTime?: number;
  error?: string;
}

export function SyncStatusIndicator({ status, lastSyncTime, error }: SyncStatusIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'syncing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'conflict':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Cloud className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return '正在同步...';
      case 'success':
        return lastSyncTime ? `已同步于 ${formatSyncTime(lastSyncTime)}` : '同步成功';
      case 'error':
        return error ? `同步失败: ${error}` : '同步失败';
      case 'conflict':
        return error || '检测到版本冲突';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      {getStatusIcon()}
      {getStatusText() && <span className="text-muted-foreground">{getStatusText()}</span>}
    </div>
  );
}

/**
 * 格式化同步时间
 */
function formatSyncTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes} 分钟前`;
  } else if (hours < 24) {
    return `${hours} 小时前`;
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN');
  }
}
