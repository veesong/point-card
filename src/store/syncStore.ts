import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BackupConfig, SyncStatus } from '@/types';

interface SyncState extends BackupConfig {
  // 同步配置操作
  setBackupConfig: (config: Partial<BackupConfig>) => void;
  clearBackupConfig: () => void;

  // 同步状态管理
  updateSyncStatus: (status: SyncStatus, error?: string) => void;

  // 设备 ID 管理
  getOrCreateDeviceId: () => string;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      // 初始状态
      gistId: '',
      githubToken: '',
      lastSyncTime: undefined,
      localVersion: undefined,
      remoteVersion: undefined,
      syncStatus: 'idle',
      lastSyncError: undefined,
      autoSyncEnabled: false,
      deviceId: undefined,

      // 同步配置操作
      setBackupConfig: (config) =>
        set((state) => ({
          ...state,
          ...config,
        })),

      clearBackupConfig: () =>
        set({
          gistId: '',
          githubToken: '',
          lastSyncTime: undefined,
          localVersion: undefined,
          remoteVersion: undefined,
          syncStatus: 'idle',
          lastSyncError: undefined,
          autoSyncEnabled: false,
          deviceId: get().deviceId, // 保留 deviceId
        }),

      // 同步状态管理
      updateSyncStatus: (status, error) =>
        set({
          syncStatus: status,
          lastSyncError: error,
          lastSyncTime: status === 'success' ? Date.now() : get().lastSyncTime,
        }),

      // 设备 ID 管理
      getOrCreateDeviceId: () => {
        let deviceId = get().deviceId;
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          set({ deviceId });
        }
        return deviceId;
      },
    }),
    {
      name: 'sync-config-storage',
      version: 1,
    }
  )
);
