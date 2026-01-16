'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TemplateCardItem } from './TemplateCardItem';
import { TemplateManagerDialog } from './TemplateManagerDialog';
import { TemplateImportDialog } from './TemplateImportDialog';
import { Settings, Download } from 'lucide-react';

export function TemplateSection() {
  const [managerOpen, setManagerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const categories = useAppStore((state) => state.categories);
  const templates = useAppStore((state) => state.templates);
  const members = useAppStore((state) => state.members);
  const _hasHydrated = useAppStore((state) => state._hasHydrated);

  // 按分类分组模板，只显示可见的
  const templatesByCategory = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        templates: templates.filter(
          (t) => t.categoryId === category.id && (t.isVisible !== false)
        )
      }))
      .filter((category) => category.templates.length > 0); // 过滤掉空分类
  }, [categories, templates]);

  // 显示加载骨架屏
  if (!_hasHydrated) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">常用操作</h3>
            {templatesByCategory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>没有显示的模板项</p>
                <p className="text-sm mt-1">点击&ldquo;管理模板&rdquo;中的&ldquo;展示设置&rdquo;来选择要显示的项目</p>
              </div>
            ) : (
              <div className="space-y-6">
                {templatesByCategory.map((category) => (
                  <div key={category.id}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      {category.name}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {category.templates.map((template) => (
                        <TemplateCardItem key={template.id} template={template} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <TemplateManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
      <TemplateImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
