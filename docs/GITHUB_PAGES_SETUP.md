# GitHub Pages 部署设置检查清单

## 📋 部署前检查清单

### 1. GitHub 仓库设置检查

#### ✅ 步骤 1: 进入 GitHub Pages 设置

1. 打开你的 GitHub 仓库
2. 点击顶部的 **Settings** 标签
3. 在左侧菜单中找到 **Pages** (通常在 "Code and automation" 部分)
4. 点击进入 Pages 设置页面

#### ✅ 步骤 2: 检查 Build and deployment 设置

在 Pages 设置页面中，查看 **"Build and deployment"** 部分：

**正确的配置应该是：**

```
Source: GitHub Actions
```

❌ **如果看到的是：**
- "Deploy from a branch" - 这是**错误的**配置
- Branch: gh-pages 或 master - 这也是**错误的**

✅ **应该改为：**
1. 点击 "Source" 旁边的 **"Edit"** 按钮（或齿轮图标）
2. 在下拉菜单中选择 **"GitHub Actions"**
3. 点击 **"Save"** 保存

#### ✅ 步骤 3: 验证自定义域名（可选）

如果你使用自定义域名：
1. 在 **"Custom domain"** 部分输入你的域名
2. 等待 DNS 检查通过
3. **推荐**：勾选 **"Enforce HTTPS"**

### 2. GitHub Actions 工作流验证

#### ✅ 检查工作流文件

确认 `.github/workflows/nextjs.yml` 文件存在且配置正确：

```yaml
name: Deploy Next.js site to Pages

on:
  push:
    branches: ["master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build with Next.js
        run: pnpm build
        env:
          NODE_ENV: production

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. 触发部署

#### ✅ 方式 1: 自动触发（推送代码）

```bash
git add .
git commit -m "fix: 确保所有配置正确"
git push origin master
```

#### ✅ 方式 2: 手动触发

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **"Deploy Next.js site to Pages"** 工作流
4. 点击右侧的 **"Run workflow"** 按钮
5. 选择分支（master）
6. 点击 **"Run workflow"** 确认

### 4. 监控部署状态

#### ✅ 查看部署日志

1. 在 GitHub 仓库中点击 **Actions** 标签
2. 点击最新的工作流运行记录
3. 点击 **"build"** 和 **"deploy"** job 查看详细日志
4. 确认所有步骤都显示绿色的 ✅

#### ✅ 检查关键日志输出

在 "Build with Next.js" 步骤中应该看到：
```
✓ Compiled successfully
✓ Generating static pages
Route (app)
┌ ○ /
└ ○ /_not-found
```

在 "Upload artifact" 步骤中应该看到：
```
Total size: XXX MB
[Upload artifact] Finished with success
```

### 5. 验证部署

#### ✅ 访问部署的网站

GitHub Pages 的 URL 格式：
```
https://[你的用户名].github.io/[仓库名]/
```

对于本项目：
```
https://[你的用户名].github.io/point-card/
```

#### ✅ 检查 PWA 功能

1. 打开 Chrome DevTools (F12)
2. 切换到 **Application** 标签
3. 检查以下部分：
   - **Manifest**: 应该显示 `manifest.json` 内容
   - **Service Workers**: 应该看到 `sw.js` 已激活
   - **Cache Storage**: 应该看到缓存数据

#### ✅ 测试离线功能

1. 在 DevTools 的 **Application** → **Service Workers** 中
2. 勾选 **"Offline"** 复选框
3. 刷新页面
4. 页面应该仍然可以正常显示（已缓存的内容）

## 🐛 常见问题排查

### 问题 1: 部署成功但页面显示 404

**可能原因：**
- basePath 配置错误
- 文件路径不正确

**解决方案：**
1. 确认 `next.config.ts` 中的 `basePath: '/point-card'` 正确
2. 确认访问的 URL 包含路径：`https://xxx.github.io/point-card/`
3. 检查 `out/` 目录结构是否正确

### 问题 2: CSS 或 JavaScript 无法加载

**可能原因：**
- assetPrefix 配置问题
- 静态资源路径错误

**解决方案：**
1. 确认 `next.config.ts` 中配置了 `assetPrefix: '/point-card'`
2. 检查构建后的 HTML 文件中的资源路径
3. 所有路径应该以 `/point-card/` 开头

### 问题 3: Service Worker 无法注册

**可能原因：**
- sw.js 文件路径错误
- scope 配置不正确

**解决方案：**
1. 检查 `out/sw.js` 文件是否存在
2. 检查 Service Worker 注册代码中的 scope
3. 确认注册路径为 `/point-card/sw.js`

### 问题 4: PWA 无法安装

**可能原因：**
- manifest.json 路径错误
- 图标文件缺失
- HTTPS 问题

**解决方案：**
1. 确认 `out/manifest.json` 文件存在
2. 确认所有图标文件在 `out/icons/` 目录中
3. 确保网站使用 HTTPS（GitHub Pages 默认支持）

## 📊 部署成功标志

当你看到以下内容时，说明部署成功：

1. ✅ GitHub Actions 显示绿色的 ✓
2. ✅ 可以访问 `https://[用户名].github.io/point-card/`
3. ✅ 页面样式正常显示
4. ✅ JavaScript 功能正常工作
5. ✅ DevTools 显示 Service Worker 已注册
6. ✅ DevTools 显示 Manifest 已加载
7. ✅ 浏览器显示"安装应用"提示（可能需要刷新）

## 🔄 后续维护

### 更新部署

每次推送代码到 master 分支时，GitHub Actions 会自动：

1. 运行 lint 检查
2. 构建生产版本
3. 部署到 GitHub Pages

### 监控部署

建议定期检查：
- GitHub Actions 运行状态
- 网站访问日志
- 错误报告（如果有）

## 📝 快速命令参考

```bash
# 完整的部署流程
git add .
git commit -m "feat: 更新功能"
git push origin master

# 本地测试构建
pnpm build
npx serve out

# 检查构建输出
ls -la out/
ls -la out/icons/
cat out/index.html | grep -E "(manifest|sw\.js)"
```

## ✅ 最终检查清单

部署前确认：

- [ ] GitHub Pages Source 设置为 "GitHub Actions"
- [ ] `.github/workflows/nextjs.yml` 文件存在
- [ ] `next.config.ts` 配置正确（output, basePath, assetPrefix）
- [ ] 本地构建成功（`pnpm build`）
- [ ] Lint 检查通过（`pnpm lint`）
- [ ] 所有 PWA 文件存在（manifest.json, sw.js, icons/）

部署后验证：

- [ ] GitHub Actions 运行成功
- [ ] 可以访问网站 URL
- [ ] 页面显示正常
- [ ] Service Worker 已注册
- [ ] Manifest 已加载
- [ ] 离线功能正常
