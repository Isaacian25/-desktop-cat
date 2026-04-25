# Website (Project Intro)

这个目录是项目介绍页（静态网站）。

This folder contains the project intro site (static website).

## 本地预览

直接双击打开 `index.html` 即可。

Open `index.html` directly to preview.

如果你想用本地服务方式打开（更接近线上环境）：

If you prefer local server preview (closer to production behavior):

```bash
cd website
python3 -m http.server 5174
```

然后访问 `http://localhost:5174`。

Then open `http://localhost:5174`.

## 上线建议

- 最轻量：GitHub Pages（直接发布 `website` 目录）
- 也可用 Vercel / Netlify（静态站点零后端）

## Deployment Suggestions (EN)

- Lightweight: GitHub Pages (publish `website` directory directly)
- Also works with Vercel / Netlify (static hosting, no backend needed)
