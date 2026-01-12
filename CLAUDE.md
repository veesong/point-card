# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个使用 Next.js 16、React 19、TypeScript 和 Tailwind CSS 构建的家庭积分管理系统。它支持家庭成员的积分追踪，包括积分操作（加分/扣分）、快捷积分、操作日志和撤销功能。

## 开发命令

```bash
pnpm dev          # 启动开发服务器 (http://localhost:3000)
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行 ESLint
```

## 架构设计

### 状态管理 (Zustand)

应用使用 Zustand 配合 localStorage 持久化中间件管理所有应用状态。Store 定义在 [src/store/appStore.ts](src/store/appStore.ts)。

**核心状态结构：**
- `members`: 家庭成员数组，包含快捷积分项和总积分
- `logs`: 所有积分操作记录（加分/扣分/撤销）及时间戳

**重要模式：**
- 所有状态变更必须通过 store actions 进行 - 组件中永远不要直接修改状态
- 成员的 `totalPoints` 是非规范化字段，与积分操作同步更新（不是从日志计算）
- 日志冗余存储 `memberName`，以确保即使删除成员后历史记录仍能正确显示
- 撤销操作会创建新的日志条目，并将原日志标记为 `isUndone: true`
- 只有原始操作（加分/扣分）可以被撤销，撤销操作本身不能被撤销

**撤销逻辑：**
撤销日志时，系统会：
1. 将原日志标记为 `isUndone: true`
2. 创建一条新的撤销日志，`operationType` 为 `'undo'`
3. 反向调整成员的总积分
4. 存储双向引用（原日志的 `undoLogId`，撤销日志的 `relatedLogId`）

### 组件架构

组件按业务域组织在 [src/components/](src/components/)：

- `member/` - 成员管理（MemberCard、MemberList、AddMemberDialog、EditMemberDialog、QuickItemsManager）
- `points/` - 积分操作（ManualPointsDialog、ConfirmPointsDialog）
- `log/` - 操作历史（LogList、LogItem）
- `ui/` - shadcn/ui 基础组件

**对话框模式：**
所有对话框使用 shadcn/ui 的 Dialog 组件，采用受控的 `open` 状态：
- 父组件管理 `open` 布尔值状态
- 对话框接收 `onOpenChange` 回调来关闭自身
- 此模式在 AddMemberDialog、EditMemberDialog、ManualPointsDialog、ConfirmPointsDialog、QuickItemsManager 中保持一致

### 快捷积分系统

每个成员都有 `quickItems` 数组用于常用积分操作。点击快捷项时：
1. 打开 ConfirmPointsDialog，预填充项目名称和分数
2. 用户可以在确认前编辑这些值
3. 确认后调用 store 的 `addPoints()` action

### 类型定义

所有类型集中在 [src/types/index.ts](src/types/index.ts)：
- `Member` - 家庭成员，包含快捷项和总积分
- `QuickPointItem` - 积分操作的快捷配置
- `PointLog` - 操作记录，包含撤销状态
- `AppState` - Zustand store 接口，包含所有状态和操作

### 工具函数

[lib/utils.ts](lib/utils.ts) 包含：
- `formatDateTime()` - 使用 Intl API 的中文日期格式化
- `getOperationTypeText()` - 将操作类型映射为中文文本
- `getOperationTypeColor()` - 返回操作类型的 Tailwind 颜色类

### 数据持久化

Zustand store 使用 `persist` 中间件，localStorage 键名为 `family-points-storage`。数据在页面刷新和浏览器重启后保留。如需重置数据，清除 localStorage 或使用浏览器开发者工具。

## UI 组件

项目使用 shadcn/ui 组件（复制到项目中）。添加新组件：
```bash
pnpm dlx shadcn@latest add <组件名称>
```

已有组件：button、dialog、input、card、alert-dialog、scroll-area

## 样式

使用 Tailwind CSS v4 和 `@import "tailwindcss"` 语法。颜色方案使用 CSS 变量支持亮/暗模式，定义在 [app/globals.css](app/globals.css)。

使用 [lib/utils.ts](lib/utils.ts) 中的 `cn()` 工具函数来合并 Tailwind 类。
