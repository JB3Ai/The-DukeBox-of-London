# JukeBox - London Legend Edition | PRD

## Original Problem Statement
Build a phased, milestone-driven concept/POC for JukeBox — a premium, AI-native electronic music application.

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Framer Motion + Recharts + Web Audio API
- **Backend**: FastAPI (Python) + MongoDB (Motor async driver)
- **Audio**: Web Audio API synthesizer, 16-step sequencer, AnalyserNode FFT, cross-fade
- **Theme**: CSS custom properties + React Context + Phase-reactive auto-switching + Grain textures
- **Sharing**: Vibe Link system (6-char codes, MongoDB storage, URL deep-linking)

## Implementation History (9 iterations)
1. Core MVP — 5 screens, 9 endpoints, MongoDB, phase selector
2. Web Audio API — synthesizer, FFT visualizer
3. Full Skin Theming — 5 skins, CSS vars, ThemeProvider
4. Smart Mixer — cross-fade, auto-fade, bridge generation
5. Auto-Skin — phase-reactive skin switching
6. Code Quality — secrets module, component extraction, useMemo
7. Hero + Onboarding + Search + Vault Detail — animated landing, 4-step questionnaire, vibe tags, track expand
8. Vibe Link Sharing — shareable URLs, deep-linking, copy-to-clipboard

## Current Screens: 8
Hero Landing | Dashboard | Genre Explorer | Search & Discover | Now Playing | Smart Mixer | The Vault | Settings

## Backend Endpoints: 14
/api/health, /api/phases, /api/genres, /api/genres/{code}, /api/artist-seeds, /api/london-seeds, /api/conduct, /api/history, /api/history/action, /api/history/{track_id}, /api/stats, /api/transition, /api/vibe-link (POST), /api/vibe-link/{code} (GET)

## Testing: 28/28 backend + 100% frontend across all 8 screens

## Backlog
### P0
- The Afters Zone (Phase 4 relaxation UI)
- Artist Seeds (JAS) + London Legacy Bundle

### P1
- Real AI audio integration
- Download/Commerce, localStorage persistence
