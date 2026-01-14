'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TemplateItem } from './TemplateItem';
import type { TemplateCategory as TemplateCategoryType, TemplateItem as TemplateItemType } from '@/types';

interface TemplateCategoryProps {
  category: TemplateCategoryType;
  templates: TemplateItemType[];
}

export function TemplateCategory({ category, templates }: TemplateCategoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{category.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无模板项</p>
          ) : (
            templates.map((template) => <TemplateItem key={template.id} template={template} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}
