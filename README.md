# landmark283.github.io

个人主页与博客。内容写在 Markdown 里，`node build.mjs` 编译成静态 HTML，推上去 GitHub Pages 直接发布。

线上地址：<https://landmark283.github.io>

## 日常流程

```bash
# 1. 在 docs/ 里写或改 Markdown
# 2. 生成 HTML
node build.mjs
# 3. 发布
git add -A && git commit -m "post: 标题" && git push
```

推送到 `docs/` 的改动也会触发 GitHub Actions 自动跑一遍 `node build.mjs` 并把产物提交回来，所以第 2 步忘了也不至于漏发。

构建脚本只用 Node 内置模块，没有依赖，不用 `npm install`。

## 目录

```
docs/                         内容源（Markdown）
├─ 罗格的个人简介.md            首页数据：姓名、一句话、简介、邮箱、近况表
├─ 文章/                       自己写的随笔、日志
└─ 学习记录/                    学习笔记
build.mjs                     构建脚本：Markdown → HTML
index.html                    首页          ← 自动生成
blog.html                     文章列表       ← 自动生成
posts/<slug>.html             每篇文章一页    ← 自动生成
style.css                     全站样式
404.html                      404 页（手写，不被构建覆盖）
favicon.svg                   标签页图标
.nojekyll                     让 Pages 跳过 Jekyll
```

## 写一篇文章

在 `docs/` 下面任意位置新建 `.md`，开头加一段 frontmatter：

```markdown
---
title: 标题（不写就取正文第一个 # 标题）
date: 2026-11-01
slug: my-post
tags: C++, 笔记
summary: 列表页显示的一两句摘要（不写就截正文前 80 字）
---

正文从这里开始……
```

`slug` 决定网址：`posts/my-post.html`。**不写 slug 会用文件名**，中文文件名会生成中文网址，能用但不好分享，建议还是写一个。

保存后跑 `node build.mjs`，`index.html`、`blog.html`、`posts/` 会一起更新，不用手工改列表。

Markdown 支持：标题、段落、粗体斜体、行内代码、代码块（带语言标记）、有序/无序列表、引用、表格、分割线、图片、链接。标题会自动生成锚点，目录里的 `[文字](#锚点)` 能直接跳转。

## 改个人信息

改 `docs/罗格的个人简介.md`，然后 `node build.mjs`。首页的姓名、一句话、两段简介、邮箱、GitHub 链接、「近况」三行全部来自这个文件：

- 第一个 `# 标题` → 姓名
- 第一个 `>` 引用 → 一句话
- 普通段落 → 简介
- `email: xxx` 与 `github: [名字](链接)` 这一行 → 联系方式
- 表格 → 近况（每行是「标签 | 内容」）

## 换配色

`style.css` 开头：

```css
:root {
  --accent: #2b6d8f;   /* 链接颜色，只改这一个也能换风格 */
  --maxw:   860px;     /* 页面宽度 */
}
```

深色模式在 `@media (prefers-color-scheme: dark)` 里，跟随系统自动切换。文章正文的表格、代码块样式也在同一份文件里。

## 绑自己的域名

1. 仓库 Settings → Pages → Custom domain，填域名，Save（会往根目录提交一个 `CNAME` 文件）。
2. DNS 处配置：
   - 裸域：`A` 记录 → `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
   - `www`：`CNAME` → `landmark283.github.io.`（结尾的点不能少，不要带仓库名）
3. 回到 Pages 勾选 **Enforce HTTPS**，证书最多要等 24 小时。

改完域名记得同步 `build.mjs` 顶部的 `SITE.origin`，否则 canonical 链接还是旧的。

## 发布设置

Settings → Pages → Source：`Deploy from a branch`，分支 `main`，目录 `/ (root)`。
