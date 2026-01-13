'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogItem } from './LogItem';
import { History } from 'lucide-react';
import type { Member } from '@/types';

interface MemberLogDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberLogDialog({ member, open, onOpenChange }: MemberLogDialogProps) {
  // 获取所有日志，然后用 useMemo 过滤
  const allLogs = useAppStore((state) => state.logs);

  // 使用 useMemo 缓存过滤结果
  const logs = useMemo(
    () => allLogs.filter((log) => log.memberId === member?.id),
    [allLogs, member?.id]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <DialogTitle>{member?.name} 的操作日志</DialogTitle>
          </div>
          <DialogDescription>查看该成员的所有积分操作记录</DialogDescription>
        </DialogHeader>

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

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
