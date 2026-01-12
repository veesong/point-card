'use client';

import { useAppStore } from '@/store/appStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogItem } from './LogItem';
import { History } from 'lucide-react';

export function LogList() {
  const logs = useAppStore((state) => state.logs);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="h-5 w-5" />
        <h2 className="text-2xl font-bold">操作日志</h2>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">暂无操作记录</p>
          <p className="text-sm">添加积分后会在这里显示操作历史</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4 space-y-2">
            {logs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
