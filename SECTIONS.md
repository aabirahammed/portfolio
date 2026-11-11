# SECTIONS — name map of every part of the site

Say any of these names to me to modify that exact part.
Every name below maps to real code: the CSS class, the file(s) that own it,
and what it currently does.

---

## GLOBAL — appears on all 5 pages

| Call name | Code | What it is / does |
|---|---|---|
| **Top Nav** | `nav`, `css/shared.css` | Fixed top bar: logo · links · socials · CTA · speaker · burger |
| **Logo** | `.logo`, `.mark` | Play-button mark + "AABIR AHAMMED" + pink ® (® hides ≤480px) |
| **Nav Links** | `.nav-links` | Work / Reel / About / Services, desktop only (≥900px) |
| **Active Page Underline** | `.nav-links a.active::after` | Glowing pink underline showing current page (not on Home) |
| **Home Nav Cue** | `@keyframes navCue` | Homepage-only: underline sweeps Work→Reel→About→Services every 7s |
| **Nav Socials** | `.socials` | 6 round icon links: Behance, Facebook, Instagram, YouTube, LinkedIn, X |
| **Let's Talk button** | `.nav-cta` | mailto link with pre-filled subject line |
| **Sound Button** | `.sfx-btn`, `js/sound.js` | Speaker toggle, mutes all interaction sounds (persists) |
| **Burger** | `.burger` | Mobile menu button, ≤900px only |
| **Mobile Menu** | `.mobile-menu`, `.mm-link`, `.mm-back`, `.mm-socials`, `.mm-mail` | Fullscreen translucent overlay (58% + blur) with Back button, 5 links, socials, email |
| **Vignette** | `.vignette` | Dark edge glow; on mobile it becomes the text-protection scrim gradient |
| **Grain** | `.grain` | Film-grain noise overlay |
| **Viewfinder Corners** | `.corners`, `.cnr-tl/.cnr-tr/.cnr-bl/.cnr-br` | The 4 pink camera-frame corner brackets |
| **CTA Buttons** | `.btn-primary`, `.btn-ghost`, `.tri` | "Watch the reel" (gradient + ▶) and "Explore work →" |
| **Eyebrow line** | `.eyebrow`, `.dot` | "● AVAILABLE FOR NEW PROJECTS — …" line above the h1 |
| **H1** | `h1`, `.line`, `.grad` | 2-line display headline, gradient words on line 2 |
| **Sub paragraph** | `.sub` | Intro copy under the h1 |
| **Hint Pills** | `.hints`, `.hint` | "Drag scene to orbit · Click to pulse · Space play/pause" + RPM pill (desktop, bottom-right) |
| **Edit Timeline** | `.timeline`, `js/timeline.js` | The fixed bottom bar (below) — drives every page's animation |
| **Timecode** | `.timecode`, `#tc` | `00:00:SS:FF` counter, bottom-left |
| **Play State** | `.tl-state`, `.pdot` | "● PLAYING / ● PAUSED" with pulsing dot |
| **Ruler** | `.ruler` | Tick-mark strip at top of the timeline |
| **Tracks** | `.tracks`, `.track`, `.clip` | The video "clips" (TITLE_SEQ_v4, BRAND_FILM_60s…) in the scrub area |
| **Playhead** | `.playhead` | The cyan vertical line you scrub with |
| **RPM Counter** | `.rpm-pill`, `.rpm-lamp/.rpm-val/.rpm-lbl`, `js/hero-scene.js` | Live click-speed counter. Desktop: in the hint pills row. Mobile: in the connect strip above the socials |
| **Mobile RPM Pill** | `.rpm-m` | The mobile copy of the counter (hidden on desktop) |

---

## HOME — `index.html`

| Call name | Code | What it is / does |
|---|---|---|
| **Ticker** | `.ticker`, `.ticker-track` | Scrolling marquee under the nav (services list, infinite loop) |
| **Role Rotator** | `.role-spin`, `#roleSpin` | "motion designer → video editor → …" rotating text; width reserved so nothing shifts |
| **Stats Row** | `.stats`, `.stat`, `.num`, `.lbl` | 200+ Projects · 40M Views · 12 Awards (count-up on load) |
| **Connect Strip** | `.connect`, `.connect-socials`, `.connect-mail` | Social icons + email, bottom of the content (mobile: RPM pill sits above it) |
| **Hero 3D — Knot** | `js/hero-scene.js` `knot`, `knotWire` | The big torus-knot "spine", wire overlay brightens with click speed |
| **Hero 3D — Cage & Rings** | `cage`, `ring1`, `ring2`, `keyRing` | Icosahedron wireframe + 2 orbit rings + 7 keyframe diamonds |
| **Hero 3D — Play Button** | `playBtn` | The teal rounded triangle |
| **Hero 3D — Camera Prop** | `makeCamera()` | Film camera: lens glass, 2 magenta reels, blinking REC dot |
| **Hero 3D — Clapperboard** | `makeClapper()` | Striped sticks that physically clap on a loop |
| **Hero 3D — Film Strip** | `makeFilmStrip()` | Curved strip with sprocket holes + colored frames |
| **Hero 3D — EQ Bars** | `makeWaveform()` | 7 dancing audio-meter bars |
| **Hero 3D — Scissors** | `makeScissors()` | Chrome blades + magenta handles |
| **Hero 3D — Color Wheel** | `makeColorWheel()` | Spinning conic grade-wheel |
| **Hero 3D — Mini Reels** | `frameRing`, `reelFrames` | Small film-frame ring orbiting the knot |
| **Click Burst** | `burst()` | Shockwave rings + prop kick + glow flash on tap; color/brightness follow click speed |
| **Cursor Light** | `cursorLight` | Warm light that follows your pointer over the scene |

---

## WORK — `work.html`

| Call name | Code | What it is / does |
|---|---|---|
| **Work Headline** | `.hero-content h1` | "SELECTED WORK" + sub |
| **Project Carousel** | `js/work-scene.js`, 3D ring of panels | Orbiting 3D project cards, drag or auto-advances with the timeline |
| **Project Caption** | `.work-caption`, `.proj-idx/.proj-title/.proj-meta` | "01 / TITLE / CLIENT · YEAR" text block under the CTAs |

---

## REEL — `reel.html`

| Call name | Code | What it is / does |
|---|---|---|
| **Reel Headline** | `.hero-content h1` | "THE REEL" + sub |
| **Cinema Screen** | `js/reel-scene.js` | Procedurally-drawn 60s "video" playing on a 3D screen — the timeline is its transport |
| **Loop Badge** | `.loop-badge` | "LOOP 24FPS" tag near the caption |
| **Reel Caption** | `.reel-caption`, `.sc-idx/.sc-title/.sc-meta` | Scene-by-scene chapter text synced to the timeline |

---

## ABOUT — `about.html`

| Call name | Code | What it is / does |
|---|---|---|
| **About Headline** | `.hero-content h1` | "THE EDITOR" + sub |
| **ID Card** | `js/about-scene.js` | 3D ID/badge card floating in the middle |
| **Constellation** | same file, `orbit` | Connecting-dots constellation behind the card |
| **Milestone Caption** | `.about-caption`, `.ms-idx/.ms-title/.ms-text` | Career milestones, auto-advanced by the timeline |

---

## SERVICES — `services.html`

| Call name | Code | What it is / does |
|---|---|---|
| **Services Headline** | `.hero-content h1` | "WHAT I CUT" + sub |
| **Service Helix** | `js/services-scene.js`, `pivot` | Rising helix of 3D service tiles |
| **Service Caption** | `.svc-caption`, `.sv-idx/.sv-title/.sv-meta/.sv-dels` | Service name + deliverables list, timeline-synced |

---

## 404 — `404.html`

| Call name | Code | What it is / does |
|---|---|---|
| **404 Glitch Code** | `.nf-code`, `.nf-code em` | Giant "4**0**4" with gradient middle + flicker |
| **Signal Lost line** | `.nf-msg` | "SIGNAL LOST — CLIP NOT FOUND" |
| **404 CTAs** | `.nf-ctas` | Back to home / Explore work |
| **404 Timecode** | `.nf-tc` | "00:00:40:04 — REC ●" bottom-left |

---

## SOUND SYSTEM — `js/sound.js`

| Call name | Trigger | Sound |
|---|---|---|
| **Click Tick** | any tap/click | Soft blip; pitch rises with click speed |
| **Scrub Tick** | dragging the timeline | Quiet tick, pitch follows playhead position |
| **Play Chord** | Space / resume | Two rising notes |
| **Pause Chord** | Space / pause | Two falling notes |
| **Menu Open / Close** | burger, back, Escape | Gentle slide up / down |
| **Mute Toggle** | speaker button | Instant silence, remembered in localStorage |

---

## THEME / PALETTE — `css/shared.css`

| Call name | Values |
|---|---|
| **Home palette** | magenta `#ff3d81` · cyan `#22d3ee` · violet `#8b5cf6` |
| **Work palette** | amber `#ffb020` · orange `#ff6a3d` · red `#ff3d5e` |
| **Reel palette** | lime `#a3e635` · teal `#2dd4bf` |
| **About palette** | blue `#5b8cff` · sky `#7dd3fc` |
| **Services palette** | rose `#fb7185` · red `#ff4d6d` |
| **404 palette** | inherits Home (magenta) |

---

## FILE MAP

```
index.html  work.html  reel.html  about.html  services.html  404.html
css/shared.css          ← everything above lives here (one design system)
js/timeline.js          ← EDIT engine: timecode, playhead, scrub, Space, menu
js/sound.js             ← all interaction sounds
js/hero-scene.js        ← Home 3D + RPM counter + burst
js/work-scene.js        ← Work carousel
js/reel-scene.js        ← Reel cinema screen
js/about-scene.js       ← About card + constellation
js/services-scene.js    ← Services helix
og-cover.jpg            ← social-share cover image
```

## BREAKPOINT CHEATSHEET

| Range | Behaviour |
|---|---|
| > 1500px | hero art pushed right, largest scale |
| 1051–1500px | art slightly in, scale 0.95 |
| 901–1050px | art centered-ish, scale 0.8 |
| 481–900px | **mobile layout**: centered text, burger nav, art drops below CTAs |
| ≤ 480px | compact nav (small logo, no ®, slim buttons) — fits 390px phones |
| ≤ 400px | compact timecode rail (104px) |
| ≤ 340px | ultra-compact logo fallback |
| ≤ 820px height | vertical compression so captions never hit CTAs/timeline |

*Examples: "make the Ticker slower", "change the Work palette", "move the RPM Counter", "the Clapperboard should clap slower".*
