'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface BackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupDialog({ open, onOpenChange }: BackupDialogProps) {
  const [config, setConfig] = useState<BackupConfig>({
    gistId: '',
    githubToken: '',
  });
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('backup-config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse backup config:', error);
      }
    }
  }, []);

  const validateConfig = async () => {
    if (!config.gistId || !config.githubToken) {
      setIsValid(null);
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const valid = await validateGistConfig(config);
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
    if (!config.gistId || !config.githubToken) {
      setMessage({ type: 'error', text: '请填写完整的配置信息' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const valid = await validateGistConfig(config);
      if (!valid) {
        setMessage({ type: 'error', text: '配置验证失败，请检查 Gist ID 和 Token' });
        setIsValid(false);
        return;
      }

      localStorage.setItem('backup-config', JSON.stringify(config));
      setIsValid(true);
      setMessage({ type: 'success', text: '配置保存成功' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '保存配置失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGist = async () => {
    if (!config.githubToken) {
      setMessage({ type: 'error', text: '请先填写 GitHub Token' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const gistId = await createGist({ githubToken: config.githubToken });
      setConfig({ ...config, gistId });
      setIsValid(true);
      setMessage({ type: 'success', text: `Gist 创建成功！ID: ${gistId}` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '创建 Gist 失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!config.gistId || !config.githubToken) {
      setMessage({ type: 'error', text: '请先配置并保存 Gist 信息' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await uploadToGist(config);
      setMessage({ type: 'success', text: '数据上传成功' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '上传失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!config.gistId || !config.githubToken) {
      setMessage({ type: 'error', text: '请先配置并保存 Gist 信息' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await downloadFromGist(config);
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
                value={config.githubToken}
                onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gistId">Gist ID</Label>
              <div className="flex gap-2">
                <Input
                  id="gistId"
                  value={config.gistId}
                  onChange={(e) => setConfig({ ...config, gistId: e.target.value })}
                  placeholder="输入已存在的 Gist ID，或点击创建新 Gist"
                />
                <Button onClick={handleCreateGist} disabled={isLoading || !config.githubToken} type="button">
                  创建新 Gist
                </Button>
              </div>
            </div>

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

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">数据同步</h3>
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
