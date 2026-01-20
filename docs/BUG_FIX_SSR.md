# GitHub Actions 构建错误修复记录

## 问题描述

GitHub Actions 构建时出现以下错误：

```
Error occurred prerendering page "/_not-found".
ReferenceError: navigator is not defined
```

## 根本原因

在服务器端渲染（SSR）时，浏览器 API（如 `navigator`）不可用。

在 `useRegisterServiceWorker.ts` 中，`useState` 的初始值直接使用了 `navigator.onLine`：

```typescript
// ❌ 错误的做法
const [swState, setSwState] = useState<ServiceWorkerRegistrationResult>({
  registration: null,
  error: null,
  updating: false,
  waiting: false,
  offline: !navigator.onLine, // 这里会在 SSR 时报错
});
```

## 解决方案

将浏览器 API 的调用移到 `useEffect` 中，确保只在客户端执行：

```typescript
// ✅ 正确的做法
const [swState, setSwState] = useState<ServiceWorkerRegistrationResult>({
  registration: null,
  error: null,
  updating: false,
  waiting: false,
  offline: false, // 初始化为 false
});

useEffect(() => {
  if (typeof window === 'undefined') {
    return;
  }

  // 在客户端初始化离线状态
  setSwState((prev) => ({ ...prev, offline: !navigator.onLine }));

  // ... 其他代码
}, []);
```

## 修复的文件

- [src/hooks/useRegisterServiceWorker.ts](src/hooks/useRegisterServiceWorker.ts)
  - 将 `navigator.onLine` 的调用从 `useState` 初始值移到 `useEffect` 中
  - 添加了初始化离线状态的逻辑

## 验证结果

✅ 本地构建成功
```bash
pnpm build
# ✓ Compiled successfully
# ✓ Generating static pages
```

✅ ESLint 检查通过
```bash
pnpm lint
# 无错误和警告
```

## 关键要点

### SSR 安全模式

在 Next.js 中使用浏览器 API 时，必须遵循以下模式：

1. **检查环境**：
   ```typescript
   if (typeof window === 'undefined') return;
   ```

2. **延迟初始化**：
   ```typescript
   // ❌ 不要在 useState 初始值中使用浏览器 API
   useState(navigator.onLine)

   // ✅ 在 useEffect 中初始化
   useEffect(() => {
     setState(navigator.onLine)
   }, [])
   ```

3. **使用 'use client'**：
   - 确保使用了 `'use client'` 指令（仅在客户端组件中）

### 常见的 SSR 不兼容 API

以下 API 在 SSR 时不可用：

- `navigator` 对象
- `window` 对象
- `document` 对象
- `localStorage` / `sessionStorage`
- `fetch`（需要使用特定的 SSR 兼容版本）

### 最佳实践

```typescript
'use client';

import { useEffect, useState } from 'react';

export function MyComponent() {
  // ✅ 好的做法
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // 只在客户端执行
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <div>Status: {isOnline ? 'Online' : 'Offline'}</div>;
}
```

## 部署状态

- ✅ 代码已修复
- ✅ 本地构建成功
- ⏳ 等待 GitHub Actions 验证

## 相关文档

- [Next.js SSR 文档](https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering)
- [React Hooks 在 SSR 中的使用](https://react.dev/reference/react/useHook)
- [浏览器 API 兼容性](https://developer.mozilla.org/en-US/docs/Web/API)
