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
- `categories`: 模板分类数组（学习类、家务类、行为类等）
- `templates`: 全局快捷操作模板数组
- `bulletin`: 公告栏内容

**重要模式：**
- 所有状态变更必须通过 store actions 进行 - 组件中永远不要直接修改状态
- 成员的 `totalPoints` 是非规范化字段，与积分操作同步更新（不是从日志计算）
- 日志冗余存储 `memberName`，以确保即使删除成员后历史记录仍能正确显示
- 删除成员时会同时删除其所有关联日志
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
- `points/` - 积分操作（ManualPointsDialog）
- `log/` - 操作历史（MemberLogDialog、LogItem）
- `template/` - 快捷操作模板（TemplateSection、TemplateCategory、TemplateItem、TemplateManagerDialog、TemplateImportDialog）
- `bulletin/` - 公告栏（BulletinSection）
- `ui/` - shadcn/ui 基础组件

**对话框模式：**
所有对话框使用 shadcn/ui 的 Dialog 组件，采用受控的 `open` 状态：
- 父组件管理 `open` 布尔值状态
- 对话框接收 `onOpenChange` 回调来关闭自身
- 此模式在所有对话框组件中保持一致

### 快捷积分系统

每个成员都有 `quickItems` 数组用于常用积分操作。快捷项支持加分和扣分两种操作类型（通过 `operationType` 字段区分）。

**工作流程：**
1. 用户点击"加分"或"扣分"按钮打开 ManualPointsDialog
2. 对话框根据操作类型过滤并显示对应的快捷操作按钮
3. 用户点击快捷操作按钮可快速填充表单
4. 用户提交后：
   - 如果项目名称已存在于快捷项中，直接关闭对话框
   - 如果项目名称不存在，弹出 AlertDialog 询问是否添加为快捷操作
5. 用户可通过成员卡片上的设置按钮管理快捷项
6. **从模板导入**：用户可从全局模板批量导入快捷项到成员

**向后兼容性：**
- 现有快捷项如果没有 `operationType` 字段，默认为 'add'（加分）
- 新创建的快捷项必须指定 `operationType`

### 快捷操作模板系统

系统提供全局快捷操作模板，按分类组织（如学习类、家务类、行为类）。模板可批量导入到成员的快捷项中。

**模板分类：**
- 每个分类包含名称和排序字段
- 删除分类会级联删除该分类下的所有模板
- 支持完整的增删改查操作

**模板项：**
- 包含名称、分数、操作类型（加分/扣分）
- 每个模板关联到一个分类
- 支持完整的增删改查操作

**批量导入功能：**
- 从主页面"批量导入"按钮打开导入对话框
- 从 QuickItemsManager 中的"从模板导入"按钮打开（预选当前成员）
- 多选界面，按分类分组显示
- 支持按分类全选/取消全选
- 显示已选数量
- 允许重复导入（同一模板可多次导入到同一成员）

**默认数据：**
系统预置两个分类和十八个模板：

加分项：
- 跳绳 100 个：+1分
- 摸高 50 个：+1分
- 户外活动 1 小时：+2分
- 九点半前睡觉：+2分
- 20分钟内吃完饭：+2分
- 期末考试获奖：+50分
- 考试成绩优秀：+20分
- 学校特殊表彰：+20分
- 作业出色受到表扬：+5分

扣分项：
- 玩手机平板10分钟：-2分
- 看电视15分钟：-2分
- 电脑游戏 30 分钟：-10分
- 提现 5 元：-5分
- 十点半之后睡：-2分
- 不认真吃饭：-1分
- 在学校受到严厉批评：-10分
- 起床拖拉上学迟到：-2分
- 让妈妈生气：-5分

### 公告栏系统

公告栏提供大字体显示，适合平板端远距离查看。

**功能特性：**
- 大字体显示（移动端 text-2xl，桌面端 text-3xl）
- 对话框编辑模式
- 支持多行文本（换行符保留）
- 内容持久化到 localStorage
- 实时保存，无需确认按钮

**布局位置：**
- 位于成员卡片下方
- 左侧 3/4 宽度：快捷操作模板
- 右侧 1/4 宽度：公告栏
- 移动端自动堆叠为单列布局

### 操作日志系统

操作日志按成员分离显示：
- 每个成员卡片有"查看操作日志"按钮，打开 MemberLogDialog
- 日志通过 `memberId` 过滤，只显示该成员的记录
- 删除成员时，其所有日志会被同时删除
- 不再有全局日志视图，所有日志都在成员级别查看

**性能优化：**
- MemberLogDialog 使用 `useMemo` 缓存过滤后的日志，避免 Zustand selector 导致的无限循环
- 正确模式：先获取全部数据，再用 `useMemo` 过滤
- 错误模式：在 selector 中直接过滤（会创建新引用导致重渲染）

### 类型定义

所有类型集中在 [src/types/index.ts](src/types/index.ts)：
- `Member` - 家庭成员，包含快捷项和总积分
- `QuickPointItem` - 积分操作的快捷配置，支持 `operationType` 字段
- `PointLog` - 操作记录，包含撤销状态和关联日志引用
- `TemplateCategory` - 模板分类
- `TemplateItem` - 全局快捷操作模板
- `Bulletin` - 公告栏内容
- `AppState` - Zustand store 接口，包含所有状态和操作
- `TemplateState` - 模板和公告相关的状态和操作

### 工具函数

[lib/utils.ts](lib/utils.ts) 包含：
- `formatDateTime()` - 使用 Intl API 的中文日期格式化
- `getOperationTypeText()` - 将操作类型映射为中文文本
- `getOperationTypeColor()` - 返回操作类型的 Tailwind 颜色类
- `cn()` - 合并 Tailwind 类的工具函数

### 数据持久化

Zustand store 使用 `persist` 中间件：
- localStorage 键名为 `family-points-storage`
- 当前版本为 4（version 字段）
- 数据在页面刷新和浏览器重启后保留
- 如需重置数据，清除 localStorage 或使用浏览器开发者工具

**版本迁移：**
- 版本 2 → 版本 3：添加了模板分类、模板项和公告栏
- 版本 3 → 版本 4：更新默认模板内容为18个新模板（加分项9个、扣分项9个）
- 迁移时自动初始化默认分类和模板
- 用户现有数据（成员、日志）完整保留

## UI 组件

项目使用 shadcn/ui 组件（复制到项目中）。添加新组件：
```bash
pnpm dlx shadcn@latest add <组件名称>
```

已有组件：button、dialog、input、card、alert-dialog、scroll-area、checkbox、tabs、textarea、label

## 样式

使用 Tailwind CSS v4 和 `@import "tailwindcss"` 语法。颜色方案使用 CSS 变量支持亮/暗模式，定义在 [app/globals.css](app/globals.css)。

使用 [lib/utils.ts](lib/utils.ts) 中的 `cn()` 工具函数来合并 Tailwind 类。

## CI/CD

### GitHub Actions

项目使用 GitHub Actions 进行持续集成和部署：
- [build.yml](.github/workflows/build.yml) - 代码构建和测试（在 push 和 PR 时触发）
- [nextjs.yml](.github/workflows/nextjs.yml) - 部署到 GitHub Pages

**构建流程：**
1. 安装依赖（使用 pnpm 和 frozen-lockfile）
2. 运行 ESLint 检查（`pnpm lint`）
3. 构建生产版本（`pnpm build`）

## 重要注意事项

### ESLint 规则

**React/JSX 中避免使用未转义的引号：**
- 在 JSX 中使用中文引号 `"` 或 `"` 会触发 `react/no-unescaped-entities` 错误
- 必须使用 HTML 实体转义：
  - `"` 替换为 `&ldquo;`
  - `"` 替换为 `&rdquo;`
  - `'` 替换为 `&lsquo;`
  - `'` 替换为 `&rsquo;`

```tsx
// ❌ 错误 - 会导致 ESLint 报错
<div>要保存"文件"吗？</div>

// ✅ 正确
<div>要保存&ldquo;文件&rdquo;吗？</div>
```

### 避免无限循环
当从 Zustand store 获取数据并需要过滤时，始终使用 `useMemo`：
```typescript
// ✅ 正确
const allLogs = useAppStore((state) => state.logs);
const logs = useMemo(
  () => allLogs.filter((log) => log.memberId === memberId),
  [allLogs, memberId]
);

// ❌ 错误 - 会导致无限循环
const logs = useAppStore((state) =>
  state.logs.filter((log) => log.memberId === memberId)
);
```

### 快捷项操作类型
- 创建快捷项时必须指定 `operationType`（'add' 或 'deduct'）
- 加分对话框只显示 `operationType === 'add'` 或未定义的快捷项（向后兼容）
- 扣分对话框只显示 `operationType === 'deduct'` 的快捷项

### 成员删除
删除成员操作是原子性的，会同时删除：
- 成员本身
- 该成员的所有日志
- 无法撤销此操作

### 模板管理注意事项
- 模板是全局的，不属于任何特定成员
- 模板可以重复导入到同一成员（创建独立的快捷项）
- 删除分类会级联删除该分类下的所有模板
- 默认模板在首次加载时自动创建

### React Hooks 最佳实践
**避免在 useEffect 中直接调用 setState：**
- 使用 `onOpenChange` 回调处理对话框关闭时的状态重置
- 使用初始状态而非 useEffect 来同步 props 到 state

```typescript
// ✅ 正确 - 使用 onOpenChange 回调
const handleOpenChange = (newOpen: boolean) => {
  if (!newOpen) {
    setSelectedId('');
    setSelectedItems(new Set());
  }
  onOpenChange(newOpen);
};

// ✅ 正确 - 使用初始状态
const [selectedId, setSelectedId] = useState<string>(memberId || '');

// ❌ 错误 - 在 useEffect 中调用 setState
useEffect(() => {
  if (open && memberId) {
    setSelectedMemberId(memberId);
  }
}, [open, memberId]);
```
