/* ============================================================
   ADMIN — /admin page logic (CMS for the projects table)
   All reads/writes go through the Netlify function with the
   password (sessionStorage). The public publishable key stays
   read-only; this page holds no secrets.
   ============================================================ */
(function () {
  const FN = '/.netlify/functions/projects';
  const KEY = 'aabir-admin-pass';

  const gate = document.getElementById('gate');
  const gateMsg = document.getElementById('gateMsg');
  const passEl = document.getElementById('pass');
  const app = document.getElementById('app');
  const list = document.getElementById('list');
  const count = document.getElementById('count');
  const toast = document.getElementById('toast');

  let rows = [];
  let pass = null;
  let toastT = null;

  function say(txt, kind) {
    toast.textContent = txt;
    toast.className = 'show ' + (kind || 'busy');
    clearTimeout(toastT);
    if (kind !== 'busy') toastT = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  async function api(method, body, qs) {
    const r = await fetch(FN + (qs || ''), {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-pass': pass },
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401) { lock(); throw new Error('Password rejected — signed out.'); }
    if (!r.ok || !d.ok) throw new Error(d.error || 'Request failed.');
    return d;
  }

  /* ---------- auth ---------- */
  function lock() {
    sessionStorage.removeItem(KEY);
    pass = null;
    app.hidden = true;
    gate.hidden = false;
    passEl.value = '';
    passEl.focus();
  }
  async function unlock(p) {
    pass = p;
    say('Checking…');
    try {
      const d = await api('GET');
      sessionStorage.setItem(KEY, pass);
      gate.hidden = true;
      app.hidden = false;
      rows = d.rows;
      render();
      say('Unlocked — ' + rows.length + ' projects loaded.', 'ok');
    } catch (e) {
      pass = null;
      gateMsg.textContent = e.message;
    }
  }

  document.getElementById('gateBtn').addEventListener('click', () => {
    const v = passEl.value;
    if (!v) { gateMsg.textContent = 'Enter the password.'; return; }
    gateMsg.textContent = '';
    unlock(v);
  });
  passEl.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('gateBtn').click(); });
  document.getElementById('signout').addEventListener('click', () => { lock(); say('Signed out.', 'ok'); });

  /* ---------- render ---------- */
  function card(r, i) {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = r.id;
    el.innerHTML = `
      <div class="row">
        <div class="f"><label>Sort</label><input class="mono f-sort" type="number" data-k="sort" value="${r.sort}"></div>
        <label class="livebox"><input type="checkbox" data-k="live" ${r.live ? 'checked' : ''}><span>LIVE ON SITE</span></label>
        <div class="f f-title"><label>Title</label><input data-k="title" value="${esc(r.title)}"></div>
        <div class="f f-client"><label>Client / Type</label><input data-k="client" value="${esc(r.client)}"></div>
        <div class="f f-year"><label>Year</label><input type="number" data-k="year" value="${r.year}"></div>
      </div>
      <div class="row">
        <div class="f f-meta"><label>Role line</label><input data-k="meta" value="${esc(r.meta)}"></div>
        <div class="f"><label>Color A</label><input type="color" data-k="c0" value="${hex(r.colors[0])}"></div>
        <div class="f"><label>Color B</label><input type="color" data-k="c1" value="${hex(r.colors[1])}"></div>
        <div class="swatch" style="background:linear-gradient(135deg,${hex(r.colors[0])},${hex(r.colors[1])})"></div>
      </div>
      <div class="acts">
        <button class="mini save" type="button">Save</button>
        <button class="mini up" type="button" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="mini down" type="button" ${i === rows.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="mini del" type="button">Delete</button>
        <span class="ghostnum">#${r.id}</span>
      </div>`;

    /* dirty highlight */
    el.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
      el.classList.add('dirty');
      if (inp.dataset.k === 'c0' || inp.dataset.k === 'c1') paint(el);
    }));

    /* save */
    el.querySelector('.save').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = 'Saving…';
      try {
        await api('PATCH', { id: r.id, ...collect(el) });
        r.title = collect(el).title;
        el.classList.remove('dirty');
        say('Saved — live on the site.', 'ok');
      } catch (err) { say(err.message, 'bad'); }
      btn.disabled = false; btn.textContent = 'Save';
    });

    /* reorder — swap sort values with the neighbour, then reload */
    const swap = async (dir) => {
      const j = i + dir;
      if (j < 0 || j >= rows.length) return;
      const a = rows[i], b = rows[j];
      say('Reordering…');
      try {
        await api('PATCH', { id: a.id, sort: b.sort });
        await api('PATCH', { id: b.id, sort: a.sort });
        await refresh();
        say('Order updated.', 'ok');
      } catch (err) { say(err.message, 'bad'); }
    };
    el.querySelector('.up').addEventListener('click', () => swap(-1));
    el.querySelector('.down').addEventListener('click', () => swap(1));

    /* delete — two-step confirm */
    const del = el.querySelector('.del');
    del.addEventListener('click', async () => {
      if (!del.classList.contains('arm')) {
        del.classList.add('arm');
        del.textContent = 'Sure?';
        setTimeout(() => { del.classList.remove('arm'); del.textContent = 'Delete'; }, 2600);
        return;
      }
      try {
        await api('DELETE', null, `?id=${r.id}`);
        say('Deleted.', 'ok');
        await refresh();
      } catch (err) { say(err.message, 'bad'); }
    });

    return el;
  }

  function render() {
    list.innerHTML = '';
    rows.forEach((r, i) => list.appendChild(card(r, i)));
    count.textContent = rows.length + ' projects · ' + rows.filter(x => x.live).length + ' live';
  }

  async function refresh() {
    try {
      rows = (await api('GET')).rows;
      render();
    } catch (e) { say(e.message, 'bad'); }
  }
  document.getElementById('reloadBtn').addEventListener('click', refresh);

  /* add */
  document.getElementById('addBtn').addEventListener('click', async () => {
    const maxSort = rows.length ? Math.max(...rows.map(r => r.sort)) : 0;
    say('Creating…');
    try {
      await api('POST', { row: {
        title: 'NEW PROJECT', client: 'Client', year: new Date().getFullYear(),
        meta: 'Edit + Motion', colors: ['#ffb020', '#ff6a3d'], sort: maxSort + 10, live: false,
      }});
      await refresh();
      say('Project added (hidden) — edit and tick LIVE.', 'ok');
      list.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) { say(e.message, 'bad'); }
  });

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s ?? '').replace(/[&"]/g, c => c === '&' ? '&amp;' : '&quot;');
  }
  function hex(c) {
    const s = String(c || '').trim().toLowerCase();
    return /^#[0-9a-f]{6}$/.test(s) ? s : '#ffb020';
  }
  function paint(el) {
    const a = el.querySelector('[data-k=c0]').value, b = el.querySelector('[data-k=c1]').value;
    el.querySelector('.swatch').style.background = `linear-gradient(135deg,${a},${b})`;
  }
  function collect(el) {
    const g = k => el.querySelector(`[data-k="${k}"]`);
    return {
      title: g('title').value,
      client: g('client').value,
      year: Number(g('year').value) || 2026,
      meta: g('meta').value,
      sort: Number(g('sort').value) || 0,
      live: g('live').checked,
      colors: [g('c0').value, g('c1').value],
    };
  }

  /* auto-unlock if the session already has the pass */
  const saved = sessionStorage.getItem(KEY);
  if (saved) unlock(saved);
  else passEl.focus();
})();
