# VoxShare

> "Vox" is Latin for voice, making it sound tech-forward and clean.

Session-based voice tracker that measures how much each participant speaks — time, turns, and talk ratio. Fully on-device: no audio ever leaves the browser, no API keys required.

---

## How It Works

1. **Setup** — enter participant names
2. **Enrollment** — each person says a phrase; a 5-second MFCC voice profile is recorded
3. **Session** — speak naturally; VAD detects speech segments and attributes them to the closest enrolled voice
4. **Dashboard** — see talk time, turn count, average turn length, and share percentages per speaker

Speaker identification uses [Silero VAD](https://github.com/snakers4/silero-vad) for speech detection and [Meyda](https://meyda.js.org/) for MFCC extraction, with cosine similarity matching against enrolled profiles. Everything runs in an AudioWorklet — no server, no cloud.

---

## Stack

| Concern | Library |
|---|---|
| Voice activity detection | `@ricky0123/vad-web` (Silero ONNX, AudioWorklet) |
| Speaker fingerprinting | `meyda` (13-coefficient MFCC + cosine similarity) |
| State | `zustand` |
| Charts | `recharts` |
| Frontend | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| PWA / offline | `vite-plugin-pwa` (Workbox) |
| COOP/COEP shim | `coi-serviceworker` |

---

## Getting Started

**Requirements:** Node 24+, pnpm 10+ (via Corepack)

```bash
corepack enable    # once per machine
pnpm install       # also installs the pre-commit hook via postinstall
pnpm dev
```

Open `http://localhost:5173`. On first load the service worker registers and the page reloads once — this is expected.

> **Note:** The app requires `SharedArrayBuffer` (for ONNX threaded WASM). The dev server sets the required COOP/COEP headers automatically. On production, `coi-serviceworker` handles this via a service worker shim.

---

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm preview      # preview production build locally
pnpm check        # biome lint + format check
pnpm check:fix    # biome lint + format fix
pnpm typecheck    # TypeScript type check
```

---

## Deployment

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys to GitHub Pages on every push to `main`.

**One-time setup:**
1. Go to your repo → **Settings → Pages**
2. Set Source to **GitHub Actions**
3. Push to `main`

The workflow automatically sets the correct base path from the repository name. If you use a custom domain, change `--base=/${{ github.event.repository.name }}/` to `--base=/` in the workflow file.

The app also works on Netlify, Vercel, and Cloudflare Pages — just run `pnpm build` and serve the `dist/` folder. On those platforms you'll need to configure COOP/COEP response headers manually (or rely on `coi-serviceworker` which is already included).

---

## Privacy

All audio processing happens locally in the browser. No audio data, voice profiles, or session metrics are transmitted anywhere. The ONNX model and WASM binaries are cached by the service worker for fully offline use after the first load.
