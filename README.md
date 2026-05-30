# Elskatemm Travel Companion

Cloudflare-ready static road-trip companion for the family trip from Olathe, Kansas to South Bend, Cheboygan, and Bois Blanc Island.

## What This Build Includes

- Hash-routed profile dashboards for Elsie, Katrina, Emma Grace, Eliette, and Mom/Dad
- Simple scroll-based Jules flow with short captain-style cards
- Google Maps road-accurate route links and an optional Google Maps Embed API panel
- Self-contained illustrated route images, so key content visuals still work offline
- Browser GPS controls with off/requesting/active/error states, accuracy, last updated, and Mom/Dad detail
- Open-Meteo weather with no API key, 30-minute local cache, source status, and profile-specific guidance
- Ferry section with Plaunt Transportation official link and honest schedule fallback
- STARZ/stargazing guidance using Clear Dark Sky as the verification source and Open-Meteo cloud risk
- Trip Shortlist replacing decorative favorites
- Family Vote choices: Yes, Maybe, Skip
- Captured photo/video trip story with delete buttons and local size safeguards
- Data-driven badge catalog with 60 starter badges, including 30+ route/place/milestone badges
- Service worker cache bumped to `elskatemm-trip-v5`
- Wrangler deployment using a generated `dist` folder

## File Structure

Root files:

- `index.html`
- `styles.css`
- `app.js`
- `trip-data.js`
- `manifest.json`
- `sw.js`
- `icon.svg`
- `README.md`
- `package.json`
- `wrangler.jsonc`

Cloudflare builds `dist/` from the eight app assets and deploys only that folder.

## Local Development

```bash
bun install
bun run build
python3 -m http.server 8788
```

Then open `http://localhost:8788`.

## Cloudflare Deployment

Working settings:

- Build command: `bun run build`
- Deploy command: `npx wrangler deploy`
- Root/path: repository root
- Wrangler assets directory: `./dist`

`wrangler.jsonc` uses the Cloudflare Worker name `michigan-trip`.

## Weather

Primary weather source: Open-Meteo.

No API key is required. The app fetches current/hourly/daily forecast data for:

- Olathe / home
- South Bend
- Cheboygan / Plaunt ferry
- Bois Blanc Island
- Current GPS location when available

Weather is cached in `localStorage` for 30 minutes and labeled as live, cached, or unavailable.

Future optional enhancement: National Weather Service alerts.

## Maps And GPS

Google Maps links provide road-accurate directions. If you add a restricted Google Maps Embed API key in `trip-data.js`, the app also renders the Google map panel in place.

GPS uses browser geolocation. If permission is denied, the app stays useful with route-phase context and source links.

## Ferry

The app links to Plaunt Transportation and does not fake schedule data.

Fallback copy:

“Live ferry schedule is not embedded yet. Verify times on the official Plaunt Transportation site before departure.”

## Badges

The badge catalog is data-driven in `trip-data.js`.

Badges are awarded for:

- trip milestones
- route/place/source interactions
- activities
- photo/video captures
- Trip Shortlist saves
- Family Votes
- ferry actions
- weather and stargazing actions

Child profile badge details do not show “who earned it.” Mom/Dad can view family badge progress.

## Offline And Storage Notes

The service worker caches local app assets for offline use. Live weather is not cached forever.

Captured media is stored on this device with size limits. The app includes delete controls. Very large videos should be kept outside the app.

## Known Limitations

- No private API keys are committed.
- Google Maps uses outbound links unless an Embed API key is added in a future build.
- Ferry schedules are not embedded live; verify on the official Plaunt site.
- Dark-sky guidance links to Clear Dark Sky and uses Open-Meteo cloud cover as the live-friendly support signal.
- Captured media uses local browser storage safeguards rather than a cloud media backend.

## Manual QA Checklist

General:

- [ ] App loads locally.
- [ ] App works as a static site.
- [ ] No secrets committed.
- [ ] Service worker cache version bumped.
- [ ] README updated.
- [ ] Cloudflare deployment notes included.

Profiles/navigation:

- [ ] Profile selection works.
- [ ] Day selector works.
- [ ] Elsie opens to a dashboard.
- [ ] Katrina opens to a dashboard.
- [ ] Emma Grace opens to a dashboard.
- [ ] Eliette opens to a dashboard.
- [ ] Mom/Dad opens to a logistics dashboard.
- [ ] Jules keeps a simple scroll experience.
- [ ] Dashboard tiles open focused subpages.
- [ ] Back/Profile Home navigation works.
- [ ] Browser back button works.
- [ ] Invalid hash routes fall back gracefully.

Route/GPS/weather:

- [ ] Google Maps route link works.
- [ ] Return route link works.
- [ ] Google route fallback opens the correct road-accurate map.
- [ ] GPS denied, active, and stop states work.
- [ ] Weather fetch from Open-Meteo works.
- [ ] Weather cached fallback is labeled.
- [ ] Ferry weather risk uses Cheboygan/Bois Blanc data when available.
- [ ] Stargazing cloud risk uses cloud cover when available.

Interactions:

- [ ] Photo capture works.
- [ ] Photo delete works.
- [ ] Trip Shortlist works.
- [ ] Saved items can be removed.
- [ ] Family Vote works.
- [ ] Mom/Dad can approve voted/saved items into plan.
- [ ] Badge state initializes safely.
- [ ] Badge catalog includes 50+ starter badges.
- [ ] Badges do not duplicate endlessly.
- [ ] Clicking/tapping a badge opens an explanation.

Sources:

- [ ] Gateway Arch opens the official NPS page.
- [ ] Ferry opens the official Plaunt site.
- [ ] Major factual cards include official source links.
- [ ] Source/data status is visible for live and semi-live features.
