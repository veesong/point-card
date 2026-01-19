# PWA Implementation Guide

This document describes the PWA (Progressive Web App) implementation for the Family Points Management System.

## Overview

The application now supports PWA mode, which allows users to:
- Install the app on their devices (mobile and desktop)
- Use the app offline
- Receive app-like experience with native app features
- Get automatic updates when new versions are available

## Implementation Details

### Files Added/Modified

#### Core PWA Files
- **[public/manifest.json](public/manifest.json)** - Web app manifest with app metadata, icons, and configuration
- **[public/sw.js](public/sw.js)** - Service worker for offline caching and update management
- **[src/hooks/useRegisterServiceWorker.ts](src/hooks/useRegisterServiceWorker.ts)** - React hook for service worker registration
- **[src/components/ServiceWorkerProvider.tsx](src/components/ServiceWorkerProvider.tsx)** - Provider component that manages service worker lifecycle

#### Modified Files
- **[src/app/layout.tsx](src/app/layout.tsx)** - Added PWA metadata and ServiceWorkerProvider

#### Assets
- **[public/icons/](public/icons/)** - App icons in various sizes (72x72 to 512x512)
- **[public/favicon.ico](public/favicon.ico)** - Site favicon

### Dependencies Added
```json
{
  "devDependencies": {
    "workbox-window": "^7.4.0",
    "workbox-build": "^7.4.0",
    "sharp": "^0.34.5"
  }
}
```

## Features

### 1. Offline Support
The service worker implements multiple caching strategies:
- **StaleWhileRevalidate** - Same-origin resources (HTML, JS, CSS)
- **CacheFirst** - Images and fonts
- **NetworkFirst** - API calls (future use)

### 2. App Installation
Users can install the app on their devices:
- **Desktop**: Click install button in browser address bar
- **Mobile**: Add to Home Screen from browser menu

### 3. Automatic Updates
- Service worker checks for updates on page load
- Users are prompted when a new version is available
- Updates are applied immediately or on next reload

### 4. Offline Detection
- App detects online/offline status
- Logs status changes to console
- Graceful degradation when offline

## How It Works

### Service Worker Registration
```typescript
// Registered in ServiceWorkerProvider (production only)
navigator.serviceWorker.register('/point-card/sw.js', {
  scope: '/point-card/',
})
```

### Caching Strategy
The service worker uses three main strategies:

1. **Precache** - Critical app shell files are cached on install
2. **Runtime Cache** - Dynamic content is cached as users navigate
3. **Cache Cleanup** - Old caches are removed when service worker updates

### Update Flow
1. New service worker detected
2. User sees "New version available" prompt
3. User clicks "OK" to update
4. Service worker skips waiting and activates
5. Page reloads with new version

## Testing PWA

### Development Mode
Service worker is **disabled** in development mode. To test:
1. Build the production version: `pnpm build`
2. Serve the output: `npx serve out` or `pnpm start`
3. Open browser DevTools → Application tab
4. Check "Service Workers" and "Manifest" sections

### Production Mode
Service worker is **enabled** in production mode automatically.

### Lighthouse Audit
Run Lighthouse to verify PWA compliance:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App" category
4. Run audit

## Icon Generation

Icons are generated using the script in `scripts/generate-png-icons.js`:
```bash
node scripts/generate-png-icons.js
```

This creates:
- 8 PNG icons (72x72 to 512x512)
- Favicon (PNG and ICO)
- SVG versions for reference

### Customizing Icons
1. Edit the SVG template in `scripts/generate-png-icons.js`
2. Run the generation script
3. Rebuild the project

## Browser Compatibility

### Supported Browsers
- Chrome/Edge 90+ (full support)
- Safari 15+ (partial support)
- Firefox 90+ (full support)

### Platform Support
- Android: Full support (Chrome)
- iOS: Limited support (Safari)
- Desktop: Full support (Chrome, Edge, Firefox)

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure serving over HTTPS (or localhost)
- Verify service worker file is accessible at `/point-card/sw.js`

### App Not Installable
- Check manifest.json is valid
- Ensure icons are present and accessible
- Verify site is served over HTTPS
- Check Lighthouse PWA audit for specific issues

### Cache Issues
- Clear site data in browser DevTools
- Unregister service worker in DevTools
- Reload page to re-register

### Update Not Prompting
- Check console for service worker logs
- Verify service worker update detection
- Clear cache and reload

## Future Enhancements

Potential improvements to consider:
1. **Background Sync** - Queue API calls when offline, sync when online
2. **Push Notifications** - Notify users of important events
3. **Periodic Sync** - Automatic data refresh
4. **App Shortcuts** - Quick access to common actions (already in manifest)
5. **Share Target** - Accept shared data from other apps
6. **Offline Indicator** - UI element showing online/offline status

## Resources

- [PWA Best Practices](https://web.dev/pwa/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

## Summary

The PWA implementation is **complete and functional**. No major architectural changes were needed - the existing Zustand + localStorage setup is fully compatible with PWA offline capabilities.

The app can now be:
- Installed on devices
- Used offline
- Automatically updated
- Launched from home screen

All existing features (members, points, logs, sync, backup) work seamlessly with PWA mode.
