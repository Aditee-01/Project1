# KeepMovin — College Bus Tracking Demo

A responsive React + TypeScript prototype for demonstrating fictional campus bus routes around Prayagraj and Naini. This application does not use a backend, driver accounts, or live GPS.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run build:folder
```

Then open `dist\index.html` directly in Chrome (no localhost server or port is needed). The folder build uses a bundled classic script and relative asset paths so it can run from `file://`. To work on the source with Vite's live reload, use `npm run dev`; create the standard production build with `npm run build`.

## Demo behavior

- The first page load initializes five buses at their route starting stops.
- A subsequent full page refresh advances each bus by exactly one stop and saves the state and resulting notifications in `localStorage`.
- React rendering and navigation do not move buses. Buses remain at the final stop with `Arrived` status.
- **Reset demo** restores the starting positions and the initial fictional notifications.
- Seat availability is calculated as total seats minus occupied seats.
- Notifications are local, fictional examples and refresh-generated timing/delay updates; they can be marked read or cleared.

## Routes and map data

The route itineraries are fictional and are not official college transport routes or live vehicle positions. Named stops use coordinates returned by OpenStreetMap Nominatim searches for Prayagraj Junction, Civil Lines, University of Allahabad Arts Faculty, Anand Bhavan, Triveni Sangam, Allahabad Fort, Naini Bridge, Naini Junction, Allahabad Chheoki Junction, and Chowk.

An exact United College of Engineering & Research map pin was not returned by the OpenStreetMap place search. The displayed Naini destination-area endpoint uses the mapped United Institute of Technology campus coordinate as a nearby, clearly disclosed demo endpoint; it must not be treated as an exact UCER coordinate. For HTTP-hosted pages the map uses the documented `https://tile.openstreetmap.org/{z}/{x}/{y}.png` endpoint and falls back to Esri's World Street Map if OSM tiles fail. When opened directly from disk (`file://`), the browser does not provide a normal website Referer; to comply with OSM's tile policy, the app uses Esri's World Street Map immediately instead. Esri and OpenStreetMap attribution are displayed on that layer. The public OSRM routing endpoint is requested only for HTTP-hosted pages; a direct-file build uses the stop-to-stop demo line. If routing or tiles are unavailable, the app keeps route lines and stop markers visible. Public map services are best-effort dependencies and may impose availability or usage limits.

## Project structure

```text
src/
  components/     Bus cards, details, and Leaflet route map
  data/routes.ts  Fictional route definitions and mapped stop coordinates
  lib/            ETA, localStorage simulation, and notification logic
  App.tsx         Responsive dashboard, navigation, and notifications
  styles.css      Tailwind entry and application styles
```
