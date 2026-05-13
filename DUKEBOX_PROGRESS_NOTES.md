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

## Open Notes

- Confirm whether API compatibility matters before changing endpoint paths. Current endpoints such as `/api/conduct`, `/api/history`, and `/api/vibe-link` do not expose the old brand.
- The old `.github/workflows/deploy.yml` and `.cpanel.yml` were not imported because they hardcode the previous `jukebox-london` production path. Create fresh DukeBox deployment wiring once the cPanel/GitHub deployment target is confirmed.
