# Upper Michigan Trip mobile-first v2 upload package

Upload these files to the root of the `denegrijustin/Upper-Michigan-Trip` repo.

## Files

1. `index.html`
2. `sw.js`
3. `mobile-first-fix.css`

## What this version fixes

- Keeps the page itself from sliding horizontally on phones.
- Constrains horizontal badge/tile shelves so only the shelf scrolls, not the full page.
- Improves weather tab readability with larger text, better spacing, and single-column mobile presentation.
- Keeps dashboard/card layouts single-column by default and progressively enhances at larger widths.
- Updates service worker cache version to `elskatemm-trip-v12`.

## Upload order

1. `mobile-first-fix.css`
2. `index.html`
3. `sw.js`

Upload `sw.js` last so the cache update happens after the CSS file exists.

## After upload

Let Cloudflare redeploy, then test on iPhone. If the old UI persists, open in a private tab or clear site data because the PWA service worker may cache old assets.
