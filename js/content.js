/* ============================================================
   CONTENT — site text layer (all pages)
   Every editable text element carries data-cms="key". Values live
   in the Supabase `content` table (public read). If a key has no
   row (or the fetch fails) the HTML text stays — the static page
   IS the fallback. Admin edits go through the Netlify function.
   Also exposes window.CMS_CATALOG for the /admin page.
   ============================================================ */
(function () {
  const SUPABASE_URL = 'https://jaicdkzevoswlmvnphbv.supabase.co';
  const KEY = 'sb_publishable_F0Xj3FCh1G0TsMvg2gshpg_wqw4EWsT';

  /* the catalog: key → { label, page, sec, sub?, default, rich? }
     page = which page card it lives under · sec = section within that
     page · sub = optional sub-block (Scene 1, Milestone 2…).
     rich values may contain limited inline markup (<strong>, <em>, <br>) */
  window.CMS_CATALOG = [
    /* GLOBAL */
    { k: 'global.logo_text', page: 'Global', sec: 'Logo', label: 'Wordmark text', hint: 'shown on every page', d: 'AABIR\u00a0AHAMMED' },
    { k: 'global.logo_reg',  page: 'Global', sec: 'Logo', label: 'Mark after wordmark', hint: 'hidden on phones', d: '\u00ae' },
    { k: 'global.cta',   page: 'Global', sec: 'Shared elements', label: 'Nav button text', d: "Let's talk" },
    { k: 'global.email', page: 'Global', sec: 'Shared elements', label: 'Contact email', d: 'ahammedaabir@gmail.com' },
    /* HOME */
    { k: 'home.eyebrow', page: 'Home', sec: 'Hero', label: 'Eyebrow line (before rotator)', d: 'Available for new projects — ' },
    { k: 'home.roles',   page: 'Home', sec: 'Hero', label: 'Rotating roles', hint: 'comma-separated', d: 'motion designer, video editor, kinetic storyteller, colorist' },
    { k: 'home.h1a', page: 'Home', sec: 'Hero', label: 'Heading line 1', d: 'Motion is' },
    { k: 'home.h1b', page: 'Home', sec: 'Hero', label: 'Heading line 2 (gradient)', d: 'the message.' },
    { k: 'home.sub', page: 'Home', sec: 'Hero', label: 'Intro paragraph', rich: 1, d: `I'm <strong>Aabir Ahammed</strong> — I design kinetic identities and cut stories that move.
        8 years of title sequences, brand films and music visuals for studios and artists worldwide.` },
    { k: 'home.cta1', page: 'Home', sec: 'Buttons', label: 'Primary button', d: 'Watch the reel' },
    { k: 'home.cta2', page: 'Home', sec: 'Buttons', label: 'Ghost button', d: 'Explore work →' },
    { k: 'home.s1n', page: 'Home', sec: 'Stats row', label: 'Stat 1 number', d: '200+' },
    { k: 'home.s1l', page: 'Home', sec: 'Stats row', label: 'Stat 1 label', d: 'Projects' },
    { k: 'home.s2n', page: 'Home', sec: 'Stats row', label: 'Stat 2 number', d: '40M' },
    { k: 'home.s2l', page: 'Home', sec: 'Stats row', label: 'Stat 2 label', d: 'Views driven' },
    { k: 'home.s3n', page: 'Home', sec: 'Stats row', label: 'Stat 3 number', d: '12' },
    { k: 'home.s3l', page: 'Home', sec: 'Stats row', label: 'Stat 3 label', d: 'Awards' },
    { k: 'home.t1', page: 'Home', sec: 'Ticker marquee', label: 'Item 1', d: 'MOTION DESIGN' },
    { k: 'home.t2', page: 'Home', sec: 'Ticker marquee', label: 'Item 2', d: 'VIDEO EDITING' },
    { k: 'home.t3', page: 'Home', sec: 'Ticker marquee', label: 'Item 3', d: 'COLOR GRADE' },
    { k: 'home.t4', page: 'Home', sec: 'Ticker marquee', label: 'Item 4', d: 'SOUND DESIGN' },
    { k: 'home.t5', page: 'Home', sec: 'Ticker marquee', label: 'Item 5', d: 'TITLE SEQUENCES' },
    { k: 'home.t6', page: 'Home', sec: 'Ticker marquee', label: 'Item 6', d: 'BRAND FILMS' },
    { k: 'home.t7', page: 'Home', sec: 'Ticker marquee', label: 'Item 7 (highlight)', d: '4K · 24FPS · REC709' },
    { k: 'home.t8', page: 'Home', sec: 'Ticker marquee', label: 'Item 8 (highlight)', d: 'OPEN FOR FREELANCE' },
    /* WORK */
    { k: 'work.eyebrow', page: 'Work', sec: 'Hero', label: 'Eyebrow line', d: 'The archive — 2020 → 2026 · 8 selected projects' },
    { k: 'work.h1a', page: 'Work', sec: 'Hero', label: 'Heading line 1', d: 'Selected' },
    { k: 'work.h1b', page: 'Work', sec: 'Hero', label: 'Heading line 2 (gradient)', d: 'Work.' },
    { k: 'work.sub', page: 'Work', sec: 'Hero', label: 'Intro paragraph', rich: 1, d: `Frames from the cutting room — title sequences, brand films, music edits and broadcast
      packages. <strong>Drag the gallery</strong> to spin it, or let the reel roll.` },
    { k: 'work.cta1', page: 'Work', sec: 'Buttons', label: 'Primary button', d: 'Request full portfolio' },
    { k: 'work.cta2', page: 'Work', sec: 'Buttons', label: 'Ghost button', d: '← Home' },
    /* REEL */
    { k: 'reel.eyebrow', page: 'Reel', sec: 'Hero', label: 'Eyebrow line', d: 'Showreel 2026 — 01:24 · 4K · 24fps · sound on' },
    { k: 'reel.h1a', page: 'Reel', sec: 'Hero', label: 'Heading line 1', d: 'The' },
    { k: 'reel.h1b', page: 'Reel', sec: 'Hero', label: 'Heading line 2 (gradient)', d: 'Reel.' },
    { k: 'reel.sub', page: 'Reel', sec: 'Hero', label: 'Intro paragraph', rich: 1, d: `The loudest cuts from the past year — titles, brand bumps and music moments,
      looping on the big screen. <strong>Scrub the timeline</strong> to cut through it,
      or press play and turn it up.` },
    { k: 'reel.cta1', page: 'Reel', sec: 'Buttons', label: 'Primary button', d: 'Full reel on YouTube' },
    { k: 'reel.cta2', page: 'Reel', sec: 'Buttons', label: 'Ghost button', d: '← Back to work' },
    { k: 'reel.badge', page: 'Reel', sec: 'Badge', label: 'Loop badge', d: 'LOOPED PREVIEW — FULL CUT ON YOUTUBE' },
    { k: 'reel.s1t', page: 'Reel', sec: 'Scenes', sub: 'Scene 1', label: 'Title', d: 'IDENTITY' },
    { k: 'reel.s1m', page: 'Reel', sec: 'Scenes', sub: 'Scene 1', label: 'Meta', d: 'Kinetic type · 00:00 – 00:04' },
    { k: 'reel.s2t', page: 'Reel', sec: 'Scenes', sub: 'Scene 2', label: 'Title', d: 'GRADE + BARS' },
    { k: 'reel.s2m', page: 'Reel', sec: 'Scenes', sub: 'Scene 2', label: 'Meta', d: 'Color & test pattern · 00:04 – 00:08' },
    { k: 'reel.s3t', page: 'Reel', sec: 'Scenes', sub: 'Scene 3', label: 'Title', d: 'END CARD' },
    { k: 'reel.s3m', page: 'Reel', sec: 'Scenes', sub: 'Scene 3', label: 'Meta', d: 'Contact & credits · 00:08 – 00:12' },
    /* ABOUT */
    { k: 'about.eyebrow', page: 'About', sec: 'Hero', label: 'Eyebrow line', d: 'The human behind the keyframes' },
    { k: 'about.h1a', page: 'About', sec: 'Hero', label: 'Heading line 1', d: 'Behind' },
    { k: 'about.h1b', page: 'About', sec: 'Hero', label: 'Heading line 2 (gradient)', d: 'the cut.' },
    { k: 'about.sub', page: 'About', sec: 'Hero', label: 'Intro paragraph', rich: 1, d: `Self-taught editor turned motion designer. I care about <strong>rhythm more than
      plugins</strong> — every frame has to earn its place. This is the ID-card version
      of me; the full story is one coffee away.` },
    { k: 'about.cta1', page: 'About', sec: 'Buttons', label: 'Primary button', d: 'Say hi' },
    { k: 'about.cta2', page: 'About', sec: 'Buttons', label: 'Ghost button', d: '← The reel' },
    { k: 'about.m1t', page: 'About', sec: 'Milestones', sub: 'Milestone 1 · 2018', label: 'Title', d: '2018 — FIRST CUT' },
    { k: 'about.m1d', page: 'About', sec: 'Milestones', sub: 'Milestone 1 · 2018', label: 'Text', d: 'Pirated Premiere, a laptop that sounded like a jet engine, and one very patient friend.' },
    { k: 'about.m2t', page: 'About', sec: 'Milestones', sub: 'Milestone 2 · 2020', label: 'Title', d: '2020 — STUDIO YEARS' },
    { k: 'about.m2d', page: 'About', sec: 'Milestones', sub: 'Milestone 2 · 2020', label: 'Text', d: 'Two years cutting ads and broadcast promos — where deadlines stopped being scary and started being fun.' },
    { k: 'about.m3t', page: 'About', sec: 'Milestones', sub: 'Milestone 3 · 2023', label: 'Title', d: '2023 — FREELANCE' },
    { k: 'about.m3d', page: 'About', sec: 'Milestones', sub: 'Milestone 3 · 2023', label: 'Text', d: 'Went solo. Titles, brand films and music visuals for studios and artists worldwide.' },
    { k: 'about.m4t', page: 'About', sec: 'Milestones', sub: 'Milestone 4 · 2026', label: 'Title', d: '2026 — YOUR PROJECT' },
    { k: 'about.m4d', page: 'About', sec: 'Milestones', sub: 'Milestone 4 · 2026', label: 'Text', d: "The next frame is still empty. This slot is reserved — let's fill it together." },
    /* SERVICES */
    { k: 'sv.eyebrow', page: 'Services', sec: 'Hero', label: 'Eyebrow line', d: 'What I do — end to end, frame to final' },
    { k: 'sv.h1a', page: 'Services', sec: 'Hero', label: 'Heading line 1', d: 'What I' },
    { k: 'sv.h1b', page: 'Services', sec: 'Hero', label: 'Heading line 2 (gradient)', d: 'do.' },
    { k: 'sv.sub', page: 'Services', sec: 'Hero', label: 'Intro paragraph', rich: 1, d: `Four crafts, one pipeline. Pick a discipline to see what's inside —
      or grab the full package and <strong>let me own the whole cut</strong>.` },
    { k: 'sv.cta1', page: 'Services', sec: 'Buttons', label: 'Primary button', d: 'Start a project' },
    { k: 'sv.cta2', page: 'Services', sec: 'Buttons', label: 'Ghost button', d: '← The work' },
    { k: 'sv.1t', page: 'Services', sec: 'Service cards', sub: 'Service 1', label: 'Title', d: 'MOTION DESIGN' },
    { k: 'sv.1m', page: 'Services', sec: 'Service cards', sub: 'Service 1', label: 'Tagline', d: 'From storyboard to final render' },
    { k: 'sv.1d', page: 'Services', sec: 'Service cards', sub: 'Service 1', label: 'Deliverables', hint: 'comma-separated', d: 'Logo animation, Explainers, Lower thirds, Title sequences' },
    { k: 'sv.2t', page: 'Services', sec: 'Service cards', sub: 'Service 2', label: 'Title', d: 'VIDEO EDITING' },
    { k: 'sv.2m', page: 'Services', sec: 'Service cards', sub: 'Service 2', label: 'Tagline', d: 'Narrative-first cuts' },
    { k: 'sv.2d', page: 'Services', sec: 'Service cards', sub: 'Service 2', label: 'Deliverables', hint: 'comma-separated', d: 'Story assembly, Pacing & rhythm, Multi-cam, Subtitles & captions' },
    { k: 'sv.3t', page: 'Services', sec: 'Service cards', sub: 'Service 3', label: 'Title', d: 'COLOR GRADE' },
    { k: 'sv.3m', page: 'Services', sec: 'Service cards', sub: 'Service 3', label: 'Tagline', d: 'REC709 to HDR' },
    { k: 'sv.3d', page: 'Services', sec: 'Service cards', sub: 'Service 3', label: 'Deliverables', hint: 'comma-separated', d: 'Look development, Shot matching, Skin tones, Delivery masters' },
    { k: 'sv.4t', page: 'Services', sec: 'Service cards', sub: 'Service 4', label: 'Title', d: 'SOUND DESIGN' },
    { k: 'sv.4m', page: 'Services', sec: 'Service cards', sub: 'Service 4', label: 'Tagline', d: 'The half you feel' },
    { k: 'sv.4d', page: 'Services', sec: 'Service cards', sub: 'Service 4', label: 'Deliverables', hint: 'comma-separated', d: 'SFX & foley, Music selection, Mix & loudness, Final mastering' },
  ];

  /* tiny sanitizer — owner-authored values, but never execute anything */
  function clean(s) {
    return String(s)
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/javascript:/gi, '');
  }

  window.CMS_CONTENT = {};              /* key → DB value (only keys that exist) */
  window.CMS_CONTENT_READY = (async () => {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/content?select=key,value&limit=500`, {
        headers: { apikey: KEY },
      });
      if (r.ok) {
        for (const row of await r.json()) window.CMS_CONTENT[row.key] = row.value;
      }
    } catch (e) { /* static HTML stays as fallback */ }

    /* apply to marked elements */
    for (const { k, rich } of window.CMS_CATALOG) {
      const v = window.CMS_CONTENT[k];
      if (v === undefined || v === '') continue;   /* empty = use built-in */
      const els = document.querySelectorAll(`[data-cms="${k}"]`);
      if (!els.length) continue;
      const val = rich ? clean(v) : v;
      for (const el of els) el[rich ? 'innerHTML' : 'textContent'] = val;
    }
    return window.CMS_CONTENT;
  })();

  /* admin "Reload": re-fetch from the database and re-apply */
  window.CMS_REFETCH = async () => {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/content?select=key,value&limit=500`, {
        headers: { apikey: KEY },
      });
      if (r.ok) {
        window.CMS_CONTENT = {};
        for (const row of await r.json()) window.CMS_CONTENT[row.key] = row.value;
      }
    } catch (e) { /* keep old values */ }
    for (const { k, rich } of window.CMS_CATALOG) {
      const v = window.CMS_CONTENT[k];
      if (v === undefined || v === '') continue;
      const els = document.querySelectorAll(`[data-cms="${k}"]`);
      if (!els.length) continue;
      const val = rich ? clean(v) : v;
      for (const el of els) el[rich ? 'innerHTML' : 'textContent'] = val;
    }
    return window.CMS_CONTENT;
  };
})();
