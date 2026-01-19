# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个使用 Next.js 16、React 19、TypeScript 和 Tailwind CSS 构建的家庭积分管理系统。它支持家庭成员的积分追踪，包括积分操作（加分/扣分）、快捷积分、操作日志、撤销功能和统计图表。

**应用已支持 PWA（渐进式 Web 应用）模式**，可安装到设备主屏幕，支持离线使用和自动更新。

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
- `categories`: 模板分类数组（学习相关、运动健康、生活习惯、行为表现等）
- `templates`: 全局快捷操作模板数组
- `bulletin`: 公告栏内容
- `templateDisplayMode`: 模板展示模式（'operationType' 或 'category'）

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
- `statistics/` - 统计图表（StatisticsDialog、PieChartSection、BarChartSection）
- `template/` - 快捷操作模板（TemplateSection、TemplateCategory、TemplateItem、TemplateCardItem、TemplateManagerDialog、TemplateImportDialog）
- `bulletin/` - 公告栏（BulletinSection）
- `backup/` - 数据备份（BackupButton、BackupDialog、ExportImportDialog）
- `ServiceWorkerProvider.tsx` - PWA Service Worker 提供者
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

系统提供全局快捷操作模板，按实际行为分类组织。模板可批量导入到成员的快捷项中。

**双模式展示功能：**
- 主页面支持两种展示模式，通过标签页切换：
  - **加分/扣分模式**（默认）：按 `operationType` 分为"加分"和"扣分"两大组，忽略实际分类边界
  - **分类展示模式**：按实际行为分类（学习相关、运动健康、生活习惯、行为表现）分组展示
- 展示模式选择持久化到 localStorage，刷新页面后保持
- 其他对话框（批量导入、管理模板）仍按实际分类显示，不受此设置影响

**模板展示选择功能：**
- 每个模板都有 `isVisible` 字段控制是否在主页面的"常用操作"区域显示
- 在"管理模板"对话框的"展示设置"标签页中，用户可以通过复选框控制每个模板的可见性
- 支持按分类批量显示/隐藏该分类下的所有模板
- 主页面只显示 `isVisible !== false` 的模板项
- 按分类分组展示，使用响应式卡片网格布局
- 统一展示框内显示所有可见的模板，空状态时显示友好提示

**模板分类：**
- 每个分类包含名称和排序字段
- 删除分类会级联删除该分类下的所有模板
- 支持完整的增删改查操作

**模板项：**
- 包含名称、分数、操作类型（加分/扣分）
- 包含 `isVisible` 字段（可选，默认为 true）
- 每个模板关联到一个分类
- 支持完整的增删改查操作

**批量导入功能：**
- 从主页面"批量导入"按钮打开导入对话框
- 从 QuickItemsManager 中的"从模板导入"按钮打开（预选当前成员）
- 多选界面，按分类分组显示
- 支持按分类全选/取消全选
- 显示已选数量
- 允许重复导入（同一模板可多次导入到同一成员）

**展示设置功能：**
- 在"管理模板"对话框中新增第三个标签页"展示设置"
- 按分类分组显示所有模板项
- 每个分类有复选框，支持全选/取消全选该分类下所有模板
- 显示每个分类的可见数量统计（例如：9/9）
- 每个模板项有独立的复选框，控制是否在主页面显示
- 点击复选框或标签均可切换状态
- 修改立即生效，自动保存到 localStorage

**默认数据：**
系统预置四个分类和十九个模板：

**学习相关（4个）：**
- 期末考试获奖：+50分
- 考试成绩优秀：+20分
- 学校特殊表彰：+20分
- 作业出色受到表扬：+5分

**运动健康（3个）：**
- 跳绳 100 个：+1分
- 摸高 50 个：+1分
- 户外活动 1 小时：+2分

**生活习惯（7个）：**
- 生日：+100分
- 九点半前睡觉：+2分
- 十点半之后睡：-2分
- 20分钟内吃完饭：+2分
- 不认真吃饭：-1分
- 提现 5 元：-5分
- 玩手机平板10分钟：-2分

**行为表现（5个）：**
- 看电视15分钟：-2分
- 电脑游戏 30 分钟：-10分
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
- 左侧 1/3 宽度：公告栏
- 右侧 2/3 宽度：快捷操作模板
- 移动端自动堆叠为单列布局
- 在 ≥ 1000px 宽度时显示为 1:2 比例的水平布局

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

### 统计图表系统

系统提供本周积分统计的可视化展示，帮助用户了解积分变化趋势。

**功能特性：**
- 每个成员卡片有"统计"按钮（柱状图图标），打开 StatisticsDialog
- 使用标签页切换显示两种统计视图
- 统计数据仅显示当前自然周（周一到周日）的记录
- 使用 `useMemo` 优化性能，避免不必要的重计算
- 响应式设计，支持移动端和桌面端

**饼图统计（项目统计）：**
- 显示四个饼图：加分项（按分数）、加分项（按次数）、扣分项（按分数）、扣分项（按次数）
- 采用 2x2 网格布局，移动端堆叠为单列
- 按分数的饼图：使用 `totalPoints` 作为饼图大小
- 按次数的饼图：使用 `count` 作为饼图大小
- 四个饼图下方附一个汇总数据表格，包含所有项目的次数和总积分
- 表格中用彩色圆点标识对应项目，加分项显示绿色，扣分项显示红色
- 颜色依次使用预设颜色，确保不重复
- 加分项和扣分项都使用正数显示
- 饼图扇区边上不显示文字标签（更简洁），通过悬停查看 Tooltip 或参考下方表格

**柱状图统计（每日统计）：**
- 分组柱状图，显示周一到周日的每天数据
- 加分和扣分并排显示，便于对比
- X 轴：星期几（周一到周日）
- Y 轴：积分
- 鼠标悬停显示具体分数
- 图例使用 Bar 组件的 `name` 属性（"加分"和"扣分"），确保正确显示

**图表库：**
- 使用 Recharts 图表库（React 友好、TypeScript 支持、Tailwind CSS 兼容）
- 图表配置文件：[src/lib/chartColors.ts](src/lib/chartColors.ts)
- 20 个预设颜色（无黑色和白色），超出预设数量时自动生成新颜色

**数据过滤规则：**
- 只统计当前自然周的数据（周一 00:00:00 到周日 23:59:59）
- 排除 `isUndone === true` 的日志
- 排除 `operationType === 'undo'` 的日志
- 只统计 `add` 和 `deduct` 操作

**颜色方案：**
- 预设 20 种鲜艳颜色：蓝色、深绿色、紫色、橙色、粉色、金黄色、青色、红色、蓝绿色、靛蓝色、皇家蓝、翠绿色、琥珀色、洋红色、朱红色、天蓝色、橄榄绿、玫瑰色、祖母绿、珊瑚色
- 所有颜色使用具体 HSL 值（不使用 CSS 变量）
- 柱状图：加分用蓝色（第 1 个颜色），扣分用深绿色（第 2 个颜色）
- 饼图：依次使用预设颜色，加分项从第 0 个开始，扣分项从加分项之后继续

**组件结构：**

**[src/components/statistics/StatisticsDialog.tsx](src/components/statistics/StatisticsDialog.tsx)**
- 主对话框组件，包含标签页切换
- 显示当前周的日期范围
- 管理数据过滤和转换逻辑

**[src/components/statistics/PieChartSection.tsx](src/components/statistics/PieChartSection.tsx)**
- 饼图组件，显示四个饼图（加分/扣分 × 分数/次数）
- `SinglePieChart` - 单个饼图组件，支持按分数或按次数显示
- `SummaryTable` - 汇总数据表格，显示所有项目的次数和总积分
- 使用共享颜色配置，确保四个饼图和表格的颜色一致

**[src/components/statistics/BarChartSection.tsx](src/components/statistics/BarChartSection.tsx)**
- 柱状图组件，显示每日加分和扣分统计
- 分组柱状图设计

**[src/lib/statistics.ts](src/lib/statistics.ts)**
- 数据转换工具函数
- `filterCurrentWeekLogs()` - 过滤当前周日志
- `transformToAddPieChartData()` - 转换为加分项饼图数据（按分数排序）
- `transformToDeductPieChartData()` - 转换为扣分项饼图数据（按分数排序，使用绝对值）
- `transformToAddPieChartDataByCount()` - 转换为加分项饼图数据（按次数排序）
- `transformToDeductPieChartDataByCount()` - 转换为扣分项饼图数据（按次数排序，使用绝对值）
- `transformToBarChartData()` - 转换为柱状图数据

**[src/lib/chartColors.ts](src/lib/chartColors.ts)**
- 图表颜色配置
- `PRESET_COLORS` - 20 个预设颜色数组
- `BAR_CHART_COLORS` - 柱状图专用颜色（加分、扣分）
- `getColor()` - 获取颜色的函数（支持超出预设数量时生成新颜色）

### 类型定义

所有类型集中在 [src/types/index.ts](src/types/index.ts)：
- `Member` - 家庭成员，包含快捷项和总积分
- `QuickPointItem` - 积分操作的快捷配置，支持 `operationType` 字段
- `PointLog` - 操作记录，包含撤销状态和关联日志引用
- `TemplateCategory` - 模板分类
- `TemplateItem` - 全局快捷操作模板，包含 `isVisible` 字段
- `Bulletin` - 公告栏内容
- `TemplateDisplayMode` - 模板展示模式类型（'operationType' | 'category'）
- `AppState` - Zustand store 接口，包含所有状态和操作
- `TemplateState` - 模板和公告相关的状态和操作，包含展示管理操作和展示模式
- `BackupConfig` - 备份配置（Gist ID、GitHub Token、最后同步时间）
- `GistResponse` - GitHub Gist API 响应类型
- `GistFile` - Gist 文件类型

### 工具函数

[lib/utils.ts](lib/utils.ts) 包含：
- `formatDateTime()` - 使用 Intl API 的中文日期格式化
- `getOperationTypeText()` - 将操作类型映射为中文文本
- `getOperationTypeColor()` - 返回操作类型的 Tailwind 颜色类
- `getCurrentWeekRange()` - 获取当前自然周的时间范围（周一 00:00:00 到周日 23:59:59）
- `getDayOfWeek()` - 获取星期几的中文显示文本
- `getDateKey()` - 获取日期键值（YYYY-MM-DD 格式，用于数据分组）
- `cn()` - 合并 Tailwind 类的工具函数

[lib/statistics.ts](lib/statistics.ts) 包含统计相关函数：
- `filterCurrentWeekLogs()` - 过滤当前周的日志（排除已撤销和撤销操作）
- `transformToPieChartData()` - 转换为饼图数据（按项目名称聚合，按分数排序）
- `transformToAddPieChartData()` - 转换为加分项饼图数据（按分数排序）
- `transformToDeductPieChartData()` - 转换为扣分项饼图数据（按分数排序，使用绝对值）
- `transformToAddPieChartDataByCount()` - 转换为加分项饼图数据（按次数排序）
- `transformToDeductPieChartDataByCount()` - 转换为扣分项饼图数据（按次数排序，使用绝对值）
- `transformToBarChartData()` - 转换为柱状图数据（按日期和操作类型聚合）

[lib/chartColors.ts](lib/chartColors.ts) 包含图表颜色配置：
- `PRESET_COLORS` - 20 个预设颜色数组
- `BAR_CHART_COLORS` - 柱状图专用颜色常量
- `getColor()` - 获取颜色的函数（支持超出预设数量时生成新颜色）

[lib/backup.ts](lib/backup.ts) 包含数据备份相关函数：
- `getAppData()` - 从 localStorage 获取应用数据
- `saveAppData()` - 将数据保存到 localStorage 并刷新页面
- `uploadToGist()` - 上传数据到 GitHub Gist
- `downloadFromGist()` - 从 GitHub Gist 下载数据
- `createGist()` - 创建新的 GitHub Gist
- `validateGistConfig()` - 验证 Gist 配置是否有效
- `exportToZip()` - 导出数据为 ZIP 文件
- `importFromZip()` - 从 ZIP 文件导入数据
- `resetSystem()` - 重置系统到初始状态（清除业务数据，保留备份配置）

### 数据持久化

Zustand store 使用 `persist` 中间件：
- localStorage 键名为 `family-points-storage`
- 当前版本为 6（version 字段）
- 数据在页面刷新和浏览器重启后保留
- **重置系统**：在"导出/导入"对话框中点击"重置系统"按钮，清除所有业务数据并恢复到初始状态

**版本迁移：**
- 版本 2 → 版本 3：添加了模板分类、模板项和公告栏
- 版本 3 → 版本 4：更新默认模板内容为18个新模板（加分项9个、扣分项9个）
- 版本 4 → 版本 5：添加模板展示选择功能（`isVisible` 字段）
- 版本 5 → 版本 6：重构模板分类系统
  - 将"加分项"和"扣分项"两个分类改为按实际行为分类（学习相关、运动健康、生活习惯、行为表现）
  - 新增"生日"模板（+100分）
  - 添加 `templateDisplayMode` 状态，支持"加分/扣分"和"分类展示"两种模式
  - 智能迁移：仅当用户使用默认分类时自动迁移，自定义分类完全保留
  - 用户现有数据（成员、日志）完整保留

## UI 组件

项目使用 shadcn/ui 组件（复制到项目中）。添加新组件：
```bash
pnpm dlx shadcn@latest add <组件名称>
```

已有组件：button、dialog、input、card、alert-dialog、scroll-area、checkbox、tabs、textarea、label、alert

**第三方库：**
- `recharts` - 图表库，用于统计可视化
- `jszip` - ZIP 文件处理，用于数据备份导入/导出
- `workbox-window`、`workbox-build` - PWA Service Worker 支持
- `sharp` - 图像处理，用于生成 PWA 图标

## 样式

使用 Tailwind CSS v4 和 `@import "tailwindcss"` 语法。颜色方案使用 CSS 变量支持亮/暗模式，定义在 [app/globals.css](app/globals.css)。

使用 [lib/utils.ts](lib/utils.ts) 中的 `cn()` 工具函数来合并 Tailwind 类。

### 响应式布局和自定义断点

项目使用自定义 CSS 媒体查询实现精确的响应式断点，定义在 [src/app/globals.css](src/app/globals.css)：

**积分卡布局：**
- **< 768px**（移动端）：1列
- **768px - 999px**（平板）：2列
- **≥ 1000px**（桌面）：3列
- 使用 `.member-grid-3-cols` 自定义类

**公告栏和模板布局：**
- **< 1000px**：垂直堆叠
- **≥ 1000px**：水平排列，比例 1:2（公告栏占 1/3，模板占 2/3）
- 使用 `.bulletin-template-grid`、`.bulletin-col-span-1`、`.template-col-span-2` 自定义类

**实现方式：**
在 Tailwind CSS v4 中，通过在 `@layer base` 之后添加自定义媒体查询来实现断点：
```css
@media (min-width: 1000px) {
  .member-grid-3-cols {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

这种方式比使用 Tailwind 的任意值语法（如 `min-[1000px]:grid-cols-3`）更可靠，避免了 CSS 加载顺序导致的问题。

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
- 模板的 `isVisible` 字段控制是否在主页面显示，默认为 true

### 模板展示组件结构

**[src/components/template/TemplateCardItem.tsx](src/components/template/TemplateCardItem.tsx)**
- 卡片样式的模板项展示组件
- 显示模板名称、加分/扣分图标和分数
- 使用颜色区分加分（绿色）和扣分（红色）
- 支持悬停阴影效果

**[src/components/template/TemplateSection.tsx](src/components/template/TemplateSection.tsx)**
- 主展示区域，使用统一的卡片容器
- 支持两种展示模式（通过 Tabs 组件切换）：
  - 加分/扣分模式：按 `operationType` 分组显示
  - 分类展示模式：按实际分类分组显示
- 通过 `useMemo` 过滤可见模板（`isVisible !== false`）
- 使用响应式网格布局（移动端 1 列，平板 2-3 列，桌面 3-4 列）
- 空状态时显示友好提示

**[src/components/template/TemplateManagerDialog.tsx](src/components/template/TemplateManagerDialog.tsx)**
- 管理模板的对话框，包含三个标签页：
  - 分类管理：增删改查模板分类
  - 项目管理：增删改查模板项
  - 展示设置：控制每个模板的可见性
- 注意：此对话框始终按实际分类显示，不受主页面展示模式影响

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

## 数据备份与自动同步系统

系统提供两种数据备份方式，确保数据安全和跨设备同步。

### 1. GitHub Gist 自动同步（推荐）

通过 GitHub Gist API 实现云端备份和多设备自动同步。

**核心功能：**
- **自动下载**：页面刷新时，如果远程版本更新，自动下载并刷新
- **自动上传**：数据变化时，自动上传到 Gist（2.5 秒防抖）
- **版本冲突检测**：上传前检查远程版本，冲突时提示用户
- **冲突解决**：以 Gist 为准，仅提示用户不自动覆盖

**配置要求：**
- GitHub Personal Access Token（需要 `gist` 权限）
- Gist ID（可自动创建新 Gist 或手动输入已存在的 Gist ID）
- 自动同步开关（默认禁用，需手动启用）

**使用流程：**
1. 点击页面右上角的 "Gist 同步" 按钮
2. 填写 GitHub Token（在 GitHub Settings {'->'} Developer settings {'->'} Personal access tokens {'->'} Tokens (classic) 创建）
3. 点击"创建新 Gist"自动生成 Gist ID，或手动输入已存在的 Gist ID
4. 点击"验证配置"确认配置正确
5. **勾选"启用自动同步"复选框**（默认不勾选，保护隐私）
6. 点击"保存配置"保存到 localStorage
7. 自动同步开始工作：
   - 数据变化后 2.5 秒自动上传
   - 页面刷新时自动下载远程更新
8. 手动同步：使用"上传到 Gist"和"从 Gist 下载"按钮

**同步状态指示器：**
- 显示在右上角按钮区域（仅启用自动同步时）
- 状态类型：
  - `idle`（空闲）：灰色云图标
  - `syncing`（同步中）：蓝色旋转图标
  - `success`（成功）：绿色勾图标 + "已同步于 X分钟前"
  - `error`（错误）：红色叉图标 + 错误信息
  - `conflict`（冲突）：橙色警告图标 + "远程版本较新，无法上传"

**技术实现：**

**版本控制机制：**
- 使用 ISO 8601 时间戳作为版本号（例如：`2026-01-19T10:30:45.123Z`）
- 字符串比较即可判断版本新旧
- 版本号内嵌到应用数据中（`_syncVersion` 字段）
- 页面刷新后版本信息保留，避免误报冲突

**数据包装结构：**
```typescript
interface GistDataPackage {
  version: string;           // ISO 8601 时间戳
  timestamp: number;         // Unix 时间戳（毫秒）
  deviceId: string;          // 设备唯一标识符
  checksum: string;          // SHA-256 校验和
  data: {
    state: {
      // 应用数据（members、logs、templates 等）
      _syncVersion: string;  // 内嵌版本号（刷新后保留）
    };
  };
}
```

**工作流程：**

**自动上传（数据变化时）：**
1. 监听 Zustand store 所有状态变化
2. 防抖 2.5 秒后触发上传
3. 轻量级获取远程 Gist 元数据（不下载完整内容）
4. 比较版本：
   - 如果远程版本 > 本地版本 → 冲突，取消上传，提示用户
   - 否则 → 继续上传
5. 创建新的 `GistDataPackage`（新版本号）
6. 上传到 Gist
7. 更新本地版本号
8. 更新同步状态为 'success'

**自动下载（页面刷新时）：**
1. 等待 Zustand store 水合完成
2. 检查是否启用自动同步
3. 轻量级获取远程 Gist 元数据
4. 比较版本：
   - 如果没有本地版本 → 下载
   - 如果远程版本 > 本地版本 → 下载
   - 否则 → 不操作
5. 如果需要下载：
   - 下载完整数据
   - 解析 `GistDataPackage`
   - 保存到 localStorage（包含 `_syncVersion`）
   - 刷新页面

**性能优化：**
- **防抖机制**：2.5 秒延迟，避免频繁 API 请求
- **轻量级版本检查**：`fetchGistInfo()` 只获取元数据（~1KB），不下载完整内容（~100KB）
- **冲突检测优化**：上传前只检查版本号，不下载完整数据

**配置存储：**
- 同步配置存储在 `syncStore`（Zustand + persist）
- localStorage 键名：`sync-config-storage`
- 包含：`gistId`、`githubToken`、`autoSyncEnabled`、`localVersion`、`remoteVersion`、`syncStatus`、`lastSyncError`、`deviceId`

**向后兼容性：**
- 自动检测旧格式 Gist 数据，自动包装为新格式
- 新旧格式数据都可以正常读取
- 第一次上传时自动迁移到新格式

**文件结构：**

**核心库文件：**
- [src/lib/backup.ts](src/lib/backup.ts) - 备份和同步基础功能
  - `getAppData()` - 获取应用数据（移除 `_syncVersion`）
  - `getLocalVersion()` - 获取本地版本号
  - `saveAppData()` - 保存数据并刷新页面
  - `downloadFromGist()` - 下载数据（返回版本号）
  - `uploadToGist()` - 上传数据
  - `createGistDataPackage()` - 创建版本化数据包
  - `parseGistDataFile()` - 解析数据（支持新旧格式）
  - `fetchGistInfo()` - 轻量级获取元数据

- [src/lib/version.ts](src/lib/version.ts) - 版本工具
  - `generateVersion()` - 生成 ISO 8601 时间戳
  - `compareVersions()` - 比较两个版本号
  - `getChecksum()` - 计算 SHA-256 校验和

- [src/lib/sync.ts](src/lib/sync.ts) - 同步核心逻辑
  - `shouldDownloadRemote()` - 判断是否应该下载
  - `autoDownloadFromGist()` - 自动下载逻辑
  - `autoUploadWithConflictCheck()` - 自动上传逻辑（带冲突检测）
  - `debounce()` - 防抖函数

**状态管理：**
- [src/store/syncStore.ts](src/store/syncStore.ts) - 同步配置 Store
  - 存储 gistId、githubToken、autoSyncEnabled 等
  - 提供 setBackupConfig、updateSyncStatus 等 actions

**React Hooks：**
- [src/hooks/useAutoSync.ts](src/hooks/useAutoSync.ts) - 自动同步 Hook
  - 监听 appStore 变化
  - 防抖后触发自动上传

**组件：**
- [src/components/SyncProvider.tsx](src/components/SyncProvider.tsx) - 同步提供者
  - 在应用启动时初始化自动下载
  - 初始化 useAutoSync hook

- [src/components/backup/SyncStatusIndicator.tsx](src/components/backup/SyncStatusIndicator.tsx) - 同步状态指示器
  - 显示同步状态图标和文本
  - 格式化时间显示（"刚刚"、"5分钟前"等）

- [src/components/backup/BackupButton.tsx](src/components/backup/BackupButton.tsx) - 备份按钮
  - 显示同步状态指示器（启用自动同步时）
  - 打开 Gist 同步对话框

- [src/components/backup/BackupDialog.tsx](src/components/backup/BackupDialog.tsx) - Gist 同步对话框
  - 配置 GitHub Token 和 Gist ID
  - 自动同步开关（复选框）
  - 显示同步状态
  - 手动上传/下载按钮

**重要注意事项：**

**避免无限循环：**
- `SyncProvider` 的 `useEffect` 依赖数组**不能包含 `syncStore`**
- 使用 `eslint-disable-next-line react-hooks/exhaustive-deps` 注释
- 原因：`updateSyncStatus` 会更新 `syncStore`，导致无限循环

**版本号持久化：**
- 版本号必须内嵌到应用数据中（`_syncVersion` 字段）
- 不能只存储在 `syncStore` 中（刷新后会丢失）
- `getAppData()` 提取并移除 `_syncVersion`（不上传到 Gist）
- `downloadFromGist()` 下载时写入 `_syncVersion`
- `getLocalVersion()` 读取 `_syncVersion` 用于版本比较

**类型定义：**
- `SyncStatus` - 同步状态类型：'idle' | 'syncing' | 'success' | 'error' | 'conflict'
- `GistDataPackage` - Gist 数据包装结构
- `BackupConfig` - 扩展，新增 `autoSyncEnabled`、`deviceId`、`localVersion`、`remoteVersion`、`syncStatus`、`lastSyncError`
- `TemplateState` - 扩展，新增 `_syncVersion` 字段（不参与业务逻辑）

### 2. ZIP 文件导出/导入（备用方案）

当 GitHub 不可用时，可使用 ZIP 文件进行本地备份。

**导出功能：**
- 点击"导出/导入"按钮
- 点击"导出 ZIP 文件"
- 系统将 `family-points-data.json` 打包成 ZIP 文件并自动下载
- 文件名格式：`family-points-backup-YYYY-MM-DD.zip`

**导入功能：**
- 点击"导出/导入"按钮
- 选择 ZIP 文件
- 系统自动解压并读取数据文件
- 导入后会覆盖当前数据并自动刷新页面

**重置系统功能：**
- 点击"导出/导入"按钮
- 滚动到对话框底部的"重置系统"区域（红色标题）
- 点击"重置系统"按钮，打开确认对话框
- 确认对话框清晰列出将被清除和保留的数据
- 点击"确认重置"后：
  - 清除所有业务数据（成员、日志、模板、分类、公告栏）
  - 保留备份配置（GitHub Token 和 Gist ID）
  - 页面自动刷新，恢复到初始状态
- 操作不可撤销，建议重置前先导出备份

**技术实现：**
- 使用 `jszip` 库处理 ZIP 文件
- 导出：JSON {'->'} ZIP Blob {'->} 下载
- 导入：File {'->'} JSZip {'->'} JSON {'->'} localStorage
- 重置：移除 `family-points-storage` 键，保留 `sync-config-storage` 键，刷新页面

### 组件结构

**[src/components/backup/BackupButton.tsx](src/components/backup/BackupButton.tsx)**
- 主入口组件，显示两个按钮
- 显示同步状态指示器（启用自动同步时）
- 管理 Gist 同步对话框和导出/导入对话框的开关状态

**[src/components/backup/BackupDialog.tsx](src/components/backup/BackupDialog.tsx)**
- Gist 同步配置对话框
- 包含配置表单、验证逻辑、上传/下载功能
- 自动同步开关（复选框）
- 显示同步状态和操作消息

**[src/components/backup/ExportImportDialog.tsx](src/components/backup/ExportImportDialog.tsx)**
- 导出/导入对话框
- 提供导出按钮和文件选择器
- 显示操作状态和结果
- **重置系统功能**：提供系统重置按钮和二次确认对话框（AlertDialog）

### 使用建议

**自动同步用户：**
1. **首次配置**：配置 GitHub Token 并创建新 Gist，勾选"启用自动同步"
2. **正常使用**：数据变化后自动上传，页面刷新时自动下载
3. **多设备同步**：在多设备上使用相同的 Gist ID 和 Token
4. **冲突处理**：如遇冲突提示，点击"从云端下载"同步最新数据

**手动同步用户：**
1. **首次使用**：配置 GitHub Token 并创建新 Gist（不勾选自动同步）
2. **定期备份**：每次重要操作后点击"上传到 Gist"
3. **跨设备同步**：在多设备上使用相同的 Gist ID 和 Token，手动上传/下载

**备用方案：**
4. **网络问题**：使用"导出 ZIP"作为备用方案
5. **数据迁移**：导出 ZIP 文件可长期保存，用于数据恢复
6. **重置系统**：当需要清除所有数据并重新开始时使用，重置前建议先导出备份

### 安全注意事项

- GitHub Token 存储在浏览器 localStorage 中，仅用于 Gist API 调用
- Token 只需要 `gist` 权限，不需要访问其他 GitHub 资源
- 建议创建专用的 Fine-grained token 或 classic token
- Gist 默认为私有（public: false）
- 定期更新 Token 以提高安全性

## PWA（渐进式 Web 应用）

应用已完全支持 PWA 模式，提供原生应用般的体验。

### 核心功能

**1. 离线支持**
- Service Worker 缓存静态资源（HTML、CSS、JS、图片、字体）
- 离线状态下可正常浏览已缓存内容
- 网络恢复后自动同步更新

**2. 应用安装**
- **桌面端**：浏览器地址栏显示安装按钮，点击后添加到桌面/应用列表
- **移动端**：通过浏览器菜单"添加到主屏幕"
- 安装后以独立窗口运行，类似原生应用

**3. 自动更新**
- 检测到新版本时弹出提示
- 用户确认后立即更新并刷新
- 支持跳过等待，强制激活新版本

**4. 在线/离线检测**
- 实时监测网络连接状态
- 控制台输出在线/离线日志
- 为离线提示 UI 提供状态支持

### 文件结构

**核心文件：**
- **[public/manifest.json](public/manifest.json)** - Web App 清单文件
  - 应用名称、描述、图标
  - 主题色、背景色
  - 显示模式（standalone）
  - 快捷方式配置

- **[public/sw.js](public/sw.js)** - Service Worker 脚本
  - 预缓存关键资源
  - 运行时缓存策略
  - 更新管理和清理旧缓存
  - 消息通信处理

- **[src/hooks/useRegisterServiceWorker.ts](src/hooks/useRegisterServiceWorker.ts)** - Service Worker 注册 Hook
  - 自动注册（仅生产环境）
  - 更新检测
  - 在线/离线状态追踪
  - 跳过等待功能

- **[src/components/ServiceWorkerProvider.tsx](src/components/ServiceWorkerProvider.tsx)** - PWA 提供者组件
  - 包装整个应用
  - 管理更新提示
  - 监听网络状态变化

- **[src/app/layout.tsx](src/app/layout.tsx)** - 根布局
  - 导入 ServiceWorkerProvider
  - 配置 PWA 元数据
  - 添加 manifest 链接和 meta 标签

**资源文件：**
- **[public/icons/](public/icons/)** - PWA 图标目录
  - icon-72x72.png 到 icon-512x512.png（8 个尺寸）
  - favicon.png 和 favicon.ico
  - 所有图标使用蓝色主题（#3b82f6），显示"积分"文字

### 缓存策略

Service Worker 使用三种缓存策略：

1. **StaleWhileRevalidate**（同源资源）
   - 优先返回缓存（快速）
   - 后台更新缓存（新鲜）
   - 适用于：HTML、CSS、JS 文件

2. **CacheFirst**（静态资源）
   - 优先返回缓存
   - 缓存不存在才请求网络
   - 适用于：图片、字体

3. **NetworkFirst**（API 请求）
   - 优先请求网络
   - 网络失败时返回缓存
   - 适用于：API 调用（未来扩展）

### 开发与测试

**开发模式：**
- Service Worker 在开发模式下**不注册**（避免缓存干扰）
- 正常开发流程不受影响

**生产模式：**
```bash
# 构建生产版本
pnpm build

# 本地测试生产构建
npx serve out
# 或
pnpm start
```

**验证 PWA：**
1. 打开 Chrome DevTools → Application 标签页
2. 检查以下部分：
   - **Manifest**：验证清单文件加载正确
   - **Service Workers**：确认 SW 已注册并激活
   - **Cache Storage**：查看缓存内容
3. 运行 Lighthouse 审计（Progressive Web App 类别）

### 图标生成

使用脚本生成 PWA 图标：
```bash
node scripts/generate-png-icons.js
```

**自定义图标：**
1. 编辑 `scripts/generate-png-icons.js` 中的 SVG 模板
2. 修改颜色、文字或图形
3. 重新运行脚本
4. 重新构建项目

### 浏览器兼容性

**完整支持：**
- Chrome/Edge 90+（桌面和移动）
- Firefox 90+（桌面和移动）

**部分支持：**
- Safari 15+（iOS 支持有限，不支持安装提示）

**最低要求：**
- HTTPS（或 localhost）
- 现代 Service Worker API
- Web App Manifest 支持

### 配置说明

**应用元数据（layout.tsx）：**
```typescript
export const metadata: Metadata = {
  manifest: "/point-card/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "积分卡",
  },
  icons: { /* 图标配置 */ },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  // ... 其他视口配置
};
```

**Manifest 配置（manifest.json）：**
- `display: "standalone"` - 独立窗口模式
- `orientation: "any"` - 支持任意方向
- `start_url: "/point-card/"` - 启动 URL
- `shortcuts` - 应用快捷方式（添加成员、查看统计）

### 更新流程

1. 新版本部署
2. 用户访问应用
3. Service Worker 检测到更新
4. 弹出提示："新版本可用！点击'确定'立即更新，或点击'取消'下次更新。"
5. 用户确认
6. Service Worker 跳过等待并激活
7. 页面自动刷新，加载新版本

### 技术特点

**无需大改架构：**
- Zustand + localStorage 完美兼容 PWA
- 现有状态管理无需修改
- 所有功能正常工作

**性能优化：**
- 预缓存关键资源，提升加载速度
- 智能缓存策略，平衡速度和新鲜度
- 离线优先，渐进增强

**用户体验：**
- 一键安装，无需应用商店
- 原生应用般的界面和交互
- 自动更新，无需手动刷新

### 故障排查

**Service Worker 未注册：**
- 确认使用 HTTPS 或 localhost
- 检查浏览器控制台错误
- 验证 `/point-card/sw.js` 可访问

**应用无法安装：**
- 检查 manifest.json 语法
- 确认图标文件存在且可访问
- 运行 Lighthouse PWA 审计

**缓存问题：**
- DevTools → Application → Clear storage → Clear site data
- Service Workers → Unregister 注册的 SW
- 刷新页面重新注册

### 未来扩展

可选的 PWA 增强功能：
1. **后台同步**（Background Sync）- 离线操作队列，联网后自动同步
2. **推送通知**（Push Notifications）- 重要事件提醒
3. **定期同步**（Periodic Sync）- 定期刷新数据
4. **分享目标**（Share Target）- 接受来自其他应用的分享
5. **离线提示 UI** - 显示当前在线/离线状态

### 文档

详细实现指南请参考：[PWA_GUIDE.md](PWA_GUIDE.md)

