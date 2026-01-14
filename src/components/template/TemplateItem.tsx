'use client';

import type { TemplateItem as TemplateItemType } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface TemplateItemProps {
  template: TemplateItemType;
}

export function TemplateItem({ template }: TemplateItemProps) {
  const isAdd = template.operationType === 'add';

  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
      <span className="flex-1 text-sm">{template.name}</span>
      <div className="flex items-center gap-1">
        {isAdd ? (
          <Plus className="h-3 w-3 text-green-600 dark:text-green-400" />
        ) : (
          <Minus className="h-3 w-3 text-red-600 dark:text-red-400" />
        )}
        <span
          className={`text-sm font-medium ${
            isAdd ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {template.points}分
        </span>
      </div>
    </div>
  );
}
