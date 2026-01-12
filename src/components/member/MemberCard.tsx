'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EditMemberDialog } from './EditMemberDialog';
import { QuickItemsManager } from './QuickItemsManager';
import { ManualPointsDialog } from '@/components/points/ManualPointsDialog';
import { ConfirmPointsDialog } from '@/components/points/ConfirmPointsDialog';
import { Plus, Minus, Settings, Trash2, Edit2 } from 'lucide-react';
import type { Member } from '@/types';

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [quickManagerOpen, setQuickManagerOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [operationType, setOperationType] = useState<'add' | 'deduct'>('add');
  const [selectedQuickItem, setSelectedQuickItem] = useState<{ name: string; points: number; id: string } | null>(null);

  const deleteMember = useAppStore((state) => state.deleteMember);

  const handleManualPoints = (type: 'add' | 'deduct') => {
    setOperationType(type);
    setManualDialogOpen(true);
  };

  const handleQuickItem = (name: string, points: number) => {
    setSelectedQuickItem({ name, points, id: crypto.randomUUID() });
    setConfirmDialogOpen(true);
  };

  return (
    <>
      <Card className="relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">{member.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuickManagerOpen(true)}
              title="管理快捷项"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              title="编辑成员"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" title="删除成员">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除成员 &ldquo;{member.name}&rdquo; 吗？删除后成员的积分记录将保留，但无法再为该成员添加积分。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMember(member.id)}>
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-center py-4">
            {member.totalPoints >= 0 ? '+' : ''}
            {member.totalPoints} 分
          </div>

          {/* 快捷积分项 */}
          {member.quickItems && member.quickItems.length > 0 && (
            <div className="space-y-2 mb-4">
              <div className="text-sm text-muted-foreground">快捷积分</div>
              <div className="flex flex-wrap gap-2">
                {member.quickItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickItem(item.name, item.points)}
                    className="text-sm"
                  >
                    {item.name} +{item.points}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={() => handleManualPoints('add')}
          >
            <Plus className="mr-2 h-4 w-4" />
            加分
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => handleManualPoints('deduct')}
          >
            <Minus className="mr-2 h-4 w-4" />
            扣分
          </Button>
        </CardFooter>
      </Card>

      <EditMemberDialog member={member} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      <QuickItemsManager member={member} open={quickManagerOpen} onOpenChange={setQuickManagerOpen} />
      <ManualPointsDialog
        open={manualDialogOpen}
        onOpenChange={setManualDialogOpen}
        memberId={member.id}
        operationType={operationType}
      />
      <ConfirmPointsDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        memberId={member.id}
        defaultItemName={selectedQuickItem?.name || ''}
        defaultPoints={selectedQuickItem?.points || 0}
        key={selectedQuickItem?.id}
      />
    </>
  );
}
