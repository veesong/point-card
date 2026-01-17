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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exportToZip, importFromZip, resetSystem } from '@/lib/backup';

interface ExportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportImportDialog({ open, onOpenChange }: ExportImportDialogProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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

  const handleReset = async () => {
    setIsResetting(true);
    setMessage(null);

    try {
      await resetSystem();
      // 注意：resetSystem 会触发页面刷新，所以下面的代码可能不会执行
      setMessage({ type: 'success', text: '系统重置成功，页面即将刷新' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '重置失败' });
      setIsResetting(false);
    }
  };

  return (
    <>
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

            <div className="border-t pt-4">
              <Label className="text-destructive">重置系统</Label>
              <p className="text-sm text-muted-foreground mb-2">
                清除所有业务数据并恢复到初始状态（包括成员、日志、模板、分类和公告栏）
              </p>
              <Button
                onClick={() => setResetConfirmOpen(true)}
                disabled={isResetting}
                variant="destructive"
                className="w-full"
              >
                {isResetting ? '重置中...' : '重置系统'}
              </Button>
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

    <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认重置系统？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作将清除所有业务数据并恢复到初始状态。操作不可撤销。
            <br /><br />
            将被清除的数据包括：
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>所有成员及其积分</li>
              <li>所有操作日志</li>
              <li>所有自定义模板和分类</li>
              <li>公告栏内容</li>
            </ul>
            <br />
            保留的数据：备份配置（GitHub Token 和 Gist ID）
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isResetting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            确认重置
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
