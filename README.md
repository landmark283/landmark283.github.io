# landmark283.github.io

个人主页与博客，纯静态：几个 HTML 文件 + 一份 CSS，没有构建步骤，没有依赖。

线上地址：<https://landmark283.github.io>

## 目录

```
index.html    首页：姓名、简介、近况、最近文章
blog.html     文章列表
posts/        每篇文章一个 HTML
style.css     全站样式（配色在文件开头的 :root）
404.html      找不到页面时显示
favicon.svg   标签页小图标
.nojekyll     让 GitHub Pages 跳过 Jekyll 处理
```

## 改首页

`index.html` 里从上到下依次是：开场（姓名 / 一句话 / 两段自我介绍 / 链接按钮）、近况列表、最近文章列表。

- 换名字：把 `<h1>` 和 `.brand`、页脚的 `Landmark` 一起改掉（全站 5 个文件里都有）。
- 换邮箱：`hello@example.com` 出现在 `mailto:` 链接和页脚里。
- 加头像：在 `.hero` 的 `</div>` 前插入 `<p><img src="/avatar.jpg" alt="头像" style="width:120px;border-radius:50%"></p>`，把 `avatar.jpg` 传进仓库根目录。

## 加一篇文章

1. 复制 `posts/demo.html`，改文件名（比如 `posts/my-post.html`）。
2. 改 `<title>`、`<h1>`、`<time datetime>`、`<meta name="description">` 和 `<link rel="canonical">`。
3. 在 `blog.html` 的 `<ul class="posts">` 里加一条：

```html
<li class="post">
  <time datetime="2026-11-01">2026-11-01</time>
  <h3><a href="/posts/my-post.html">标题</a></h3>
  <p>一两句摘要。</p>
</li>
```

4. 想让它出现在首页，就在 `index.html` 的「最近写的」里同样加一条。
5. `git add . && git commit -m "new post" && git push`，等半分钟。

写完 `posts/demo.html` 就可以删了，删掉的同时清掉两个列表里的对应条目。

## 换配色

`style.css` 开头：

```css
:root {
  --accent: #2b6d8f;   /* 链接颜色，只改这一个也能换风格 */
  --maxw:   860px;     /* 页面宽度 */
}
```

深色模式在 `@media (prefers-color-scheme: dark)` 里，跟随系统自动切换。

## 绑自己的域名

1. 仓库 Settings → Pages → Custom domain，填域名，Save（会往根目录提交一个 `CNAME` 文件）。
2. DNS 处配置：
   - 裸域：`A` 记录 → `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
   - `www`：`CNAME` → `landmark283.github.io.`（结尾的点不能少，不要带仓库名）
3. 回到 Pages 勾选 **Enforce HTTPS**，证书最多要等 24 小时。

## 发布设置

Settings → Pages → Source：`Deploy from a branch`，分支 `main`，目录 `/ (root)`。
