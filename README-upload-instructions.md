# Upper Michigan Trip upload package

Upload these files to the root of the GitHub repo, replacing existing files where they already exist:

1. `mobile-first-fix.css`
2. `index.html`
3. `sw.js`

Important: upload `sw.js` last so the service worker cache update happens after the new CSS file is present.

This package links `mobile-first-fix.css` after `styles.css`, updates the service worker cache to `elskatemm-trip-v11`, and includes the new CSS in both the precache list and network-first list.

Note: `trip-data.js` still needs a separate data-specific pass if you want to replace the existing full data file. The current repo already includes Day 2 map stops and route places for South Bend → Grand Rapids → Grayling → Cheboygan → Bois Blanc.
