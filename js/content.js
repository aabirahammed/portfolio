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

  /* the catalog: key → { label, group, default, rich? }
     rich values may contain limited inline markup (<strong>, <em>, <br>) */
  window.CMS_CATALOG = [
    /* GLOBAL */
    { k: 'global.cta',   g: 'Global', label: 'Nav button text',   d: "Let's talk" },
    { k: 'global.email', g: 'Global', label: 'Contact email',     d: 'ahammedaabir@gmail.com' },
    /* HOME */
    { k: 'home.eyebrow', g: 'Home', label: 'Eyebrow line (before rotator)', d: 'Available for new projects — ' },
    { k: 'home.roles',   g: 'Home', label: 'Rotating roles (comma-separated)', d: 'motion designer, video editor, kinetic storyteller, colorist' },
    { k: 'home.h1a', g: 'Home', label: 'Heading line 1', d: 'Motion is' },
    { k: 'home.h1b', g: 'Home', label: 'Heading line 2 (gradient)', d: 'the message.' },
    { k: 'home.sub', g: 'Home', label: 'Intro paragraph', rich: 1, d: `I'm <strong>Aabir Ahammed</strong> — I design kinetic identities and cut stories that move.
        8 years of title sequences, brand films and music visuals for studios and artists worldwide.` },
    { k: 'home.cta1', g: 'Home', label: 'Primary button', d: 'Watch the reel' },
    { k: 'home.cta2', g: 'Home', label: 'Ghost button', d: 'Explore work →' },
    { k: 'home.s1n', g: 'Home', label: 'Stat 1 number', d: '200+' },
    { k: 'home.s1l', g: 'Home', label: 'Stat 1 label', d: 'Projects' },
    { k: 'home.s2n', g: 'Home', label: 'Stat 2 number', d: '40M' },
    { k: 'home.s2l', g: 'Home', label: 'Stat 2 label', d: 'Views driven' },
    { k: 'home.s3n', g: 'Home', label: 'Stat 3 number', d: '12' },
    { k: 'home.s3l', g: 'Home', label: 'Stat 3 label', d: 'Awards' },
    { k: 'home.t1', g: 'Home', label: 'Ticker item 1', d: 'MOTION DESIGN' },
    { k: 'home.t2', g: 'Home', label: 'Ticker item 2', d: 'VIDEO EDITING' },
    { k: 'home.t3', g: 'Home', label: 'Ticker item 3', d: 'COLOR GRADE' },
    { k: 'home.t4', g: 'Home', label: 'Ticker item 4', d: 'SOUND DESIGN' },
    { k: 'home.t5', g: 'Home', label: 'Ticker item 5', d: 'TITLE SEQUENCES' },
    { k: 'home.t6', g: 'Home', label: 'Ticker item 6', d: 'BRAND FILMS' },
    { k: 'home.t7', g: 'Home', label: 'Ticker item 7 (hi)', d: '4K · 24FPS · REC709' },
    { k: 'home.t8', g: 'Home', label: 'Ticker item 8 (hi)', d: 'OPEN FOR FREELANCE' },
    /* WORK */
    { k: 'work.eyebrow', g: 'Work', label: 'Eyebrow line', d: 'The archive — 2020 → 2026 · 8 selected projects' },
    { k: 'work.h1a', g: 'Work', label: 'Heading line 1', d: 'Selected' },
    { k: 'work.h1b', g: 'Work', label: 'Heading line 2 (gradient)', d: 'Work.' },
    { k: 'work.sub', g: 'Work', label: 'Intro paragraph', rich: 1, d: `Frames from the cutting room — title sequences, brand films, music edits and broadcast
      packages. <strong>Drag the gallery</strong> to spin it, or let the reel roll.` },
    { k: 'work.cta1', g: 'Work', label: 'Primary button', d: 'Request full portfolio' },
    { k: 'work.cta2', g: 'Work', label: 'Ghost button', d: '← Home' },
    /* REEL */
    { k: 'reel.eyebrow', g: 'Reel', label: 'Eyebrow line', d: 'Showreel 2026 — 01:24 · 4K · 24fps · sound on' },
    { k: 'reel.h1a', g: 'Reel', label: 'Heading line 1', d: 'The' },
    { k: 'reel.h1b', g: 'Reel', label: 'Heading line 2 (gradient)', d: 'Reel.' },
    { k: 'reel.sub', g: 'Reel', label: 'Intro paragraph', rich: 1, d: `The loudest cuts from the past year — titles, brand bumps and music moments,
      looping on the big screen. <strong>Scrub the timeline</strong> to cut through it,
      or press play and turn it up.` },
    { k: 'reel.cta1', g: 'Reel', label: 'Primary button', d: 'Full reel on YouTube' },
    { k: 'reel.cta2', g: 'Reel', label: 'Ghost button', d: '← Back to work' },
    { k: 'reel.badge', g: 'Reel', label: 'Loop badge', d: 'LOOPED PREVIEW — FULL CUT ON YOUTUBE' },
    { k: 'reel.s1t', g: 'Reel', label: 'Scene 1 title', d: 'IDENTITY' },
    { k: 'reel.s1m', g: 'Reel', label: 'Scene 1 meta', d: 'Kinetic type · 00:00 – 00:04' },
    { k: 'reel.s2t', g: 'Reel', label: 'Scene 2 title', d: 'GRADE + BARS' },
    { k: 'reel.s2m', g: 'Reel', label: 'Scene 2 meta', d: 'Color & test pattern · 00:04 – 00:08' },
    { k: 'reel.s3t', g: 'Reel', label: 'Scene 3 title', d: 'END CARD' },
    { k: 'reel.s3m', g: 'Reel', label: 'Scene 3 meta', d: 'Contact & credits · 00:08 – 00:12' },
    /* ABOUT */
    { k: 'about.eyebrow', g: 'About', label: 'Eyebrow line', d: 'The human behind the keyframes' },
    { k: 'about.h1a', g: 'About', label: 'Heading line 1', d: 'Behind' },
    { k: 'about.h1b', g: 'About', label: 'Heading line 2 (gradient)', d: 'the cut.' },
    { k: 'about.sub', g: 'About', label: 'Intro paragraph', rich: 1, d: `Self-taught editor turned motion designer. I care about <strong>rhythm more than
      plugins</strong> — every frame has to earn its place. This is the ID-card version
      of me; the full story is one coffee away.` },
    { k: 'about.cta1', g: 'About', label: 'Primary button', d: 'Say hi' },
    { k: 'about.cta2', g: 'About', label: 'Ghost button', d: '← The reel' },
    { k: 'about.m1t', g: 'About', label: 'Milestone 1 title', d: '2018 — FIRST CUT' },
    { k: 'about.m1d', g: 'About', label: 'Milestone 1 text', d: 'Pirated Premiere, a laptop that sounded like a jet engine, and one very patient friend.' },
    { k: 'about.m2t', g: 'About', label: 'Milestone 2 title', d: '2020 — STUDIO YEARS' },
    { k: 'about.m2d', g: 'About', label: 'Milestone 2 text', d: 'Two years cutting ads and broadcast promos — where deadlines stopped being scary and started being fun.' },
    { k: 'about.m3t', g: 'About', label: 'Milestone 3 title', d: '2023 — FREELANCE' },
    { k: 'about.m3d', g: 'About', label: 'Milestone 3 text', d: 'Went solo. Titles, brand films and music visuals for studios and artists worldwide.' },
    { k: 'about.m4t', g: 'About', label: 'Milestone 4 title', d: '2026 — YOUR PROJECT' },
    { k: 'about.m4d', g: 'About', label: 'Milestone 4 text', d: "The next frame is still empty. This slot is reserved — let's fill it together." },
    /* SERVICES */
    { k: 'sv.eyebrow', g: 'Services', label: 'Eyebrow line', d: 'What I do — end to end, frame to final' },
    { k: 'sv.h1a', g: 'Services', label: 'Heading line 1', d: 'What I' },
    { k: 'sv.h1b', g: 'Services', label: 'Heading line 2 (gradient)', d: 'do.' },
    { k: 'sv.sub', g: 'Services', label: 'Intro paragraph', rich: 1, d: `Four crafts, one pipeline. Pick a discipline to see what's inside —
      or grab the full package and <strong>let me own the whole cut</strong>.` },
    { k: 'sv.cta1', g: 'Services', label: 'Primary button', d: 'Start a project' },
    { k: 'sv.cta2', g: 'Services', label: 'Ghost button', d: '← The work' },
    { k: 'sv.1t', g: 'Services', label: 'Service 1 title', d: 'MOTION DESIGN' },
    { k: 'sv.1d', g: 'Services', label: 'Service 1 deliverables (comma-separated)', d: 'Logo animation, Explainers, Lower thirds, Title sequences' },
    { k: 'sv.1m', g: 'Services', label: 'Service 1 meta', d: 'From storyboard to final render' },
    { k: 'sv.2t', g: 'Services', label: 'Service 2 title', d: 'VIDEO EDITING' },
    { k: 'sv.2d', g: 'Services', label: 'Service 2 deliverables (comma-separated)', d: 'Story assembly, Pacing & rhythm, Multi-cam, Subtitles & captions' },
    { k: 'sv.2m', g: 'Services', label: 'Service 2 meta', d: 'Narrative-first cuts' },
    { k: 'sv.3t', g: 'Services', label: 'Service 3 title', d: 'COLOR GRADE' },
    { k: 'sv.3d', g: 'Services', label: 'Service 3 deliverables (comma-separated)', d: 'Look development, Shot matching, Skin tones, Delivery masters' },
    { k: 'sv.3m', g: 'Services', label: 'Service 3 meta', d: 'REC709 to HDR' },
    { k: 'sv.4t', g: 'Services', label: 'Service 4 title', d: 'SOUND DESIGN' },
    { k: 'sv.4d', g: 'Services', label: 'Service 4 deliverables (comma-separated)', d: 'SFX & foley, Music selection, Mix & loudness, Final mastering' },
    { k: 'sv.4m', g: 'Services', label: 'Service 4 meta', d: 'The half you feel' },
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
})();
