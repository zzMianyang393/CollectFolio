# CollectFolio 自然搜索验证与 Cloudflare 部署实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩充 CollectFolio 的高意图自然搜索覆盖，完善邮箱转化归因，并部署到可验证的 Cloudflare Pages + D1 生产环境。

**Architecture:** Astro 继续生成静态 SEO 页面；Node 验证脚本检查构建产物的技术 SEO；Pages Function 负责校验和写入候补名单；D1 保存邮箱及来源字段；Cloudflare Pages 承载生产站点。

**Tech Stack:** Astro 5、TypeScript、Node test runner、Cloudflare Pages、Pages Functions、D1、Wrangler 4。

---

### Task 1：建立自动验证基线

**Files:**
- Create: `scripts/verify-seo.mjs`
- Modify: `package.json`

- [ ] 编写验证脚本，要求构建产物包含计划中的 SEO 页面，并检查 title、description、canonical、唯一 H1、内部链接、robots 和 sitemap。
- [ ] 运行 `npm run build && npm run verify:seo`，确认因为新增页面尚不存在而失败。
- [ ] 在 `package.json` 增加 `verify:seo` 和统一的 `test` 命令。

### Task 2：扩充高意图 SEO 内容

**Files:**
- Modify: `src/content/blog/pokemon-card-tracking-guide.md`
- Create: `src/content/blog/lego-collection-value-tracker.md`
- Create: `src/content/blog/watch-collection-inventory-guide.md`
- Create: `src/content/blog/vinyl-collection-value-guide.md`
- Create: `src/content/blog/collectibles-insurance-inventory-template.md`
- Create: `src/content/blog/mixed-collectibles-portfolio-tracker.md`

- [ ] 为五个缺失关键词簇分别编写能独立回答搜索问题的正文，并加入相关商业落地页内链。
- [ ] 调整 Pokemon 指南标题和正文内链，避免与 `/pokemon-tracker` 完全同义竞争。
- [ ] 构建并运行 SEO 验证，确认新增路由、元数据和链接通过。

### Task 3：修复技术 SEO 与类型检查

**Files:**
- Modify: `src/layouts/Layout.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `astro.config.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] 先让验证脚本对相对 Open Graph URL 失败。
- [ ] 将 Open Graph 图片规范化为绝对 URL，并为文章输出与可见内容一致的 Article/Breadcrumb 结构化数据。
- [ ] 将 Vite 依赖统一到 Astro 兼容版本并升级 Wrangler 4。
- [ ] 运行 `npm run check`、`npm run build` 和 `npm run verify:seo`。

### Task 4：候补名单归因与防垃圾注册

**Files:**
- Create: `functions/api/waitlist-logic.ts`
- Create: `functions/api/waitlist-logic.test.ts`
- Modify: `functions/api/waitlist.ts`
- Modify: `src/components/WaitlistForm.astro`
- Create: `migrations/0002_waitlist_attribution.sql`

- [ ] 先为邮箱标准化、来源字段截断、蜜罐拒绝和 URL 归因编写失败测试。
- [ ] 提取纯逻辑模块并实现最小校验逻辑，使测试通过。
- [ ] 扩展 D1 写入字段：landing path、referrer、UTM source/medium/campaign。
- [ ] 表单加入蜜罐和浏览器归因，成功后触发 `collectfolio:waitlist-signup` 事件；成功文案只说明已经加入候补名单。
- [ ] 运行候补名单单元测试和完整检查。

### Task 5：建立 Cloudflare 生产资源

**Files:**
- Create: `wrangler.jsonc`

- [ ] 通过 Cloudflare API 创建 `collectfolio-waitlist` D1 数据库并取得 ID。
- [ ] 通过 Cloudflare API 创建 `collectfolio` Pages 项目。
- [ ] 写入 `wrangler.jsonc`，设置近期 compatibility date、Pages 输出目录、D1 绑定和生产允许来源。
- [ ] 对远程 D1 执行 `0001_init.sql` 和 `0002_waitlist_attribution.sql`。
- [ ] 运行 Wrangler 配置检查和最终构建。

### Task 6：部署与线上验收

**Files:**
- Modify: `ANALYTICS.md`
- Modify: `DEPLOYMENT.md`

- [ ] 将 `dist` 和 Pages Functions 部署到 `collectfolio.pages.dev`。
- [ ] 检查 Cloudflare 部署状态为成功。
- [ ] 逐项请求首页、SEO 页面、robots、sitemap、RSS 和 waitlist API。
- [ ] 提交一次带测试标记的候补注册，并在 D1 中确认归因字段写入；随后删除该测试记录。
- [ ] 更新分析和部署文档，记录线上地址以及 GSC 验证与 Sitemap 提交的人工步骤。
- [ ] 运行最终 `npm test`、`npm run check`、`npm run build` 和生产 HTTP 验证。

