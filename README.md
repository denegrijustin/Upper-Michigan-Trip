# Elskatemm Travel Companion

Offline-first v1 of the family travel companion for the Olathe to Bois Blanc Island trip.

## What is included

- Mobile-first PWA shell
- Trip phase controls and countdown/progress tracking
- Offline trip pack button and service worker
- Cached route visualization
- Smart stop planning copy for gas, food, clean restrooms, and breaks
- Plaunt ferry page content
- Family profile views for Elsie, Katrina, Emma Grace, Eliette, Jules, Mom, and Dad
- Day-driven outlooks for July 31 through August 8
- Choose-your-own-adventure island activity board
- Stargazing checklist and nightly guidance
- Cloudflare Pages Function stubs for ferry, events, and trip pack data

## Run locally

```bash
npm start
```

Then open:

```text
http://localhost:8788
```

## Cloudflare Pages

This v1 is static and can be deployed from the repository root.

Suggested settings:

- Build command: leave blank
- Build output directory: `.`
- Functions directory: `functions`

Environment variables for future live integrations:

- `MAPBOX_PUBLIC_TOKEN`
- `MAPBOX_SECRET_TOKEN`
- `NPS_API_KEY`
- optional `OPENWEATHER_API_KEY`
- optional `ASTRONOMY_API_KEY`
- KV binding: `TRIP_CACHE`

## Privacy note

The exact house address should remain private app configuration and should not be exposed through public responses, logs, share links, or exports.
