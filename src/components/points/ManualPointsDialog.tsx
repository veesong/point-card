'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';

type OperationType = 'add' | 'deduct';

interface ManualPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
  operationType: OperationType;
}

export function ManualPointsDialog({
  open,
  onOpenChange,
  memberId,
  operationType,
}: ManualPointsDialogProps) {
  const [itemName, setItemName] = useState('');
  const [points, setPoints] = useState('10');
  const addPoints = useAppStore((state) => state.addPoints);
  const deductPoints = useAppStore((state) => state.deductPoints);
  const members = useAppStore((state) => state.members);

  const member = members.find((m) => m.id === memberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && itemName.trim() && points) {
      const pointsValue = parseInt(points, 10);
      if (operationType === 'add') {
        addPoints(member.id, itemName.trim(), pointsValue);
      } else {
        deductPoints(member.id, itemName.trim(), pointsValue);
      }
      onOpenChange(false);
      setItemName('');
      setPoints('10');
    }
  };

  const title = operationType === 'add' ? '添加积分' : '扣除积分';

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={`${memberId}-${operationType}`}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              为 {member?.name || '成员'} {operationType === 'add' ? '添加' : '扣除'}积分
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">项目名称</label>
              <Input
                placeholder="如：完成作业、做家务"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium">分数</label>
              <Input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={!itemName.trim() || !points}>
              确认{title}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
