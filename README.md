# The DukeBox of London

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

---

## Status

- 🟢 **Live** at `https://app.jb3ai.com/`
- 🟡 **Pending:** Set `GEMINI_API_KEY` in cPanel env to enable AI track generation
- 🟡 **Pending:** Verify full audio pipeline (Lyria decoder + visualiser sync) end-to-end on live domain
