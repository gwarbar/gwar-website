# Bar Gwar – Website

## Project Overview

Static website for **Bar Gwar**, a cocktail bar in Kraków, Poland located at Mostowa 8 (przy Kładce Bernatka).

- **Live URL:** https://bar.gwar.bar
- **Hosting:** GitHub Pages (repo: `gwarbar/gwar-website`, branch: `main`)
- **Instagram:** @bar_gwar

## Tech Stack

- Plain HTML + Vanilla CSS + Vanilla JS (ES modules)
- No build system / no npm / no framework
- Deployed via GitHub Pages with a custom domain (`CNAME`)

## File Structure

```
index.html          # Main homepage
menu.html           # Full drink & food menu
promotions.html     # Promotions page
confirm.html        # Reservation confirmation page
css/style.css       # Global styles
js/
  main.js           # Main JS entrypoint (imports, DOM logic)
  api.js            # Instagram feed, Google Reviews (both from data/*.json), Weather, Travel time
  translations.js   # All UI text translations (pl, en, de, fr, es, ua) + MENU_DICTIONARY
images/             # Logos, photos
images/instagram/   # Instagram images synced from Behold (auto-updated, don't edit)
data/
  instagram.json    # Instagram posts synced from Behold (auto-updated)
  reviews.json      # 5-star Google reviews (auto-updated)
scripts/
  sync-instagram.mjs  # Behold feed -> data/instagram.json + images/instagram/
  fetch-reviews.mjs   # Google Places API (New) -> data/reviews.json
pdf/                # Menu PDFs
```

## Key Workflows

### Instagram Feed (automatic)
`.github/workflows/update-instagram.yml` runs daily: copies the **Behold** feed (`https://feeds.behold.so/oQn5QE77nlwKbBhGPy83`) into `data/instagram.json` + `images/instagram/`, commits and redeploys. The site only reads repo files, so images never expire.

- Behold free plan needs a **login once a month**. The workflow opens a GitHub issue (repo owner `gwarbar` gets an email) **every 28 days**, counted from when the previous reminder was closed. Log in to behold.so, then close the issue.
- If likes/followers don't change for 7 days (= Behold paused) or the feed errors, it opens an alert issue, which closes itself once the feed refreshes again.
- Meta for Developers / Instagram API was tried before and didn't work well – that's why Behold.

### Google Reviews (automatic)
`.github/workflows/update-reviews.yml` runs daily: `scripts/fetch-reviews.mjs` calls Places API (New), keeps only **5-star** reviews, merges with saved ones (max 12) and saves `data/reviews.json`. No API key in the browser – the key is the repo secret `GOOGLE_API_KEY` (repo is public, never commit keys). Google returns max 5 reviews per call.

### Updating the Menu
- Polish menu: edit `menu.html` directly (HTML structure) and update `pdf/menu_pl.pdf`
- Other languages: update `MENU_DICTIONARY` in `js/translations.js`
- See `menu_update_guidelines.txt` for naming conventions

### Deploying
```bash
git add .
git commit -m "Description"
git push
```
GitHub Pages auto-deploys on push to `main`. Changes are live at https://bar.gwar.bar within ~1 minute.

## API Keys & Integrations

| Service | Config location |
|---|---|
| Google Maps embed | iframe in `index.html` (no key) |
| Google Reviews | repo secret `GOOGLE_API_KEY` (Places API (New)), used only by GitHub Action |
| Google Ads | hardcoded in `index.html` (`gtag`) |
| Weather | `wttr.in` (no key needed) |
| Behold (Instagram) | public feed URL in `scripts/sync-instagram.mjs` |
| Reservations form | Google Apps Script endpoint in `main.js` |

## Language Support

The site supports: **pl, en, de, fr, es, ua**

- UI translations: `TRANSLATIONS` object in `js/translations.js`
- Menu item translations: `MENU_DICTIONARY` in `js/translations.js`
- Language is stored in `localStorage` under key `gwar_language`

## Notes

- The menu PDF (`pdf/menu_pl.pdf`) is rendered via PDF.js
- The `test*.mjs` files are dev-only scripts for checking translation coverage
