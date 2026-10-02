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
  api.js            # API integrations: Instagram feed, Google Reviews, Weather, Travel time
  instagram_data.js # Static Instagram feed data (from Behold, manually refreshed)
  configuration.js  # API keys (Google Maps, etc.)
  translations.js   # All UI text translations (pl, en, de, fr, es, ua) + MENU_DICTIONARY
images/             # Logos, photos
pdf/                # Menu PDFs
```

## Key Workflows

### Refreshing Instagram Feed
The site uses **Behold** (behold.pictures) to cache Instagram data. When the Behold token expires:
1. Generate a new JSON payload from Behold dashboard
2. Paste the JSON into `js/instagram_data.js`, wrapping it as:
   ```js
   export const INSTAGRAM_DATA = { ...json... };
   ```
3. Commit and push.

The `loadInstagramFeed()` function in `api.js` reads from `INSTAGRAM_DATA` — it uses `post.mediaUrl` for images and `post.thumbnailUrl` for videos.

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
| Google Maps (embed + reviews) | `js/configuration.js` → `GOOGLE_API_KEY`, `GOOGLE_PLACE_ID` |
| Google Ads | hardcoded in `index.html` (`gtag`) |
| Weather | `wttr.in` (no key needed) |
| Behold (Instagram cache) | `js/instagram_data.js` (static, refreshed manually) |
| Reservations form | Google Apps Script endpoint in `main.js` |

## Language Support

The site supports: **pl, en, de, fr, es, ua**

- UI translations: `TRANSLATIONS` object in `js/translations.js`
- Menu item translations: `MENU_DICTIONARY` in `js/translations.js`
- Language is stored in `localStorage` under key `gwar_language`

## Notes

- The menu PDF (`pdf/menu_pl.pdf`) is rendered via PDF.js
- Google Reviews are fetched live via the Google Places API
- The `test*.mjs` files are dev-only scripts for checking translation coverage
