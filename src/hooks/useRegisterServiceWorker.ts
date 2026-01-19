'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerRegistrationResult {
  registration: ServiceWorkerRegistration | null;
  error: Error | null;
  updating: boolean;
  waiting: boolean;
  offline: boolean;
}

export function useRegisterServiceWorker() {
  const [swState, setSwState] = useState<ServiceWorkerRegistrationResult>({
    registration: null,
    error: null,
    updating: false,
    waiting: false,
    offline: !navigator.onLine,
  });

  useEffect(() => {
    // Only register service worker in production and when supported
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          '/point-card/sw.js',
          {
            scope: '/point-card/',
          }
        );

        console.log('[PWA] Service Worker registered:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('[PWA] New Service Worker found');
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New Service Worker installed, waiting to activate');
                setSwState((prev) => ({ ...prev, waiting: true, updating: false }));
              }
            });
          }
        });

        setSwState({
          registration,
          error: null,
          updating: false,
          waiting: false,
          offline: !navigator.onLine,
        });
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
        setSwState((prev) => ({
          ...prev,
          error: error as Error,
        }));
      }
    };

    registerSW();

    // Listen for online/offline events
    const handleOnline = () => setSwState((prev) => ({ ...prev, offline: false }));
    const handleOffline = () => setSwState((prev) => ({ ...prev, offline: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to skip waiting and activate the new service worker
  const skipWaiting = () => {
    if (swState.waiting && swState.registration && swState.registration.waiting) {
      swState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setSwState((prev) => ({ ...prev, waiting: false }));
      window.location.reload();
    }
  };

  return {
    ...swState,
    skipWaiting,
    isSupported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
  };
}
