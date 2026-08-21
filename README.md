# knowledge-site

个人知识手册站点：**VitePress** 静态文档 + **Decap CMS** 在线后台（`/admin`）+ **Cloudflare Worker** OAuth 桥 + **GitHub Pages** 发布。

- 阅读端：VitePress 构建的静态站点
- 写作端：Decap `/admin/` 登录后可视化编辑 Markdown，保存即提交到 GitHub
- 认证：Cloudflare Worker 完成 GitHub OAuth，Decap 通过 `base_url` 调用
- 发布：`main` 分支 push 触发 GitHub Actions，部署到 GitHub Pages

## 本地开发

```bash
npm install
npm run dev      # 本地预览，默认 http://localhost:5173/knowledge-site/
npm test         # 侧栏配置单元测试
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

> **Node 版本**：项目 CI 使用 Node 22。若本地命令失败，请用 [nvm](https://github.com/nvm-sh/nvm) 切换：`nvm install 22 && nvm use 22`。

Decap 后台本地路径：`http://localhost:5173/knowledge-site/admin/`（OAuth 未配置前登录会失败，属正常）。

## 发布到 GitHub

按顺序完成以下步骤（需真人操作）：

1. **创建公开仓库**  
   在 GitHub 新建仓库，名称 **`knowledge-site`**（须与下方 `base` 一致）。

2. **推送本地代码**  
   ```bash
   git remote add origin git@github.com:<你的用户名>/knowledge-site.git
   git push -u origin main
   ```

3. **启用 GitHub Pages**  
   仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（不要选 Deploy from a branch）。

4. **确认 base 路径**  
   `docs/.vitepress/config.mts` 中 `base: '/knowledge-site/'` 必须与仓库名一致。若仓库改名，同步修改此处。

首次 push 到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布。站点 URL 形如：

`https://<你的用户名>.github.io/knowledge-site/`

## OAuth 打通清单

Decap 在 GitHub Pages 上无法直接使用 OAuth，需先部署 Cloudflare Worker。按顺序执行：

### 1. 创建 GitHub OAuth App

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**：

| 字段 | 值 |
|------|-----|
| Application name | 任意，如 `knowledge-site-cms` |
| Homepage URL | `https://<你的用户名>.github.io/knowledge-site/` |
| Authorization callback URL | `https://<worker 子域>.workers.dev/callback`（部署 Worker 后填入实际 URL） |

记下 **Client ID** 与 **Client Secret**。

### 2. 部署 Cloudflare Worker

```bash
cd oauth-worker
npm install
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID      # 粘贴 OAuth App 的 Client ID
npx wrangler secret put GITHUB_CLIENT_SECRET  # 粘贴 Client Secret
npx wrangler deploy
```

部署成功后终端会输出 Worker URL，形如 `https://knowledge-site-oauth.<账号>.workers.dev`。

### 3. 填写占位符（共 3 处）

也可使用脚本一键替换（须已部署 Worker 并拿到 URL）：

```bash
chmod +x scripts/apply-placeholders.sh   # 首次执行
./scripts/apply-placeholders.sh <github_user> <worker_base_url>
```

示例：`./scripts/apply-placeholders.sh alice https://knowledge-site-oauth.alice.workers.dev`。脚本会替换下文 3 处占位符并打印 `git diff --stat`。

**不要**在自动化脚本里填假用户名；以下占位符须替换为你的真实值：

| 文件 | 占位符 | 替换为 |
|------|--------|--------|
| `docs/public/admin/config.yml` | `REPLACE_GITHUB_USER` | 你的 GitHub 用户名 |
| `docs/public/admin/config.yml` | `REPLACE_WORKER` | Worker 主机名（不含 `https://` 与路径），如 `knowledge-site-oauth.xxx.workers.dev` |
| `docs/.vitepress/config.mts` | `REPLACE_ME` | 你的 GitHub 用户名（用于「在 GitHub 上编辑」链接） |

`config.yml` 示例（替换后）：

```yaml
backend:
  repo: your-username/knowledge-site
  base_url: https://knowledge-site-oauth.your-account.workers.dev
```

OAuth App 的 **Callback URL** 须与 `base_url` 对应：`{base_url}/callback`。

修改后 commit 并 push 到 `main`，等待 Actions 部署完成。

## 日常写作

**方式 A — 在线后台（推荐）**

1. 打开 `https://<你的用户名>.github.io/knowledge-site/admin/`
2. 点击「Login with GitHub」，完成 OAuth
3. 在「指南」集合中新建或编辑文章，保存后自动提交到仓库
4. GitHub Actions 构建完成后，线上站点更新（通常 1–3 分钟）

**方式 B — 本地 Markdown**

1. 编辑 `docs/guide/*.md`（须含 frontmatter：`title`、`description`、`body`）
2. `git add`、`git commit`、`git push origin main`
3. 等待 Actions 部署

图片放在 `docs/public/images/`，文中引用路径为 `/images/文件名`。

## 排查清单

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| OAuth 登录失败 / 弹窗报错 | Worker secret 未设置或错误；Callback URL 与 OAuth App 不一致；`base_url` 写错 | 核对 `wrangler secret list`、OAuth App Callback、`config.yml` 的 `base_url` 三者一致 |
| 后台保存失败 | Token 过期；仓库无写权限 | 重新登录；确认 OAuth scope 含 `repo`；确认对 `knowledge-site` 有 push 权限 |
| 保存成功但线上未更新 | Actions 构建失败；frontmatter 格式错误 | 查看 Actions 日志；确认 YAML frontmatter 闭合、必填字段存在 |
| 新文章不在侧栏 | 文件不在 `docs/guide/` 或使用了子目录 | 文章须落在 **`docs/guide/*.md` 扁平目录**（无嵌套文件夹）；push 后侧栏由 `sidebar.mts` 自动扫描 |

## 第一版不做

以下能力 intentionally 不在第一版范围：

- 评论系统
- 多作者协作与署名
- 混合权限（只读/编辑分级）
- 从 AICoding 仓库批量迁移文档

## 目录结构

```
knowledge-site/
├── docs/                    # VitePress 内容
│   ├── guide/               # 指南文章（Decap 与侧栏均扫描此目录）
│   ├── public/admin/        # Decap 后台（config.yml 含占位符）
│   └── .vitepress/          # VitePress 配置（editLink 含 REPLACE_ME）
├── oauth-worker/            # Cloudflare Worker OAuth 桥
├── .github/workflows/       # GitHub Pages 部署
└── README.md
```
