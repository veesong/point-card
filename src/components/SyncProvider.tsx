/**
 * 同步提供者组件
 * 负责自动下载和初始化自动同步
 */

'use client';

import { useEffect, useState } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { useAppStore } from '@/store/appStore';
import { useAutoSync } from '@/hooks/useAutoSync';
import { autoDownloadFromGist } from '@/lib/sync';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const syncStore = useSyncStore();
  const _hasHydrated = useAppStore((state) => state._hasHydrated);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 等待 Zustand store 水合完成
    if (!_hasHydrated || initialized) {
      return;
    }

    const initializeAutoDownload = async () => {
      // 检查是否启用自动同步且配置完整
      if (!syncStore.autoSyncEnabled || !syncStore.gistId || !syncStore.githubToken) {
        setInitialized(true);
        return;
      }

      try {
        // 自动下载：如果远程版本更新，下载并刷新页面
        await autoDownloadFromGist(
          syncStore,
          (status, error) => syncStore.updateSyncStatus(status, error),
          (localVersion, remoteVersion) =>
            syncStore.setBackupConfig({ localVersion, remoteVersion })
        );
        // 注意：如果下载了数据，页面会刷新，不会执行到这里
      } catch (error) {
        console.error('Auto-download failed:', error);
        // 下载失败不影响应用启动
      }

      setInitialized(true);
    };

    initializeAutoDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, initialized]);

  // 初始化自动同步 Hook
  useAutoSync();

  return <>{children}</>;
}
