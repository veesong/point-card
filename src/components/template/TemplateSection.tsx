'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { TemplateCategory } from './TemplateCategory';
import { TemplateManagerDialog } from './TemplateManagerDialog';
import { TemplateImportDialog } from './TemplateImportDialog';
import { Settings, Download } from 'lucide-react';

export function TemplateSection() {
  const [managerOpen, setManagerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const categories = useAppStore((state) => state.categories);
  const templates = useAppStore((state) => state.templates);
  const members = useAppStore((state) => state.members);

  // 按分类分组模板
  const templatesByCategory = categories.map((category) => ({
    ...category,
    templates: templates.filter((t) => t.categoryId === category.id)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">快捷操作模板</h2>
        <div className="flex gap-2">
          {members.length > 0 && (
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              批量导入
            </Button>
          )}
          <Button onClick={() => setManagerOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            管理模板
          </Button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-2">还没有模板分类</p>
          <p className="text-sm">点击&ldquo;管理模板&rdquo;按钮开始创建</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templatesByCategory.map((category) => (
            <TemplateCategory
              key={category.id}
              category={category}
              templates={category.templates}
            />
          ))}
        </div>
      )}

      <TemplateManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
      <TemplateImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
