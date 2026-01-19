/**
 * 自动同步 Hook
 * 监听 Zustand store 变化，自动上传到 Gist
 */

import { useEffect, useRef } from 'react';
import { useSyncStore } from '@/store/syncStore';
import { useAppStore } from '@/store/appStore';
import { autoUploadWithConflictCheck } from '@/lib/sync';

/**
 * 自动同步 Hook
 */
export function useAutoSync() {
  const config = useSyncStore();
  const subscribe = useAppStore.subscribe;
  const isSyncingRef = useRef(false);

  useEffect(() => {
    // 如果未启用自动同步或配置不完整，不监听
    if (!config.autoSyncEnabled || !config.gistId || !config.githubToken) {
      return;
    }

    // 防抖上传函数
    const { debouncedFn: debouncedUpload, cancel } = (() => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const debouncedFn = async () => {
        // 如果正在同步，跳过
        if (isSyncingRef.current) {
          return;
        }

        // 清除之前的定时器
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // 设置新的定时器
        timeoutId = setTimeout(async () => {
          isSyncingRef.current = true;

          try {
            await autoUploadWithConflictCheck(
              config,
              (status, error) => config.updateSyncStatus(status, error),
              (localVersion, remoteVersion) =>
                config.setBackupConfig({ localVersion, remoteVersion })
            );
          } finally {
            isSyncingRef.current = false;
          }
        }, 2500); // 2.5 秒延迟
      };

      const cancel = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      return { debouncedFn, cancel };
    })();

    // 订阅所有状态变化
    const unsubscribe = subscribe(() => {
      // 触发防抖上传
      debouncedUpload();
    });

    // 清理函数
    return () => {
      unsubscribe();
      cancel();
    };
  }, [config, subscribe]);
}
