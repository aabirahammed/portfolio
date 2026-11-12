# AABIR AHAMMED — Portfolio

A 5-page interactive portfolio for motion designer & video editor Aabir Ahammed.
Every page is a "new edit": its own color palette and its own 3D artwork, all cut
together by one shared edit-timeline engine.

## Pages

| Page | File | Palette | 3D centerpiece |
|---|---|---|---|
| Home | `index.html` | magenta `#ff3d81` / cyan `#22d3ee` / violet `#8b5cf6` | Torus knot rig + film-prop satellites |
| Work | `work.html` | amber `#ffb020` / orange `#ff6a3d` / red `#ff3d5e` | 3D project carousel |
| Reel | `reel.html` | lime `#a3e635` / teal `#2dd4bf` | Procedural 60s cinema screen |
| About | `about.html` | blue `#5b8cff` / sky `#7dd3fc` | ID card + constellation |
| Services | `services.html` | rose `#fb7185` / red `#ff4d6d` | Service helix |

Error page: `404.html` (auto-served by Netlify / GitHub Pages).

## Architecture

- **`css/shared.css`** — the whole design system. Per-page palettes are remapped
  via `body[data-page="…"]` CSS custom properties (`--a1/--a2/--a3` + `-rgb`).
  All responsive rules live here, except small homepage-only overrides that sit
  inline in `index.html`.
- **`js/timeline.js`** — the shared `window.EDIT` engine: timecode, playhead,
  scrubbing, Space play/pause, plus the mobile menu (burger / back / Escape).
  Every page loads it first.
- **`js/sound.js`** — synthesized interaction sounds (Web Audio, zero audio
  files): soft click ticks that rise in pitch with your click speed, scrub
  ticks that follow the playhead, play/pause two-tone, menu slides. Speaker
  toggle lives in the nav; the choice persists in `localStorage` and
  `prefers-reduced-motion` users start muted.
- **`js/contact.js`** — the "Let's talk" contact modal, injected on every
  page. Submits to a Netlify function which emails via Resend; honeypot
  spam trap, mailto fallback on failure. The Resend key lives in Netlify
  env vars (`RESEND_API_KEY`), never in the repo.
- **`netlify/functions/contact.js`** — serverless endpoint
  (`/.netlify/functions/contact`) that validates and forwards inquiries.
- **`js/*-scene.js`** — one Three.js scene per page. They dynamic-`import()`
  Three.js from the jsDelivr CDN, so the site runs straight from `file://`
  with no build step and no bundler.
- **Seamless loop** — scenes never rotate directly from `EDIT.time` (which wraps
  12→0); each keeps a scene-local play phase that integrates real time and
  follows the scrub head while scrubbing, so the artwork never snaps at the
  loop point.
- **Fonts** — Syne (display), Inter (body), JetBrains Mono (technical UI) via
  Google Fonts.
- **No build step.** Static files only — deploy by uploading the folder.

## Interactions

- **Space** — play / pause the edit (every page)
- **Drag** the 3D stage to orbit; **click** (no drag) to pulse
- **Scrub** the bottom timeline — cuts the content on work / reel / services / about
- **Click-RPM counter** — rolling 8s window of your click/tap rate with a fast
  attack / slow decay envelope; the lamp, shockwave rings and the knot's glow
  ride a heat ramp **magenta → violet → cyan → white** as you click faster
  (desktop: in the hints row bottom-right · mobile: above the social icons)
- **Hover** any 3D prop on the home page to spotlight it
- **Sounds** — subtle synthesized foley on clicks, scrubbing, play/pause and
  the mobile menu; mute with the speaker button in the nav (choice remembered)

## Deploying

Static host — Netlify, Vercel, GitHub Pages or any web server.

1. Upload the folder (or push the repo).
2. `404.html` is picked up automatically by Netlify / GitHub Pages.
3. Social share cards reference `og-cover.jpg` (1200×630+ cover in the root).
   If you change the homepage, re-capture it for a fresh card.
4. Optional: point a custom domain at the host.

## Notes

- Three.js loads from `https://cdn.jsdelivr.net` — keep that allowed if you
  self-host behind a strict CSP.
- `prefers-reduced-motion` is respected (calmer float speeds, nav cue off).
- Real contact links: Behance, Facebook, Instagram, YouTube, LinkedIn, X,
  and `ahammedaabir@gmail.com`.
