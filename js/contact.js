/* ============================================================
   CONTACT — "Let's talk" modal, injected on every page.
   The nav CTA stays a real mailto link in the HTML (works even
   with JS disabled); here we only intercept the click and open
   the form instead. Submits to the Netlify function, which
   emails via Resend. Fails gracefully with a mailto fallback.
   ============================================================ */
(function () {
  const cta = document.querySelector('.nav-cta');
  if (!cta) return;

  /* ---------- build the modal ---------- */
  const veil = document.createElement('div');
  veil.className = 'contact-veil';
  veil.innerHTML = `
    <div class="contact-panel" role="dialog" aria-modal="true" aria-label="Contact form">
      <button class="contact-x" aria-label="Close">×</button>
      <p class="contact-eyebrow"><span class="contact-dot"></span>REPLY WITHIN 24H</p>
      <h2 class="contact-h">LET'S TALK</h2>
      <form class="contact-form" novalidate>
        <label>Name
          <input name="name" type="text" maxlength="120" autocomplete="name" required placeholder="Your name">
        </label>
        <label>Email
          <input name="email" type="email" maxlength="200" autocomplete="email" required placeholder="you@studio.com">
        </label>
        <label>Project details
          <textarea name="message" rows="4" maxlength="4000" required
            placeholder="What are we cutting? Timeline, deliverables, budget…"></textarea>
        </label>
        <input name="website" class="contact-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit" class="contact-send"><span class="cs-txt">Send message</span><span class="cs-arrow">→</span></button>
        <p class="contact-status" hidden></p>
      </form>
      <p class="contact-alt">Prefer email? <a href="mailto:ahammedaabir@gmail.com">ahammedaabir@gmail.com</a></p>
    </div>`;
  document.body.appendChild(veil);

  const panel  = veil.querySelector('.contact-panel');
  const form   = veil.querySelector('.contact-form');
  const status = veil.querySelector('.contact-status');
  const send   = veil.querySelector('.contact-send');
  let open = false, lastFocus = null;

  function show() {
    open = true;
    lastFocus = document.activeElement;
    veil.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    if (window.SFX) SFX.menuOpen();
    setTimeout(() => veil.querySelector('input[name="name"]').focus(), 60);
  }
  function hide() {
    if (!open) return;
    open = false;
    veil.classList.remove('open');
    document.documentElement.style.overflow = '';
    if (window.SFX) SFX.menuClose();
    if (lastFocus) lastFocus.focus();
  }

  cta.addEventListener('click', (e) => { e.preventDefault(); show(); });
  veil.addEventListener('click', (e) => { if (e.target === veil) hide(); });
  veil.querySelector('.contact-x').addEventListener('click', hide);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) hide(); });

  /* ---------- submit ---------- */
  function say(txt, ok) {
    status.textContent = txt;
    status.className = 'contact-status ' + (ok ? 'ok' : 'bad');
    status.hidden = false;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get('name') || '').trim();
    const email = (f.get('email') || '').trim();
    const message = (f.get('message') || '').trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 10) {
      say('Please fill name, a valid email, and a few words about the project.', false);
      return;
    }
    send.disabled = true;
    send.classList.add('busy');
    send.querySelector('.cs-txt').textContent = 'Sending…';
    status.hidden = true;
    try {
      const r = await fetch('/.netlify/functions/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website: f.get('website') }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.ok) {
        send.querySelector('.cs-txt').textContent = 'Sent ✓';
        send.querySelector('.cs-arrow').textContent = '';
        say("Got it — I'll reply within 24 hours.", true);
        if (window.SFX) SFX.play();
        form.reset();
        setTimeout(hide, 1800);
      } else {
        throw new Error(d.error || 'Something went wrong.');
      }
    } catch (err) {
      say(String(err.message || err) + ' — or write to ahammedaabir@gmail.com directly.', false);
      if (window.SFX) SFX.pause();
    } finally {
      send.disabled = false;
      send.classList.remove('busy');
      send.querySelector('.cs-txt').textContent = 'Send message';
      send.querySelector('.cs-arrow').textContent = '→';
    }
  });
})();
