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

interface ConfirmPointsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string | null;
  defaultItemName: string;
  defaultPoints: number;
}

export function ConfirmPointsDialog({
  open,
  onOpenChange,
  memberId,
  defaultItemName,
  defaultPoints,
}: ConfirmPointsDialogProps) {
  const [itemName, setItemName] = useState('');
  const [points, setPoints] = useState('0');
  const addPoints = useAppStore((state) => state.addPoints);
  const members = useAppStore((state) => state.members);

  const member = members.find((m) => m.id === memberId);

  useEffect(() => {
    if (open) {
      setItemName(defaultItemName);
      setPoints(defaultPoints.toString());
    }
  }, [open, defaultItemName, defaultPoints]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && itemName.trim() && points) {
      const pointsValue = parseInt(points, 10);
      if (pointsValue > 0) {
        addPoints(member.id, itemName.trim(), pointsValue);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>确认积分操作</DialogTitle>
            <DialogDescription>确认要为 {member?.name || '成员'} 添加积分吗？</DialogDescription>
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
            <Button type="submit" disabled={!itemName.trim() || !points || parseInt(points, 10) <= 0}>
              确认添加
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
