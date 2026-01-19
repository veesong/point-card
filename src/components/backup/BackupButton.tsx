'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BackupDialog } from './BackupDialog';
import { ExportImportDialog } from './ExportImportDialog';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { Upload, Cloud } from 'lucide-react';
import { useSyncStore } from '@/store/syncStore';

export function BackupButton() {
  const [backupOpen, setBackupOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const { autoSyncEnabled, syncStatus, lastSyncTime, lastSyncError } = useSyncStore();

  return (
    <>
      <div className="flex gap-2 items-center">
        {/* 同步状态指示器 */}
        {autoSyncEnabled && (
          <SyncStatusIndicator
            status={syncStatus || 'idle'}
            lastSyncTime={lastSyncTime}
            error={lastSyncError}
          />
        )}

        <Button onClick={() => setBackupOpen(true)} variant="outline" size="sm">
          <Cloud className="w-4 h-4 mr-2" />
          Gist 同步
        </Button>
        <Button onClick={() => setExportOpen(true)} variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          导出/导入
        </Button>
      </div>

      <BackupDialog open={backupOpen} onOpenChange={setBackupOpen} />
      <ExportImportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </>
  );
}
