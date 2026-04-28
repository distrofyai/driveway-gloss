# Driveway Gloss

Marketing site for **Driveway Gloss**, a mobile auto-detailing service in Greenville, NC.

- **Live site:** https://www.drivewaygloss.net
- **Hosting:** Vercel (auto-deploys from this GitHub repo on every push to `main`)
- **Domain:** drivewaygloss.net
- **Contact email shown on site:** tyler@drivewaygloss.com

## What's where

```
index.html       — the entire page (text, sections, contact form)
css/style.css    — all styling (colors, layout, mobile rules)
js/main.js       — nav menu, hero video autoplay, form submission, scroll animations
images/          — every photo and the hero video on the site
robots.txt       — search engine permissions
sitemap.xml      — sitemap for Google
```

That's it. No build step, no framework, no npm. Plain HTML/CSS/JS.

## How to make a change

1. Edit the file (`index.html` for text/structure, `css/style.css` for styling).
2. Commit and push to GitHub:
   ```bash
   git add -A
   git commit -m "describe the change"
   git push
   ```
3. Vercel auto-deploys within ~1 minute. Refresh `drivewaygloss.net`.

## How to swap a photo

Drop the new image into the `images/` folder using the **same filename** as the one you're replacing (e.g. `hero.jpg`). Commit and push. The site picks it up automatically.

## Quote form

The form posts customer requests to a Google Apps Script Web App, which appends them to a Google Sheet. The endpoint URL is in `js/main.js` (search for `FORM_ENDPOINT`). Test submissions land in the Sheet within a few seconds.

If form submissions stop working, the most likely cause is the Apps Script deployment was redeployed and got a new URL — update `FORM_ENDPOINT` in `js/main.js` to match.

## Local preview (optional)

If you want to preview changes before pushing:
```bash
node .preview-server.js
# opens http://localhost:8123
```

## Account access for handoff

For a full transfer, the new owner needs access to:
- **GitHub** — this repository (`distrofyai/driveway-gloss`)
- **Vercel** — the project that auto-deploys this repo
- **Google Apps Script** — owns the quote-form endpoint
- **Google Sheet** — where form submissions are recorded
- **Domain registrar** — wherever drivewaygloss.net is registered (DNS points to Vercel)
- **Google Business Profile** — for the reviews and Maps listing
