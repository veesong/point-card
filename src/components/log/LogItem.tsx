'use client';

import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { formatDateTime, getOperationTypeText, getOperationTypeColor } from '@/lib/utils';
import { Undo2 } from 'lucide-react';
import type { PointLog } from '@/types';

interface LogItemProps {
  log: PointLog;
}

export function LogItem({ log }: LogItemProps) {
  const canUndoLog = useAppStore((state) => state.canUndoLog);
  const undoLog = useAppStore((state) => state.undoLog);

  const canUndo = canUndoLog(log.id);

  const handleUndo = () => {
    undoLog(log.id);
  };

  return (
    <div
      className={`flex items-start justify-between gap-4 p-3 rounded-lg border ${
        log.isUndone
          ? 'bg-muted/50 opacity-60'
          : 'bg-card'
      }`}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{log.memberName}</span>
          <span className={getOperationTypeColor(log.operationType)}>
            {getOperationTypeText(log.operationType)}
          </span>
          {log.operationType !== 'undo' && (
            <span className={`font-semibold ${log.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {log.points > 0 ? '+' : ''}{log.points}分
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {log.itemName}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDateTime(log.timestamp)}
        </div>
      </div>

      {canUndo && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          className="shrink-0"
        >
          <Undo2 className="h-4 w-4 mr-1" />
          撤销
        </Button>
      )}

      {log.isUndone && (
        <div className="text-xs text-muted-foreground shrink-0">
          已撤销
        </div>
      )}
    </div>
  );
}
