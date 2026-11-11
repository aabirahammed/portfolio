/* ============================================================
   SFX — synthesized interaction sounds (Web Audio, zero files)
   Mild & soothing by design: pure sine/triangle tones, soft
   attack, exponential decay, lowpass filters, very low volume.
   Mute persists in localStorage; reduced-motion users start muted.
   ============================================================ */
window.SFX = (function () {
  const MUTE_KEY = 'aabir-sfx-muted';
  let muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) { /* private mode */ }
  /* be considerate: reduced-motion users didn't ask for sound either */
  if (!localStorage.getItem(MUTE_KEY) &&
      matchMedia('(prefers-reduced-motion: reduce)').matches) muted = true;

  let ctx = null, master = null;
  const state = { heat: 0, lastScrub: 0 };

  function ensure() {
    if (muted) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.15; /* gentle overall level */
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* one soft voice: osc → lowpass → gain envelope → master */
  function blip(freq, opts) {
    const c = ensure();
    if (!c) return;
    const o = Object.assign({ type: 'sine', dur: 0.07, vol: 0.4, to: null, cutoff: 1600, delay: 0 }, opts);
    const t0 = c.currentTime + o.delay;
    const osc = c.createOscillator();
    osc.type = o.type;
    osc.frequency.setValueAtTime(freq, t0);
    if (o.to && o.to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(o.to, 30), t0 + o.dur);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = o.cutoff; lp.Q.value = 0.6;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(o.vol, t0 + 0.006);          /* soft attack */
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);    /* gentle decay */
    osc.connect(lp); lp.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + o.dur + 0.05);
  }

  const api = {
    get muted() { return muted; },
    setHeat(h) { state.heat = h; },
    /* quick tap — pitch and brightness rise with click speed (homepage heat) */
    click() {
      const f = 620 * (1 + state.heat * 0.9);
      blip(f, { to: f * 0.9, dur: 0.07, vol: 0.5, cutoff: 1500 + state.heat * 1400 });
    },
    /* scrub tick — pitch follows the playhead position */
    scrub(ratio) {
      const now = performance.now();
      if (now - state.lastScrub < 85) return; /* rate-limit */
      state.lastScrub = now;
      blip(440 + ratio * 520, { dur: 0.05, vol: 0.26, cutoff: 1300 });
    },
    play() {
      blip(523, { type: 'triangle', dur: 0.09, vol: 0.28, cutoff: 2200 });
      blip(784, { type: 'triangle', dur: 0.12, vol: 0.28, cutoff: 2200, delay: 0.09 });
    },
    pause() {
      blip(784, { type: 'triangle', dur: 0.09, vol: 0.28, cutoff: 2200 });
      blip(523, { type: 'triangle', dur: 0.12, vol: 0.28, cutoff: 2200, delay: 0.09 });
    },
    menuOpen()  { blip(392, { to: 587, dur: 0.16, vol: 0.24, cutoff: 1800 }); },
    menuClose() { blip(587, { to: 392, dur: 0.16, vol: 0.24, cutoff: 1800 }); },
    toggle() {
      muted = !muted;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) {}
      if (!muted) blip(660, { dur: 0.06, vol: 0.35 });
      return muted;
    },
  };

  /* quick taps anywhere tick softly — drags, scrubs and buttons stay quiet
     (buttons carry their own semantic sounds) */
  let dX = 0, dY = 0, dT = 0, tracking = false;
  addEventListener('pointerdown', e => {
    tracking = true; dX = e.clientX; dY = e.clientY; dT = performance.now();
  }, true);
  addEventListener('pointerup', e => {
    if (!tracking) return;
    tracking = false;
    if (e.target && e.target.closest && e.target.closest('button')) return;
    const moved = Math.abs(e.clientX - dX) + Math.abs(e.clientY - dY);
    if (moved < 8 && performance.now() - dT < 600) api.click();
  }, true);

  /* mute toggle button (all pages) */
  const btn = document.getElementById('sfxBtn');
  if (btn) {
    const paint = () => {
      btn.classList.toggle('muted', muted);
      btn.setAttribute('aria-pressed', String(!muted));
      btn.setAttribute('aria-label', muted ? 'Interaction sounds off' : 'Interaction sounds on');
    };
    paint();
    btn.addEventListener('click', () => { api.toggle(); paint(); });
  }

  return api;
})();
