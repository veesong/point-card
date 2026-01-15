'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplateImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId?: string;
}

export function TemplateImportDialog({ open, onOpenChange, memberId }: TemplateImportDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(memberId || '');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<Set<string>>(new Set());

  const members = useAppStore((state) => state.members);
  const categories = useAppStore((state) => state.categories);
  const templates = useAppStore((state) => state.templates);
  const importTemplatesToMember = useAppStore((state) => state.importTemplatesToMember);

  // 按分类分组模板
  const templatesByCategory = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      templates: templates.filter((t) => t.categoryId === category.id)
    }));
  }, [categories, templates]);

  // 对话框状态变化时处理
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // 对话框关闭时重置状态
      setSelectedMemberId('');
      setSelectedTemplateIds(new Set());
    }
    onOpenChange(newOpen);
  };

  const handleImport = () => {
    if (selectedMemberId && selectedTemplateIds.size > 0) {
      importTemplatesToMember(selectedMemberId, Array.from(selectedTemplateIds));
      setSelectedMemberId('');
      setSelectedTemplateIds(new Set());
      handleOpenChange(false);
    }
  };

  const toggleTemplate = (templateId: string) => {
    const newSelected = new Set(selectedTemplateIds);
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId);
    } else {
      newSelected.add(templateId);
    }
    setSelectedTemplateIds(newSelected);
  };

  const toggleCategory = (categoryTemplates: string[]) => {
    const allSelected = categoryTemplates.every((id) => selectedTemplateIds.has(id));
    const newSelected = new Set(selectedTemplateIds);

    if (allSelected) {
      // 取消全选
      categoryTemplates.forEach((id) => newSelected.delete(id));
    } else {
      // 全选
      categoryTemplates.forEach((id) => newSelected.add(id));
    }

    setSelectedTemplateIds(newSelected);
  };

  const isCategoryAllSelected = (categoryTemplates: string[]) => {
    return categoryTemplates.length > 0 && categoryTemplates.every((id) => selectedTemplateIds.has(id));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle>批量导入模板到成员</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 flex-shrink-0">
          {/* 成员选择 */}
          <div>
            <Label htmlFor="member-select">选择成员</Label>
            <select
              id="member-select"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md"
              disabled={!!memberId} // 如果有预选的memberId，则禁用选择
            >
              <option value="">请选择成员</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ScrollArea className="px-6" style={{ height: 'calc(90vh - 240px)' }}>
          <div className="pb-4">
            {/* 模板多选 */}
            {selectedMemberId &&
              templatesByCategory.map((category) => {
              const categoryTemplateIds = category.templates.map((t) => t.id);
              const allSelected = isCategoryAllSelected(categoryTemplateIds);

              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => toggleCategory(categoryTemplateIds)}
                    />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>

                  {category.templates.length > 0 ? (
                    <div className="ml-6 space-y-2">
                      {category.templates.map((template) => (
                        <div key={template.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedTemplateIds.has(template.id)}
                            onCheckedChange={() => toggleTemplate(template.id)}
                          />
                          <span className="flex-1">{template.name}</span>
                          <span
                            className={`text-sm ${
                              template.operationType === 'add'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {template.operationType === 'add' ? '+' : '-'}
                            {template.points}分
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ml-6 text-sm text-muted-foreground">暂无模板</p>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 flex-shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedMemberId || selectedTemplateIds.size === 0}
          >
            导入 ({selectedTemplateIds.size} 项)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
