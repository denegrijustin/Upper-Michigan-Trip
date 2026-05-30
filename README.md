# Elskatemm Travel Companion

Offline-first v2.1 of the family travel companion for the Olathe to Bois Blanc Island trip.

## What is included

- Mobile-first PWA shell
- Trip phase controls and countdown/progress tracking
- Real OpenStreetMap route view with offline fallback
- Live GPS controls moved into the map/status area
- Route-aware Bathroom, Gas, and Food buttons
- Plaunt ferry page content with official Learn More link
- Family profile views for Elsie, Katrina, Emma Grace, Eliette, Jules, Mom, and Dad
- Day-driven outlooks for July 31 through August 8
- Interactive kid-specific activity boards with links, completion, and capture buttons
- Trip summary capture area for photos/videos saved on the device
- Stargazing checklist, Clear Dark Sky link, viewing grade guidance, overhead targets, and horizon targets
- Flat file structure for simple GitHub upload

## Run locally

```bash
python3 -m http.server 8788
```

Then open:

```text
http://localhost:8788
```

## Cloudflare Pages

This v2.1 app is static and can be deployed from the repository root.

Suggested settings:

- Build command: leave blank
- Build output directory: `.`
- Root directory: repository root

Do not upload `package.json`, `node_modules`, `functions`, `assets`, or old zip files for this flat version.

## Required files

Upload these files at the root of the GitHub repository:

- `index.html`
- `styles.css`
- `app.js`
- `trip-data.js`
- `manifest.json`
- `sw.js`
- `icon.svg`
- `README.md`

## Privacy note

The exact house address should remain private app configuration and should not be exposed through public responses, logs, share links, or exports.
