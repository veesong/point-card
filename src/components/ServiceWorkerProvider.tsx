'use client';

import { useEffect } from 'react';
import { useRegisterServiceWorker } from '@/hooks/useRegisterServiceWorker';

export function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSupported, offline, waiting, skipWaiting } = useRegisterServiceWorker();

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => {
      console.log('[PWA] App is online');
    };

    const handleOffline = () => {
      console.log('[PWA] App is offline');
    };

    if (isSupported) {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [isSupported]);

  useEffect(() => {
    // Handle service worker updates
    if (waiting) {
      const shouldUpdate = window.confirm(
        '新版本可用！点击"确定"立即更新，或点击"取消"下次更新。'
      );

      if (shouldUpdate) {
        skipWaiting();
      }
    }
  }, [waiting, skipWaiting]);

  // Show offline indicator if offline
  useEffect(() => {
    if (offline) {
      console.log('[PWA] Currently offline - some features may be limited');
    }
  }, [offline]);

  return <>{children}</>;
}
