'use client';

import { Card } from '@/components/ui/card';
import type { TemplateItem as TemplateItemType } from '@/types';
import { Plus, Minus } from 'lucide-react';

interface TemplateCardItemProps {
  template: TemplateItemType;
}

export function TemplateCardItem({ template }: TemplateCardItemProps) {
  const isAdd = template.operationType === 'add';

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{template.name}</span>
        <div className="flex items-center gap-1 mt-auto">
          {isAdd ? (
            <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-lg font-bold ${
              isAdd ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {template.points}分
          </span>
        </div>
      </div>
    </Card>
  );
}
