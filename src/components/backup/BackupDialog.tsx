'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { BackupConfig } from '@/types';
import { uploadToGist, downloadFromGist, createGist, validateGistConfig } from '@/lib/backup';
import { useSyncStore } from '@/store/syncStore';
import { SyncStatusIndicator } from './SyncStatusIndicator';

interface BackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupDialog({ open, onOpenChange }: BackupDialogProps) {
  const syncStore = useSyncStore();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 本地临时配置（用于对话框编辑，未保存前不影响 store）
  const [tempConfig, setTempConfig] = useState<BackupConfig>({
    gistId: syncStore.gistId,
    githubToken: syncStore.githubToken,
    autoSyncEnabled: syncStore.autoSyncEnabled || false,
  });

  // 当对话框打开时，从 store 加载配置
  useEffect(() => {
    if (open) {
      setTempConfig({
        gistId: syncStore.gistId,
        githubToken: syncStore.githubToken,
        autoSyncEnabled: syncStore.autoSyncEnabled || false,
      });
      setIsValid(syncStore.gistId && syncStore.githubToken ? true : null);
    }
  }, [open, syncStore.gistId, syncStore.githubToken, syncStore.autoSyncEnabled]);

  const validateConfig = async () => {
    if (!tempConfig.gistId || !tempConfig.githubToken) {
      setIsValid(null);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const valid = await validateGistConfig(tempConfig);
      setIsValid(valid);
      setMessage(valid ? { type: 'success', text: '配置验证成功' } : { type: 'error', text: '配置验证失败，请检查 Gist ID 和 Token' });
    } catch (error) {
      setIsValid(false);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '配置验证失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tempConfig.gistId || !tempConfig.githubToken) {
      setMessage({ type: 'error', text: '请填写完整的配置信息' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const valid = await validateGistConfig(tempConfig);
      if (!valid) {
        setMessage({ type: 'error', text: '配置验证失败，请检查 Gist ID 和 Token' });
        setIsValid(false);
        return;
      }

      // 保存到 syncStore
      syncStore.setBackupConfig({
        gistId: tempConfig.gistId,
        githubToken: tempConfig.githubToken,
        autoSyncEnabled: tempConfig.autoSyncEnabled || false,
      });
      setIsValid(true);
      setMessage({ type: 'success', text: '配置保存成功' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '保存配置失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGist = async () => {
    if (!tempConfig.githubToken) {
      setMessage({ type: 'error', text: '请先填写 GitHub Token' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const gistId = await createGist({ githubToken: tempConfig.githubToken });
      setTempConfig({ ...tempConfig, gistId });
      setIsValid(true);
      setMessage({ type: 'success', text: `Gist 创建成功！ID: ${gistId}` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '创建 Gist 失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!tempConfig.gistId || !tempConfig.githubToken) {
      setMessage({ type: 'error', text: '请先配置并保存 Gist 信息' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await uploadToGist(tempConfig);
      setMessage({ type: 'success', text: '数据上传成功' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '上传失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!tempConfig.gistId || !tempConfig.githubToken) {
      setMessage({ type: 'error', text: '请先配置并保存 Gist 信息' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await downloadFromGist(tempConfig);
      setMessage({ type: 'success', text: '数据下载成功，页面即将刷新' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '下载失败' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>数据备份与同步</DialogTitle>
          <DialogDescription>
            通过 GitHub Gist 同步数据，或导出 ZIP 文件进行本地备份
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>配置说明：</strong>
              <br />
              1. GitHub Token: 在 GitHub Settings {'->'} Developer settings {'->'} Personal access tokens {'->'} Tokens (classic) 创建
              <br />
              2. 权限要求: 只需要 &ldquo;gist&rdquo; 权限
              <br />
              3. Gist ID: 创建新 Gist 后自动生成，或手动输入已存在的 Gist ID
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="githubToken">GitHub Token</Label>
              <Input
                id="githubToken"
                type="password"
                value={tempConfig.githubToken}
                onChange={(e) => setTempConfig({ ...tempConfig, githubToken: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gistId">Gist ID</Label>
              <div className="flex gap-2">
                <Input
                  id="gistId"
                  value={tempConfig.gistId}
                  onChange={(e) => setTempConfig({ ...tempConfig, gistId: e.target.value })}
                  placeholder="输入已存在的 Gist ID，或点击创建新 Gist"
                />
                <Button onClick={handleCreateGist} disabled={isLoading || !tempConfig.githubToken} type="button">
                  创建新 Gist
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoSync"
                checked={tempConfig.autoSyncEnabled || false}
                onCheckedChange={(checked) =>
                  setTempConfig({ ...tempConfig, autoSyncEnabled: checked as boolean })
                }
              />
              <Label htmlFor="autoSync" className="cursor-pointer">
                启用自动同步
              </Label>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              数据变化时自动上传到 Gist，页面刷新时自动下载
            </p>

            <div className="flex gap-2">
              <Button onClick={validateConfig} disabled={isLoading} variant="outline" type="button">
                验证配置
              </Button>
              <Button onClick={handleSave} disabled={isLoading} type="button">
                保存配置
              </Button>
              {isValid !== null && (
                <span className={`text-sm flex items-center ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? '✓ 配置有效' : '✗ 配置无效'}
                </span>
              )}
            </div>
          </div>

          {/* 自动同步已启用时显示同步状态 */}
          {syncStore.autoSyncEnabled && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold">同步状态</h3>
              <SyncStatusIndicator
                status={syncStore.syncStatus || 'idle'}
                lastSyncTime={syncStore.lastSyncTime}
                error={syncStore.lastSyncError}
              />
              {(syncStore.syncStatus === 'conflict' || syncStore.syncStatus === 'error') && (
                <Button
                  onClick={handleDownload}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  type="button"
                >
                  从云端下载
                </Button>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">手动同步</h3>
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={isLoading || !isValid} type="button">
                上传到 Gist
              </Button>
              <Button onClick={handleDownload} disabled={isLoading || !isValid} variant="outline" type="button">
                从 Gist 下载
              </Button>
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
