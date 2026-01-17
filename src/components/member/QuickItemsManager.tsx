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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Edit2, Minus, Download } from 'lucide-react';
import type { Member, QuickPointItem } from '@/types';
import { TemplateImportDialog } from '@/components/template/TemplateImportDialog';

interface QuickItemsManagerProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditingItem {
  id: string | null;
  name: string;
  points: string;
  operationType: 'add' | 'deduct';
}

export function QuickItemsManager({ member, open, onOpenChange }: QuickItemsManagerProps) {
  const [editingItem, setEditingItem] = useState<EditingItem>({
    id: null,
    name: '',
    points: '10',
    operationType: 'add'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [templateImportOpen, setTemplateImportOpen] = useState(false);

  const addQuickItem = useAppStore((state) => state.addQuickItem);
  const updateQuickItem = useAppStore((state) => state.updateQuickItem);
  const deleteQuickItem = useAppStore((state) => state.deleteQuickItem);

  const handleAdd = () => {
    if (member && editingItem.name.trim() && editingItem.points) {
      addQuickItem(member.id, editingItem.name.trim(), parseInt(editingItem.points, 10), editingItem.operationType);
      setEditingItem({ id: null, name: '', points: '10', operationType: 'add' });
      setIsAdding(false);
    }
  };

  const handleUpdate = () => {
    if (member && editingItem.id && editingItem.name.trim() && editingItem.points) {
      updateQuickItem(member.id, editingItem.id, editingItem.name.trim(), parseInt(editingItem.points, 10), editingItem.operationType);
      setEditingItem({ id: null, name: '', points: '10', operationType: 'add' });
    }
  };

  const handleEdit = (item: QuickPointItem) => {
    setEditingItem({ id: item.id, name: item.name, points: item.points.toString(), operationType: item.operationType || 'add' });
    setIsAdding(false);
  };

  const handleDelete = (itemId: string) => {
    if (member) {
      deleteQuickItem(member.id, itemId);
    }
  };

  const startAdding = () => {
    setEditingItem({ id: null, name: '', points: '10', operationType: 'add' });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingItem({ id: null, name: '', points: '10', operationType: 'add' });
    setIsAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>管理快捷积分项</DialogTitle>
          <DialogDescription>
            为 {member?.name || '成员'} 添加常用的积分项目，方便快速操作
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* 添加新项 */}
          {isAdding && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="项目名称"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="分数"
                  value={editingItem.points}
                  onChange={(e) => setEditingItem({ ...editingItem, points: e.target.value })}
                  className="w-20"
                />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">操作类型:</span>
                <Button
                  type="button"
                  size="sm"
                  variant={editingItem.operationType === 'add' ? 'default' : 'outline'}
                  onClick={() => setEditingItem({ ...editingItem, operationType: 'add' })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  加分
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={editingItem.operationType === 'deduct' ? 'destructive' : 'outline'}
                  onClick={() => setEditingItem({ ...editingItem, operationType: 'deduct' })}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  扣分
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!editingItem.name.trim() || !editingItem.points} className="flex-1">
                  确认
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1">
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 现有项目列表 */}
          <ScrollArea className="h-[400px] rounded-md border pr-4">
            <div className="space-y-2">
              {member?.quickItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
                >
                  {editingItem.id === item.id ? (
                    <>
                      <div className="flex-1 space-y-2">
                        <Input
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        />
                        <Input
                          type="number"
                          value={editingItem.points}
                          onChange={(e) => setEditingItem({ ...editingItem, points: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={editingItem.operationType === 'add' ? 'default' : 'outline'}
                            onClick={() => setEditingItem({ ...editingItem, operationType: 'add' })}
                            className="flex-1"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            加分
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={editingItem.operationType === 'deduct' ? 'destructive' : 'outline'}
                            onClick={() => setEditingItem({ ...editingItem, operationType: 'deduct' })}
                            className="flex-1"
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            扣分
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdate} disabled={!editingItem.name.trim()}>
                          保存
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          取消
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{item.name}</span>
                      <span className={`text-sm ${item.operationType === 'deduct' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {item.operationType === 'deduct' ? '-' : '+'}{item.points}分
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              {!isAdding && (!member?.quickItems || member.quickItems.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  暂无快捷积分项，点击下方按钮添加
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {!isAdding && member && (
            <Button
              variant="secondary"
              onClick={() => setTemplateImportOpen(true)}
              className="mr-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              从模板导入
            </Button>
          )}
          {!isAdding && (
            <Button onClick={startAdding}>
              <Plus className="mr-2 h-4 w-4" />
              添加快捷项
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {member && (
        <TemplateImportDialog
          open={templateImportOpen}
          onOpenChange={setTemplateImportOpen}
          memberId={member.id}
        />
      )}
    </Dialog>
  );
}
