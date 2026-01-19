/**
 * 同步核心逻辑
 */

import type { BackupConfig, GistDataPackage, SyncStatus } from '@/types';
import { compareVersions } from './version';
import { fetchGistInfo, downloadFromGist, createGistDataPackage, uploadGistDataPackage, getAppData, getLocalVersion } from './backup';

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): { debouncedFn: T; cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return { debouncedFn, cancel };
}

/**
 * 判断是否应该下载远程数据
 */
export function shouldDownloadRemote(localConfig: BackupConfig, remotePackage: GistDataPackage): boolean {
  // 优先使用应用数据中的版本号（刷新后会保留）
  const localVersion = getLocalVersion() || localConfig.localVersion;

  // 如果没有本地版本，首次设置，应该下载
  if (!localVersion) {
    return true;
  }

  // 如果远程版本更新，应该下载
  return compareVersions(remotePackage.version, localVersion) > 0;
}

/**
 * 自动下载逻辑
 * @returns 返回是否应该更新本地数据
 */
export async function autoDownloadFromGist(
  config: BackupConfig,
  updateSyncStatus: (status: SyncStatus, error?: string) => void,
  updateVersions: (localVersion: string, remoteVersion: string) => void
): Promise<{ shouldUpdate: boolean; remoteData?: GistDataPackage['data']['state'] }> {
  const { gistId, githubToken } = config;

  if (!githubToken || !gistId) {
    return { shouldUpdate: false };
  }

  try {
    updateSyncStatus('syncing');

    // 获取远程版本信息
    const remoteInfo = await fetchGistInfo(config);
    if (!remoteInfo) {
      updateSyncStatus('error', '无法连接到 Gist');
      return { shouldUpdate: false };
    }

    // 如果没有版本信息（旧格式或空 Gist），不自动下载
    if (!remoteInfo.version) {
      updateSyncStatus('idle');
      return { shouldUpdate: false };
    }

    // 比较版本
    const shouldDownload = shouldDownloadRemote(config, {
      version: remoteInfo.version,
      timestamp: 0,
      deviceId: '',
      checksum: '',
      data: { state: {} as GistDataPackage['data']['state'] },
    });

    if (shouldDownload) {
      // 远程版本更新，需要下载
      await downloadFromGist(config);

      // 更新版本记录
      updateVersions(remoteInfo.version, remoteInfo.version);

      updateSyncStatus('success');
      // 注意：downloadFromGist 会刷新页面，这里不会执行
      return { shouldUpdate: true };
    }

    // 本地版本是最新的或相同的，不需要下载
    updateVersions(config.localVersion || remoteInfo.version, remoteInfo.version);
    updateSyncStatus('success');
    return { shouldUpdate: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '下载失败';
    updateSyncStatus('error', errorMessage);
    return { shouldUpdate: false };
  }
}

/**
 * 自动上传逻辑（带冲突检测）
 */
export async function autoUploadWithConflictCheck(
  config: BackupConfig,
  updateSyncStatus: (status: SyncStatus, error?: string) => void,
  updateVersions: (localVersion: string, remoteVersion: string) => void
): Promise<boolean> {
  const { gistId, githubToken, deviceId } = config;

  if (!githubToken || !gistId) {
    return false;
  }

  try {
    updateSyncStatus('syncing');

    // 步骤 1: 获取当前远程版本（不下载完整内容）
    const remoteInfo = await fetchGistInfo(config);
    if (!remoteInfo) {
      updateSyncStatus('error', '无法连接到 Gist');
      return false;
    }

    // 步骤 2: 比较版本（优先使用应用数据中的版本号）
    const localVersion = getLocalVersion() || config.localVersion || '0';
    const remoteVersion = remoteInfo.version || '0';

    // 如果远程版本更新，冲突检测
    if (remoteInfo.version && compareVersions(remoteVersion, localVersion) > 0) {
      updateSyncStatus('conflict', '远程版本较新，无法上传。请从云端同步最新数据。');
      return false;
    }

    // 步骤 3: 安全上传
    const appData = getAppData();
    const dataPackage = await createGistDataPackage(appData, deviceId || crypto.randomUUID());
    await uploadGistDataPackage(config, dataPackage);

    // 步骤 4: 更新本地跟踪
    updateVersions(dataPackage.version, dataPackage.version);
    updateSyncStatus('success');

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败';
    updateSyncStatus('error', errorMessage);
    return false;
  }
}
