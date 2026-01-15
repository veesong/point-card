'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exportToZip, importFromZip } from '@/lib/backup';

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportImportDialog({ open, onOpenChange }: ExportImportDialogProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      await exportToZip();
      setMessage({ type: 'success', text: '导出成功！文件已开始下载' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '导出失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await importFromZip(file);
      setMessage({ type: 'success', text: '导入成功！页面即将刷新' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '导入失败' });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>导出/导入数据</DialogTitle>
          <DialogDescription>
            通过 ZIP 文件导出或导入数据备份
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>导出数据</Label>
              <p className="text-sm text-muted-foreground mb-2">
                将当前数据导出为 ZIP 文件，可用于备份或传输到其他设备
              </p>
              <Button onClick={handleExport} disabled={isLoading} className="w-full">
                {isLoading ? '导出中...' : '导出 ZIP 文件'}
              </Button>
            </div>

            <div className="border-t pt-4">
              <Label>导入数据</Label>
              <p className="text-sm text-muted-foreground mb-2">
                从 ZIP 文件导入数据（将覆盖当前数据并刷新页面）
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleImport}
                disabled={isLoading}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/80
                  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
