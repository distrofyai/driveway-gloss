# Driveway Gloss

Marketing site for **Driveway Gloss**, a mobile auto-detailing service in Greenville, NC.

🌐 **Live:** _add Vercel URL after first deploy_

## Stack
Plain HTML, CSS, and vanilla JS — no build step. Static deploy.

## Structure
```
index.html       — single-page site
css/style.css    — all styles, mobile-first
js/main.js       — sticky nav, mobile menu, hero video, scroll reveals
images/          — production-optimized photos and the hero reel
robots.txt       — allow-all + sitemap pointer
sitemap.xml      — single-URL sitemap
```

## Local preview
```bash
node .preview-server.js
# opens http://localhost:8123
```

## Deploy
Static site — drop the repo into Vercel, Netlify, or Cloudflare Pages.
No build command, no framework. Output directory is the repo root.
