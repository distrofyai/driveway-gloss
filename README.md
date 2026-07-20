# Driveway Gloss

Marketing site for **Driveway Gloss**, a mobile auto-detailing service in Mooresville, NC.

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

## Cache busting (important)

`css/style.css` and `js/main.js` are linked with a version query, e.g.
`css/style.css?v=3`. Vercel's edge caches these filenames aggressively and will
keep serving an old copy after a deploy, so a CSS or JS change can go live in
Git and still not appear in the browser.

**After changing style.css or main.js, bump the number in all five HTML files.**
Set `N` to the next number (currently 3, so use 4):

```bash
N=4
perl -0pi -e "s{style\.css\?v=\d+}{style.css?v=$N}g; s{main\.js\?v=\d+}{main.js?v=$N}g" *.html
```

Changing the number makes it a new URL, so every browser and every edge node
fetches it fresh. Image and HTML changes do not need this.

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

The form posts customer requests to a Google Apps Script Web App, which appends them to a Google Sheet **and emails a notification**. The endpoint URL is in `js/main.js` (search for `FORM_ENDPOINT`). Test submissions land in the Sheet within a few seconds.

**Sheet columns (left to right):** Timestamp · Name · Phone · Email · Vehicle · Service · Package · Upgrades.
- **Service** = the "Individual Services" answer (Interior / Exterior / Full Detail).
- **Package** = the "Packages" answer (Basic / Signature / Premium).

**Email notifications** go to both `distrofyai@gmail.com` and `tyler@drivewaygloss.com` — set in the `NOTIFY_EMAIL` constant at the top of the Apps Script (comma-separated; add or remove addresses there).

**Editing the Apps Script:** open the Sheet → **Extensions → Apps Script**. After any code change you must cut a new version for it to go live: **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. This keeps the same `/exec` URL, so `js/main.js` needs no change. If you add/remove form fields, update the `appendRow([...])` array in the script and the Sheet's header row to match.

If form submissions stop working, the most likely cause is the Apps Script deployment got a brand-new URL — update `FORM_ENDPOINT` in `js/main.js` to match.

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
