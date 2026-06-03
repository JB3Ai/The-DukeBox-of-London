# The DukeBox of London - Progress Notes

## Project Direction

- Active project: `C:\Apps in Dev Visual Code Folder\The DukeBox of London`
- Reference/original project: `C:\Apps in Dev Visual Code Folder\jukebox-london`
- Current product name: The DukeBox of London
- Previous product name: JukeBox / JukeBox London

## Decisions

- Treat The DukeBox of London as the active project and keep the previous JukeBox London repo read-only unless we explicitly need reference material.
- Rename project-facing identifiers from JukeBox to DukeBox where they describe this new app.
- Keep London music-culture language, genre data, and phase system intact unless we decide on a deeper product redesign.

## Progress Log

### 2026-05-12

- Verified the new repo remote points to `JB3Ai/The-DukeBox-of-London.git`.
- Verified the previous repo remote points to `JB3Ai/jukebox-london.git`.
- Found the new app structure under `app/` with a FastAPI backend, backend tests, design guidelines, and frontend dependencies.
- Renamed visible project identifiers from JukeBox to DukeBox in the FastAPI health response, backend tests, design guidelines, and backend test file name.
- Added root and app-level `.gitignore` coverage so local dependencies, caches, and secrets do not get swept into the new repo.
- Imported the original Node.js/Express webapp surface into the DukeBox repo: root `server.js`, `server.ts`, `package.json`, `package-lock.json`, `public/`, `client/`, `src/`, `stitch/`, and related docs/config.
- Rebranded the imported webapp metadata and visible UI strings to The DukeBox of London.
- Added cPanel Node.js App field guidance to `build.md`, including the recommended app root, startup file, environment mode, passenger log path, and post-pull commands.

### 2026-05-16

- Committed Milestone 2 genre matrix and selector work in `3ae0fad`.
- Re-architected the public frontend into a locked-viewport, three-screen shell: dashboard, refine, and cockpit.
- Rewired the browser state functions and selectors to the new hardware-style layout while preserving the 4 phases and 51-genre matrix.
- Verified the app still builds with `npm run build`, serves `/` successfully, exposes the new `app-container` shell, and returns a healthy `/health` response.

### 2026-05-17

- Chose the bridge path before any direct Python canonical migration: keep the active Node/Lyria deployment working while preparing for the richer FastAPI contract.
- Replaced `public/app.js` with a bilingual matrix engine that preserves the 51-genre frontend layout, sends the current Node payload first, and retries with the FastAPI integer-phase payload only after a `422` validation response.
- Normalized the Phase 1 default BPM back inside its allowed range so the initial slider state stays valid.
- Added a fresh DukeBox-specific `.cpanel.yml` so cPanel Git Version Control can deploy `main`, install production dependencies, and restart Passenger without relying on Terminal access.

### 2026-06-01

- **cPanel deployment:** Pushed the latest code to `origin/main` and deployed to the live cPanel Node.js app at `/home/appjbaic/repositories/The-DukeBox-of-London`.
- **Server startup fix:** Resolved `EADDRINUSE` on port 3000 by killing stale Node/Passenger workers via `/proc/net/tcp` inode scan (Python script with fallback to `pkill -9 node`).
- **CloudLinux NodeJS Selector compliance:** Removed physical `node_modules/` folder from app root and restored the required symlink → `nodevenv/repositories/The-DukeBox-of-London/22/lib/node_modules`.
- **path-to-regexp v8 compatibility fix:** Patched `server.js` catch-all route from `app.get("*", ...)` to `app.get(/.*/, ...)` to prevent `PathError: Missing parameter name at index 1: *` crash on Node.js v22.
- **Lazy GenAI initialization:** Wrapped Google AI client in `getAI()` lazy loader so the app boots cleanly even without `GEMINI_API_KEY` (returns 503 for `/api/conduct` until key is set).
- **UI upgrades — retro analog aesthetic:**
  - `client/src/App.css`: Replaced thin circular range sliders with chunky rectangular mixer faders with glowing LED tips (`border-top` glow + `repeating-conic-gradient` cassette texture).
  - `client/src/components/Knob.js`: Replaced flat circular knobs with ridged cassette-dial style (`repeating-conic-gradient` outer ridges, inner metallic dome, LED indicator line).
  - `client/src/index.css`: Replaced subtle grain with heavy CRT scanlines + brushed metal gradient on `.hardware-panel`.
- **React build deployment:** Built `client/` with `npm run build` and synced output to `public/` so Passenger serves the latest frontend.
- **cPanel deployment workflow:** Updated `.cpanel.yml` to install production node modules and build the React client during deploy.
- **Dynamic port handling:** Confirmed `server.js` uses `process.env.PORT || 3000` so cPanel can assign the runtime port without hardcoding `3000` in production.
- **Final push:** Commits `10296c3` and `e395987` pushed to `origin/main`; live domain `https://app.jb3ai.com/` should reflect the new UI after Passenger restart.

## Open Notes

- Confirm whether API compatibility matters before changing endpoint paths. Current endpoints such as `/api/conduct`, `/api/history`, and `/api/vibe-link` do not expose the old brand.
- The old `.github/workflows/deploy.yml` and `.cpanel.yml` were not imported because they hardcode the previous `jukebox-london` production path. Create fresh DukeBox deployment wiring once the cPanel/GitHub deployment target is confirmed.
- Confirm the exact cPanel clone folder. The working assumption is `/home/appjbaic/repositories/The-DukeBox-of-London`, but cPanel may choose a different directory name if the repo was cloned manually.
- `GEMINI_API_KEY` must be set in cPanel Node.js environment variables for `/api/conduct` to return AI-generated tracks.
