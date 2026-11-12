/* ============================================================
   EDIT — shared "edit" timeline engine
   Owns: timecode, playhead, scrubbing, space play/pause.
   Every page's scene reads EDIT.time / EDIT.paused each frame,
   so the timeline always drives the artwork.
   ============================================================ */
(function () {
  const EDIT = {
    dur: 12,
    time: 0,
    paused: false,
    scrubbing: false,
    get ratio() { return this.time / this.dur; },
  };
  window.EDIT = EDIT;

  const tcEl      = document.getElementById('tc');
  const phEl      = document.getElementById('playhead');
  const tlState   = document.getElementById('tlState');
  const tlStateTxt= document.getElementById('tlStateTxt');
  const tlScrub   = document.getElementById('tlScrub');
  if (!tlScrub) return;

  EDIT.dur = Number(document.body.dataset.editDur) || 12;

  function timecode(t) {
    const f = Math.floor((t % 1) * 24);
    const s = Math.floor(t) % 60;
    const m = Math.floor(t / 60) % 60;
    return `00:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  }
  function setPlayhead() {
    phEl.style.left = (EDIT.time / EDIT.dur * 100) + '%';
    tcEl.textContent = timecode(EDIT.time);
  }
  function updateState() {
    tlState.classList.toggle('paused', EDIT.paused);
    tlStateTxt.textContent = EDIT.paused ? 'Paused' : 'Playing';
  }
  function setPaused(p) {
    if (EDIT.paused === p) return;
    EDIT.paused = p;
    updateState();
    if (window.SFX) p ? SFX.pause() : SFX.play();
  }
  EDIT.toggle = () => setPaused(!EDIT.paused);
  function scrubTo(clientX) {
    const r = tlScrub.getBoundingClientRect();
    EDIT.time = Math.min(Math.max((clientX - r.left) / r.width, 0), 1) * EDIT.dur;
    setPlayhead();
    if (window.SFX) SFX.scrub(EDIT.time / EDIT.dur);
  }

  let wasPlaying = false;
  tlScrub.addEventListener('pointerdown', e => {
    EDIT.scrubbing = true; wasPlaying = !EDIT.paused;
    EDIT.paused = true; updateState();
    scrubTo(e.clientX);
    try { tlScrub.setPointerCapture(e.pointerId); } catch (err) { /* synthetic/injected pointers */ }
  });
  tlScrub.addEventListener('pointermove', e => { if (EDIT.scrubbing) scrubTo(e.clientX); });
  addEventListener('pointerup', () => {
    if (EDIT.scrubbing) { EDIT.scrubbing = false; EDIT.paused = !wasPlaying; updateState(); }
  });
  addEventListener('keydown', e => {
    /* space pauses the timeline — but never while the user is typing
       (contact form fields need their spaces) */
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.code === 'Space') { e.preventDefault(); setPaused(!EDIT.paused); }
  });

  let last = performance.now();
  (function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!EDIT.paused && !EDIT.scrubbing) {
      EDIT.time = (EDIT.time + dt) % EDIT.dur;
      setPlayhead();
    }
  })(performance.now());
})();

/* ============================================================
   Mobile menu — burger toggle (shared by every page)
   ============================================================ */
(function () {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    if (window.SFX) open ? SFX.menuOpen() : SFX.menuClose();
  });
  const back = menu.querySelector('.mm-back');
  if (back) back.addEventListener('click', close);
  menu.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  function close() {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    if (window.SFX) SFX.menuClose();
  }
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
