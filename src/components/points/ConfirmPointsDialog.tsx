'use client';

import { useState, useEffect } from 'react';
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

interface ConfirmPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
  defaultItemName: string;
  defaultPoints: number;
  operationType: OperationType;
}

export function ConfirmPointsDialog({
  open,
  onOpenChange,
  memberId,
  defaultItemName,
  defaultPoints,
  operationType,
}: ConfirmPointsDialogProps) {
  const [itemName, setItemName] = useState(defaultItemName);
  const [points, setPoints] = useState(defaultPoints.toString());
  const addPoints = useAppStore((state) => state.addPoints);
  const deductPoints = useAppStore((state) => state.deductPoints);
  const members = useAppStore((state) => state.members);

  const member = members.find((m) => m.id === memberId);

  // 重置表单状态
  useEffect(() => {
    setItemName(defaultItemName);
    setPoints(defaultPoints.toString());
  }, [defaultItemName, defaultPoints, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && itemName.trim() && points) {
      const pointsValue = parseInt(points, 10);
      if (pointsValue > 0) {
        if (operationType === 'add') {
          addPoints(member.id, itemName.trim(), pointsValue);
        } else {
          deductPoints(member.id, itemName.trim(), pointsValue);
        }
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{operationType === 'add' ? '确认加分' : '确认扣分'}</DialogTitle>
            <DialogDescription>
              确认要{operationType === 'add' ? '为' : '从'} {member?.name || '成员'} {operationType === 'add' ? '添加' : '扣除'} {points} 分吗？
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">项目名称</label>
              <Input
                placeholder="项目名称"
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
            <Button
              type="submit"
              variant={operationType === 'deduct' ? 'destructive' : 'default'}
              disabled={!itemName.trim() || !points || parseInt(points, 10) <= 0}
            >
              确认{operationType === 'add' ? '加分' : '扣分'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
