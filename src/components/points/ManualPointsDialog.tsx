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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { QuickPointItem } from '@/types';

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
  const [pendingQuickItem, setPendingQuickItem] = useState<{
    name: string;
    points: number;
    operationType: 'add' | 'deduct';
  } | null>(null);
  const addPoints = useAppStore((state) => state.addPoints);
  const deductPoints = useAppStore((state) => state.deductPoints);
  const addQuickItem = useAppStore((state) => state.addQuickItem);
  const members = useAppStore((state) => state.members);

  const member = members.find((m) => m.id === memberId);

  // 根据操作类型过滤快捷项
  const filteredQuickItems = member?.quickItems.filter((item) => {
    if (operationType === 'add') {
      return !item.operationType || item.operationType === 'add';
    } else {
      return item.operationType === 'deduct';
    }
  }) || [];

  const handleQuickItemSelect = (item: QuickPointItem) => {
    setItemName(item.name);
    setPoints(item.points.toString());
  };

  const resetForm = () => {
    setItemName('');
    setPoints('10');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (member && itemName.trim() && points) {
      const pointsValue = parseInt(points, 10);
      const trimmedItemName = itemName.trim();

      // 执行积分操作
      if (operationType === 'add') {
        addPoints(member.id, trimmedItemName, pointsValue);
      } else {
        deductPoints(member.id, trimmedItemName, pointsValue);
      }

      // 检查是否应该添加到快捷项
      const itemExists = member.quickItems.some(
        (item) => item.name === trimmedItemName
      );

      if (!itemExists) {
        // 先不关闭对话框 - 显示提示
        setPendingQuickItem({
          name: trimmedItemName,
          points: pointsValue,
          operationType,
        });
      } else {
        // 立即关闭对话框
        onOpenChange(false);
        resetForm();
      }
    }
  };

  const title = operationType === 'add' ? '添加积分' : '扣除积分';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} key={`${memberId}-${operationType}`}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                为 {member?.name || '成员'} {operationType === 'add' ? '添加' : '扣除'}积分
              </DialogDescription>
            </DialogHeader>

            {/* 快捷操作区域 */}
            {filteredQuickItems.length > 0 ? (
              <div className="space-y-2 pb-4">
                <div className="text-sm text-muted-foreground">快捷操作</div>
                <div className="flex flex-wrap gap-2">
                  {filteredQuickItems.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickItemSelect(item)}
                      className="text-sm"
                    >
                      {item.name} {operationType === 'deduct' ? '-' : '+'}{item.points}
                    </Button>
                  ))}
                </div>
              </div>
            ) : member?.quickItems && member.quickItems.length > 0 ? (
              <div className="text-sm text-muted-foreground pb-4">
                该操作类型暂无快捷项
              </div>
            ) : null}

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

      {/* 添加快捷项提示 AlertDialog */}
      {pendingQuickItem && (
        <AlertDialog
          open={!!pendingQuickItem}
          onOpenChange={() => {
            if (pendingQuickItem) {
              onOpenChange(false);
              setPendingQuickItem(null);
              resetForm();
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>添加为快捷操作？</AlertDialogTitle>
              <AlertDialogDescription>
                要将 "{pendingQuickItem.name}" ({pendingQuickItem.operationType === 'add' ? '+' : '-'}
                {pendingQuickItem.points}分) 添加为快捷操作吗？下次操作时可以直接选择。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  onOpenChange(false);
                  setPendingQuickItem(null);
                  resetForm();
                }}
              >
                不需要
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (member) {
                    addQuickItem(
                      member.id,
                      pendingQuickItem.name,
                      pendingQuickItem.points,
                      pendingQuickItem.operationType
                    );
                  }
                  onOpenChange(false);
                  setPendingQuickItem(null);
                  resetForm();
                }}
              >
                添加
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
