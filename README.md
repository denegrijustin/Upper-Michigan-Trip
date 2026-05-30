# Elskatemm Travel Companion

Cloudflare-ready static road-trip companion for the family trip from Olathe, Kansas to South Bend, Cheboygan, and Bois Blanc Island.

## What This Build Includes

- Hash-routed profile dashboards for Elsie, Katrina, Emma Grace, Eliette, and Mom/Dad
- Simple scroll-based Jules flow with short captain-style cards
- **Compact today-summary-card** on home screen — replaces large hero banner with two-column card showing trip stats, next action, and 3 primary buttons
- **Dynamic bottom nav** per active profile — child, momdad, and Jules each get a tailored nav set; no hardcoded profile links in HTML
- **GPS/trip controls moved to subpage** — Start/Stop GPS, phase buttons, bathroom/gas/food needs, and action log all live on the GPS subpage accessible from the dashboard
- **Map moved to Route subpage** — no longer on the default home view; full MapLibre map renders when navigating to Route
- Solid topbar with profile name, day, and trip phase — no backdrop blur overlay effect
- MapLibre live route map using OpenFreeMap tiles, with no Google API key needed
- Self-contained illustrated route images, so key content visuals still work offline
- Browser GPS controls with off/requesting/active/error states, accuracy, last updated, and Mom/Dad detail
- Open-Meteo weather with no API key, 30-minute local cache, GPS-following location, 12-hour hourly outlook, and imperial units
- Ferry section with Plaunt Transportation official link and honest schedule fallback
- STARZ/stargazing guidance using Clear Dark Sky as the verification source and Open-Meteo cloud risk
- Trip Shortlist replacing decorative favorites
- Family Vote choices: Yes, Maybe, Skip
- Captured photo/video trip story with delete buttons and local size safeguards
- Data-driven badge catalog with 60 starter badges, including 30+ route/place/milestone badges
- Service worker cache bumped to `elskatemm-trip-v10`
- Wrangler deployment using a generated `dist` folder

## Navigation

Bottom nav is rendered dynamically from `app.js` based on the active profile:

| Profile | Nav items |
|---|---|
| Child (Elsie, Katrina, Emma, Eliette) | Home · Route · Weather · Badges · Photos |
| Mom/Dad | Home · Route & GPS · Weather · Ferry · Stops |
| Jules | Home · Boats · Stars · Badges · Photos |

GPS controls, phase buttons, and needs (Bathroom/Gas/Food) are on the **GPS subpage**, reachable via the dashboard tile or `#/{profile}/gps`. The route map is on the **Route subpage** (`#/{profile}/route`).

## File Structure
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

No API key is required. The app fetches current, 12-hour hourly, and daily sunrise/sunset/daylight forecast data in Fahrenheit, mph, and inches for:

- Olathe / home
- South Bend
- Cheboygan / Plaunt ferry
- Bois Blanc Island
- Current GPS location when available

Weather is cached in `localStorage` for 30 minutes and labeled as live, cached, or unavailable.

Future optional enhancement: National Weather Service alerts.

## Maps And GPS

The in-app map uses MapLibre and OpenFreeMap, so there is no map API key or billing setup. The map draws the planned trip route and adds the current GPS location when permission is enabled. Phone-map links are provided for turn-by-turn driving outside the app.

The map is accessible on the Route subpage. GPS start/stop and phase controls are on the GPS subpage.

## Ferry

The app links to Plaunt Transportation and does not fake schedule data.

Fallback copy:

"Live ferry schedule is not embedded yet. Verify times on the official Plaunt Transportation site before departure."

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

Child profile badge details do not show "who earned it." Mom/Dad can view family badge progress.

## Offline And Storage Notes

The service worker caches local app assets for offline use. Live weather is not cached forever.

Captured media is stored on this device with size limits. The app includes delete controls. Very large videos should be kept outside the app.

## Known Limitations

- No private API keys are required or committed.
- The in-app map is a planned route context map, not a turn-by-turn navigation engine.
- Ferry schedules are not embedded live; verify on the official Plaunt site.
- Dark-sky guidance links to Clear Dark Sky and uses Open-Meteo cloud cover as the live-friendly support signal.
- Captured media uses local browser storage safeguards rather than a cloud media backend.

## Manual QA Checklist

General:

- [ ] App loads locally.
- [ ] App works as a static site.
- [ ] No secrets committed.
- [ ] Service worker cache version bumped to v10.
- [ ] README updated.
- [ ] Cloudflare deployment notes included.

Header/hero:

- [ ] Topbar is solid/calm — no blur overlay into page content.
- [ ] Topbar shows profile name and day/phase.
- [ ] Today-summary-card is compact and starts with next action.
- [ ] Start GPS button works from today-summary-card.
- [ ] Route and Today's Plan buttons navigate correctly.

Navigation:

- [ ] Bottom nav is profile-specific (not hardcoded Elsie links).
- [ ] Active nav item is highlighted.
- [ ] Child profiles get child nav.
- [ ] Mom/Dad gets logistics nav.
- [ ] Jules gets Jules nav.
- [ ] GPS subpage accessible via dashboard tile.
- [ ] Back/Profile Home navigation works.
- [ ] Browser back button works.
- [ ] Invalid hash routes fall back gracefully.

GPS/controls:

- [ ] GPS subpage shows Start GPS, Stop GPS, phase buttons, needs.
- [ ] Bathroom/Gas/Food needs show stops on GPS subpage.
- [ ] Start GPS from today-summary-card also works.

Route/Map:

- [ ] Map appears on Route subpage only.
- [ ] Map does not appear on home screen.
- [ ] Phone driving route link works.
- [ ] Return route link works.
- [ ] GPS active state shown on route map.

Profiles/dashboard:

- [ ] Profile selection works.
- [ ] Day selector works.
- [ ] Elsie opens to dashboard — no status panel clutter.
- [ ] Katrina opens to dashboard.
- [ ] Emma Grace opens to dashboard.
- [ ] Eliette opens to dashboard.
- [ ] Mom/Dad opens to logistics dashboard.
- [ ] Jules keeps a simple scroll experience.
- [ ] Dashboard tiles open focused subpages.

Route/weather:

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
- [ ] Badges do not duplicate endlessly.
- [ ] Tapping a badge shows explanation via action message.

Sources:

- [ ] Gateway Arch opens the official NPS page.
- [ ] Ferry opens the official Plaunt site.
- [ ] Major factual cards include official source links.
- [ ] Source/data status is visible for live and semi-live features.

## File Structure
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

No API key is required. The app fetches current, 12-hour hourly, and daily sunrise/sunset/daylight forecast data in Fahrenheit, mph, and inches for:

- Olathe / home
- South Bend
- Cheboygan / Plaunt ferry
- Bois Blanc Island
- Current GPS location when available

Weather is cached in `localStorage` for 30 minutes and labeled as live, cached, or unavailable.

Future optional enhancement: National Weather Service alerts.

## Maps And GPS

The in-app map uses MapLibre and OpenFreeMap, so there is no map API key or billing setup. The map draws the planned trip route and adds the current GPS location when permission is enabled. Phone-map links are provided for turn-by-turn driving outside the app.

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

- No private API keys are required or committed.
- The in-app map is a planned route context map, not a turn-by-turn navigation engine.
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

- [ ] Phone driving route link works.
- [ ] Return route link works.
- [ ] MapLibre route panel loads without a Google key.
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
