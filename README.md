<div align="center">

# The DukeBox of London

### A generative music experience shaped by London underground culture and interactive design.

[![JB3](https://img.shields.io/badge/JB%C2%B3-jb3ai.com-22324A?style=for-the-badge)](https://jb3ai.com)
![Status](https://img.shields.io/badge/STATUS-LIVE_PROTOTYPE-F2A900?style=for-the-badge)
[![Profile](https://img.shields.io/badge/FOUNDER-JONATHAN_BLACKBURN-6C63FF?style=for-the-badge)](https://github.com/JB3Ai)

</div>

---

## Overview

The DukeBox of London is an AI music conductor with a London warehouse and underground-club identity. Each generation creates a fresh listening experience from the selected phase, atmosphere, tempo and genre direction, then presents it through a reactive visualiser and tactile cassette-deck interface.

**Live prototype:** [app.jb3ai.com](https://app.jb3ai.com/)

A London-warehouse-themed AI music conductor. One tap generates a full electronic track, streams it back with a real-time visualizer, parametric EQ, and a cassette-deck aesthetic.

**Live:** [https://app.jb3ai.com/](https://app.jb3ai.com/)

---

## What It Does

- **AI Track Generation** — Sends a structured prompt (phase, atmosphere, BPM, artist seed) to Google Gemini `lyria-3-pro-preview` and receives a full WAV audio payload + lyrics in one shot.
- **Real-time Visualiser** — WebGL neural mesh + waveform reacts to the generated audio stream.
- **4 Phases × 51 Genres** — Peak-Bass, Main-Floor, Sunrise, Zoned-Out. Each phase has its own genre matrix, BPM curve, and visual skin.
- **Cassette-Deck UI** — Retro mixer faders, ridged rotary knobs with LED tips, CRT scanline hardware panels.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Backend** | Node.js + Express |
| **AI Engine** | Google Generative AI (`lyria-3-pro-preview`) |
| **Frontend** | React (Create React App) |
| **Hosting** | CloudLinux Node.js App + Phusion Passenger (cPanel) |
| **Domain** | `app.jb3ai.com` |

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/JB3Ai/The-DukeBox-of-London.git
cd The-DukeBox-of-London

# 2. Install dependencies (root + client)
npm install
cd client && npm install && cd ..

# 3. Set your Gemini API key
cp .env.example .env   # add GEMINI_API_KEY=<key>

# 4. Start the server
npm run dev   # nodemon server.js
# or
npm start     # node server.js
```

Frontend rebuild:
```bash
cd client
npm run build
# Build output lands in client/build/, which server.js serves automatically
```

---

## cPanel Deployment

1. **Git pull** in `/home/appjbaic/repositories/The-DukeBox-of-London`
2. **Run NPM Install** via cPanel Setup Node.js App
3. **Restart** via cPanel UI or `touch tmp/restart.txt`
4. **Set env vars** in cPanel: `GEMINI_API_KEY`, `NODE_ENV=production`

> The app uses `process.env.PORT` (assigned by CloudLinux). Do not hard-code 3000 in production.

---

## Key Commits

| Commit | Description |
|--------|-------------|
| `e395987` | Deploy React frontend with cassette-dial UI |
| `10296c3` | Retro mixer faders + CRT hardware panel |
| `b2697d2` | Lyria audio decoder + visualizer updates |
| `fecbbc7` | GitHub Copilot prompt-engineering instructions |

---

## Environment Variables

| Variable | Required | Notes |
|----------|----------|-------|
| `GEMINI_API_KEY` | Yes | Google AI key for `lyria-3-pro-preview` |
| `NODE_ENV` | No | Set to `production` for cPanel |
| `PORT` | No | Auto-assigned by CloudLinux |

---

## Project Layout

```
├── server.js          # Express app + Lyria AI endpoint
├── client/            # React frontend (CRA)
│   ├── src/
│   │   ├── components/
│   │   │   └── Knob.js      # Cassette-dial rotary control
│   │   ├── pages/
│   │   │   └── NowPlaying.js
│   │   ├── App.css          # Retro mixer faders
│   │   └── index.css        # CRT scanline hardware panel
│   └── public/
├── public/            # Static build output (served by Express)
├── app/               # Legacy FastAPI backend (reference)
├── .cpanel.yml        # CloudLinux deploy config
└── DUKEBOX_PROGRESS_NOTES.md
```


## Current Status

- Live prototype available at [app.jb3ai.com](https://app.jb3ai.com/)
- Production AI generation requires the configured model credentials
- Audio generation, decoding and visual synchronisation should be verified after each provider or deployment change
- Generated output remains subject to the selected model provider's availability, terms and safety controls

---

## Support the Build

JB³ develops practical AI and public-impact technology from Pretoria, South Africa. Sponsorship helps fund development time, model access, infrastructure, testing equipment and the path from prototype to reliable release.

<div align="center">

[![PayBru](https://img.shields.io/badge/PAYBRU-BECOME_A_FOUNDING_SPONSOR-00A9A5?style=for-the-badge)](https://paybru.co.za/communities/jonoblackburn-become-a-founding-sponsor)
[![Ko-fi](https://img.shields.io/badge/KO--FI-SUPPORT_THE_BUILD-FF5E5B?style=for-the-badge)](https://ko-fi.com/D0K721OP8E)
[![PayPal](https://img.shields.io/badge/PAYPAL-SPONSOR_VIA_PAYPAL-003087?style=for-the-badge)](https://paypal.me/jonoblackburnza)
[![Buy Me a Coffee](https://img.shields.io/badge/BUY_ME_A_COFFEE-SUPPORT_JB%C2%B3-FFDD00?style=for-the-badge&logoColor=000000)](https://buymeacoffee.com/jb3ai)

</div>

> Sponsorship supports development. It does not purchase equity, ownership, influence over investigative outputs or preferential access to sensitive information.

**[Explore JB³](https://jb3ai.com)** · **[Meet Jonathan Blackburn](https://www.jonoblackburn.com)** · **[Book a conversation](https://jb3ai.com/book)** · **[Email](mailto:jono@jb3ai.com)**

<div align="center">

**Part of the JB³ / OS³ ecosystem**

*Fall. Rise. Rebuild. Evolve.*

</div>
