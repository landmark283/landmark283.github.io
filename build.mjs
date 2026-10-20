#!/usr/bin/env node
/* ============================================================
   build.mjs — 把 docs/ 里的 Markdown 编译成静态站点
   用法：在仓库根目录执行  node build.mjs
   产物：index.html / blog.html / posts/<slug>.html
   零依赖，只用到 Node 内置模块。
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';

/* ---------------- 站点配置 ---------------- */

const SITE = {
  origin: 'https://landmark283.github.io',
  title: '罗格',
  bioFile: 'docs/罗格的个人简介.md',
  contentDir: 'docs',
  outDir: 'posts',
  // 首页「最近写的」显示几条
  latestCount: 3,
  // 全站导航里额外挂的外部链接
  github: 'https://github.com/landmark283',
};

const ROOT = process.cwd();

/* ---------------- 小工具 ---------------- */

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (s) => escapeHtml(s).replace(/"/g, '&quot;');

/** GitHub 风格的标题锚点：小写、去标点、逐空格变连字符，保留中文 */
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
    .trim()
    .replace(/\s/g, '-');
}

/** 中文之间不加空格，西文之间加空格 */
function joinLines(a, b) {
  const cjk = /[\u4e00-\u9fff，。！？；：、（）《》“”‘’…—]/;
  return cjk.test(a.slice(-1)) || cjk.test(b.charAt(0)) ? a + b : a + ' ' + b;
}

function formatDate(d) {
  if (!d) return '';
  const s = String(d);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[0] : s;
}

/* ---------------- 行内 Markdown ---------------- */

function inline(text) {
  let s = escapeHtml(text);

  // 行内代码先换成占位符，避免里面的 * _ [ ] 被后面的规则吃掉
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(`<code>${code}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });

  // 图片  ![alt](src)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

  // 链接  [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

  // 粗体、斜体
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

  // 裸链接
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');

  // 还原行内代码
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);

  return s;
}

/* ---------------- 块级 Markdown ---------------- */

const RE = {
  heading: /^(#{1,6})\s+(.*)$/,
  hr: /^\s*(-{3,}|\*{3,}|_{3,})\s*$/,
  fence: /^\s*```\s*([\w+-]*)\s*$/,
  quote: /^>\s?(.*)$/,
  ul: /^\s*[-*+]\s+(.*)$/,
  ol: /^\s*\d+[.)]\s+(.*)$/,
  tableRow: /^\s*\|.*\|\s*$/,
  tableSep: /^\s*\|?[\s:|-]+\|[\s:|-]*$/,
};

function isBlockStart(line) {
  return (
    RE.fence.test(line) ||
    RE.heading.test(line) ||
    RE.hr.test(line) ||
    RE.quote.test(line) ||
    RE.ul.test(line) ||
    RE.ol.test(line) ||
    RE.tableRow.test(line)
  );
}

function renderBlocks(lines, ctx) {
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    // 代码块
    let m = line.match(RE.fence);
    if (m) {
      const lang = m[1];
      const buf = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
      i++; // 跳过结束的 ```
      const cls = lang ? ` class="language-${escapeAttr(lang)}"` : '';
      out.push(`<pre><code${cls}>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // 分割线
    if (RE.hr.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // 标题
    m = line.match(RE.heading);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      const id = ctx.uniqueId(slugify(text));
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    // 引用
    if (RE.quote.test(line)) {
      const buf = [];
      while (i < lines.length && RE.quote.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      out.push(`<blockquote>${renderBlocks(buf, ctx)}</blockquote>`);
      continue;
    }

    // 表格
    if (RE.tableRow.test(line) && i + 1 < lines.length && RE.tableSep.test(lines[i + 1])) {
      const parseRow = (r) =>
        r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = parseRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && RE.tableRow.test(lines[i])) rows.push(parseRow(lines[i++]));

      out.push(
        '<div class="table-wrap"><table><thead><tr>' +
          head.map((c) => `<th>${inline(c)}</th>`).join('') +
          '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') +
          '</tbody></table></div>'
      );
      continue;
    }

    // 无序列表
    if (RE.ul.test(line)) {
      const items = [];
      while (i < lines.length) {
        const mm = lines[i].match(RE.ul);
        if (!mm) break;
        items.push(mm[1]);
        i++;
        // 列表项之间的空行不影响连续性，但遇到别的块就停
        while (i < lines.length && !lines[i].trim()) i++;
        if (i < lines.length && !RE.ul.test(lines[i])) break;
      }
      out.push('<ul>' + items.map((t) => `<li>${inline(t)}</li>`).join('') + '</ul>');
      continue;
    }

    // 有序列表
    if (RE.ol.test(line)) {
      const items = [];
      while (i < lines.length) {
        const mm = lines[i].match(RE.ol);
        if (!mm) break;
        items.push(mm[1]);
        i++;
        while (i < lines.length && !lines[i].trim()) i++;
        if (i < lines.length && !RE.ol.test(lines[i])) break;
      }
      out.push('<ol>' + items.map((t) => `<li>${inline(t)}</li>`).join('') + '</ol>');
      continue;
    }

    // 段落
    const buf = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      buf.push(lines[i++]);
    }
    const text = buf.reduce((acc, cur) => joinLines(acc, cur.trim()));
    out.push(`<p>${inline(text)}</p>`);
  }

  return out.join('\n');
}

/* ---------------- 解析一篇文章 ---------------- */

function parseFrontmatter(raw) {
  const meta = {};
  let body = raw;
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^([\w-]+)\s*:\s*(.*)$/);
      if (kv) meta[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return { meta, body };
}

function makeCtx() {
  const used = new Set();
  return {
    uniqueId(base) {
      let id = base || 'section';
      let n = 1;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      return id;
    },
  };
}

function parsePost(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const lines = body.split(/\r?\n/);

  // 第一个 H1 当标题，正文里去掉它
  let title = meta.title || '';
  let start = 0;
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const m = lines[i].match(/^#\s+(.*)$/);
    if (m) {
      if (!title) title = m[1].trim();
      lines.splice(i, 1);
      break;
    }
  }

  const html = renderBlocks(lines.slice(start), makeCtx());
  const stat = fs.statSync(file);
  const date = formatDate(meta.date) || stat.mtime.toISOString().slice(0, 10);
  const slug =
    meta.slug ||
    path
      .basename(file, '.md')
      .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();

  const plain = lines.join(' ').replace(/[#>*`|\[\]()!-]/g, '').replace(/\s+/g, ' ').trim();

  return {
    file,
    slug,
    title: title || slug,
    date,
    summary: meta.summary || plain.slice(0, 80) + (plain.length > 80 ? '…' : ''),
    tags: (meta.tags || '').split(/[,，]/).map((t) => t.trim()).filter(Boolean),
    html,
  };
}

/* ---------------- 个人简介 ---------------- */

function parseProfile(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const profile = { name: '', tagline: '', paras: [], email: '', github: SITE.github, now: [] };

  let buf = [];
  const flush = () => {
    if (buf.length) {
      profile.paras.push(buf.reduce((a, c) => joinLines(a, c.trim())));
      buf = [];
    }
  };

  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    const h1 = t.match(/^#\s+(.*)$/);
    if (h1) {
      if (!profile.name) profile.name = h1[1].trim();
      continue;
    }
    const q = t.match(/^>\s?(.*)$/);
    if (q) {
      profile.tagline = profile.tagline ? joinLines(profile.tagline, q[1].trim()) : q[1].trim();
      continue;
    }
    // email / github 这一行
    if (/^(e-?mail|邮箱|github)\s*[:：]/i.test(t) || /github\s*[:：]\s*\[/i.test(t)) {
      const em = t.match(/e-?mail\s*[:：]\s*([^\s]+)/i) || t.match(/邮箱\s*[:：]\s*([^\s]+)/i);
      if (em) profile.email = em[1];
      const gh = t.match(/github\s*[:：]\s*\[([^\]]+)\]\(([^)]+)\)/i);
      if (gh) profile.github = gh[2];
      flush();
      continue;
    }
    // 表格行 → 近况
    if (RE.tableRow.test(t)) {
      if (RE.tableSep.test(t)) continue;
      const cells = t.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      if (cells.length >= 2) profile.now.push({ k: cells[0], v: cells.slice(1).join(' ') });
      flush();
      continue;
    }
    buf.push(t);
  }
  flush();
  return profile;
}

/* ---------------- 页面骨架 ---------------- */

function layout({ title, description, canonical, navKey, body, profile }) {
  const navLink = (href, key, label) =>
    `<a href="${href}"${key === navKey ? ' aria-current="page"' : ''}>${label}</a>`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<a class="skip" href="#main">跳到正文</a>

<header>
  <nav class="nav" aria-label="主导航">
    <a class="brand" href="/">${escapeHtml(profile.name)}</a>
    <div class="navlinks">
      ${navLink('/', 'home', '首页')}
      ${navLink('/blog.html', 'blog', '文章')}
      <a href="${profile.github}">GitHub ↗</a>
    </div>
  </nav>
</header>

<main id="main" class="main">
${body}
</main>

<footer>
  <div class="foot">
    <span>© ${new Date().getFullYear()} ${escapeHtml(profile.name)}</span>
    <a href="mailto:${escapeAttr(profile.email)}">${escapeHtml(profile.email)}</a>
  </div>
</footer>
</body>
</html>
`;
}

function postItem(p) {
  return `      <li class="post">
        <time datetime="${p.date}">${p.date}</time>
        <h3><a href="/posts/${p.slug}.html">${escapeHtml(p.title)}</a></h3>
        <p>${escapeHtml(p.summary)}</p>
      </li>`;
}

function postList(posts) {
  return `<ul class="posts">\n${posts.map(postItem).join('\n')}\n    </ul>`;
}

/* ---------------- 三种页面 ---------------- */

function renderHome(profile, posts) {
  const latest = posts.slice(0, SITE.latestCount);

  const body = `  <section class="hero">
    <h1>${escapeHtml(profile.name)}</h1>
    <p class="tagline">${escapeHtml(profile.tagline)}</p>
    <div class="prose">
${profile.paras.map((p) => `      <p>${inline(p)}</p>`).join('\n')}
    </div>
    <div class="links">
      <a href="mailto:${escapeAttr(profile.email)}">Email</a>
      <a href="${profile.github}">GitHub</a>
    </div>
  </section>

  <section class="section">
    <h2>近况</h2>
    <ul class="list">
${profile.now.map((r) => `      <li><span class="k">${inline(r.k)}</span><p class="v">${inline(r.v)}</p></li>`).join('\n')}
    </ul>
  </section>

  <section class="section">
    <div class="section-title-row">
      <h2>最近写的</h2>
      <a href="/blog.html">全部文章 →</a>
    </div>
    ${postList(latest)}
  </section>`;

  return layout({
    title: profile.name,
    description: `${profile.name}的个人主页：${profile.tagline}`,
    canonical: `${SITE.origin}/`,
    navKey: 'home',
    body,
    profile,
  });
}

function renderBlog(profile, posts) {
  const body = `  <div class="page-head">
    <h1>文章</h1>
    <p class="tagline">读书、学习，以及一些没头没尾的想法。</p>
  </div>

  ${postList(posts)}`;

  return layout({
    title: `文章 · ${profile.name}`,
    description: `${profile.name}的文章列表。`,
    canonical: `${SITE.origin}/blog.html`,
    navKey: 'blog',
    body,
    profile,
  });
}

function renderPost(profile, p) {
  const meta = [p.date, ...p.tags].filter(Boolean).join(' · ');
  const body = `  <article class="article">
    <h1>${escapeHtml(p.title)}</h1>
    <p class="meta">${escapeHtml(meta)}</p>
${p.html}

    <a class="back" href="/blog.html">← 返回文章列表</a>
  </article>`;

  return layout({
    title: `${p.title} · ${profile.name}`,
    description: p.summary,
    canonical: `${SITE.origin}/posts/${p.slug}.html`,
    navKey: 'blog',
    body,
    profile,
  });
}

/* ---------------- 主流程 ---------------- */

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

function main() {
  const profile = parseProfile(path.join(ROOT, SITE.bioFile));

  const skip = new Set([path.resolve(ROOT, SITE.bioFile)]);
  const posts = walk(path.join(ROOT, SITE.contentDir))
    .filter((f) => !skip.has(path.resolve(f)))
    .map(parsePost)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  fs.mkdirSync(path.join(ROOT, SITE.outDir), { recursive: true });
  for (const p of posts) {
    fs.writeFileSync(path.join(ROOT, SITE.outDir, `${p.slug}.html`), renderPost(profile, p));
  }

  fs.writeFileSync(path.join(ROOT, 'index.html'), renderHome(profile, posts));
  fs.writeFileSync(path.join(ROOT, 'blog.html'), renderBlog(profile, posts));

  console.log(`个人简介：${profile.name}｜近况 ${profile.now.length} 条｜文章 ${posts.length} 篇`);
  for (const p of posts) console.log(`  ${p.date}  posts/${p.slug}.html  ${p.title}`);
}

main();
