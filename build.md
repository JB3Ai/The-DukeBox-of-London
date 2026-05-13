## 🏗️ Architecture: Node.js + Express
This app is designed for cPanel/Passenger environments.

### 1. Backend Logic (`server.js`)
- **Engine:** Google Lyria 3 (via Gemini Pro API).
- **Endpoint:** `POST /api/conduct`
- **Logic:** Receives "Phase" and "Atmosphere" data, returns a generative audio buffer.
- **Passenger Hook:** `module.exports = app;` is required for cPanel deployment.

### 2. Frontend Design (`public/`)
- **UI System:** "Liquid Glass" (High-refraction blurs + Neon accents).
- **Typography:** - `Druk Wide` (Hero)
  - `SF Pro Rounded` (Interface)
- **State Management:** Simple Vanilla JS or React to handle "Phase" toggling.

### 3. Environment Variables
Ensure the following are set in the cPanel Node.js Selector:
- `NODE_ENV`: production
- `GEMINI_API_KEY`: [Stored in JB3Ai vault]
- `PORT`: (Managed by Passenger)

## 🧪 Deployment Workflow
1. Commit changes to `main` branch.
2. Pull updates in cPanel Git Version Control.
3. Restart Node.js application in cPanel dashboard.

## cPanel Node.js App Settings

Use these values for the DukeBox Node/Express app:

| cPanel field | Value |
| --- | --- |
| Node.js version | `20.x` or newer |
| Application mode | `production` |
| `NODE_ENV` value | `production` |
| Application root | `/home/appjbaic/repositories/The-DukeBox-of-London` |
| Application URL | The domain/subdomain assigned to this app, for example `https://app.jb3ai.com` if that remains the DukeBox app URL |
| Application startup file | `server.js` |
| Passenger log file | `/home/appjbaic/logs/dukebox-passenger.log` |

Required environment variables:

| Variable | Value |
| --- | --- |
| `GEMINI_API_KEY` | Production Gemini / Google GenAI key from the JB3Ai vault |

After pulling code on cPanel, run dependency installation from the application root, not `/home/appjbaic/`:

```bash
cd /home/appjbaic/repositories/The-DukeBox-of-London
npm ci --omit=dev
mkdir -p tmp
touch tmp/restart.txt
```

If cPanel creates the app under a different folder name, use that exact folder for `Application root` and the `cd` command. Do not use `/home/appjbaic/` as the application root unless the repo files (`package.json`, `server.js`, and `public/`) are directly inside `/home/appjbaic/`.

---

# 🛠️ DukeBox Build & Deploy Guide

## 1. Local Development (VS Code)
1. Open this folder in VS Code.
2. Create a `.env` file: `GEMINI_API_KEY=your_key_here`.
3. Run `npm install` in your terminal.
4. Run `npm run dev` to test locally on `localhost:3000`.

## 2. Pushing to GitHub
When you finish a feature, run these commands in VS Code:
```bash
git add .
git commit -m "update: refining the London Legend logic"
git push origin main
```
