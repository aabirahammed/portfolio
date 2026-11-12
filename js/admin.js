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

  /* ============================================================
     TABS — Projects / Content
   ============================================================ */
  const tabs = document.querySelectorAll('.tab');
  const projView = document.getElementById('projView');
  const contentView = document.getElementById('contentView');
  for (const t of tabs) t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('active', x === t));
    projView.hidden = t.dataset.tab !== 'projects';
    contentView.hidden = t.dataset.tab !== 'content';
    if (t.dataset.tab === 'content') buildContent();
  });

  /* ============================================================
     CONTENT EDITOR — page-wise sections from window.CMS_CATALOG
     Pick a page chip → see only that page's fields. Edits are
     kept across page switches; Save posts every dirty field.
   ============================================================ */
  const contentList = document.getElementById('contentList');
  const pgTabs = document.getElementById('pgTabs');
  const saveContentBtn = document.getElementById('saveContentBtn');
  const dirty = new Set();               /* keys with unsaved edits */
  const fieldOf = {};                    /* key → { wrap, input, deflt } */
  let pageOf = {};                       /* key → group name */
  let curPage = null;

  function contentValue(k, deflt) {
    const v = (window.CMS_CONTENT || {})[k];
    return v === undefined ? deflt : v;
  }
  function paintSave() {
    saveContentBtn.disabled = dirty.size === 0;
    saveContentBtn.textContent = dirty.size ? `Save content (${dirty.size})` : 'Save content';
  }
  function paintChips() {
    pgTabs.querySelectorAll('.pgtab').forEach(ch => {
      ch.classList.toggle('has-dirty', [...dirty].some(k => pageOf[k] === ch.dataset.g));
    });
  }

  async function buildContent() {
    if (window.CMS_CONTENT_READY) await window.CMS_CONTENT_READY;
    contentList.innerHTML = '';
    pgTabs.innerHTML = '';
    dirty.clear();
    for (const k in fieldOf) delete fieldOf[k];
    pageOf = {};

    const groups = [...new Set(window.CMS_CATALOG.map(f => f.g))];
    const sections = {};

    /* page chips */
    for (const g of groups) {
      const ch = document.createElement('button');
      ch.type = 'button';
      ch.className = 'pgtab';
      ch.dataset.g = g;
      ch.textContent = g.toUpperCase();
      ch.innerHTML += '<span class="nd"></span>';
      ch.addEventListener('click', () => showPage(g));
      pgTabs.appendChild(ch);
    }

    /* one section per page */
    for (const g of groups) {
      const sec = document.createElement('div');
      sec.className = 'group';
      sec.hidden = true;
      const n = window.CMS_CATALOG.filter(x => x.g === g).length;
      sec.innerHTML = `<h3>${g.toUpperCase()} <span class="gcount">— ${n} fields</span></h3>`;
      const grid = document.createElement('div');
      grid.className = 'cgrid';
      for (const f of window.CMS_CATALOG.filter(x => x.g === g)) {
        pageOf[f.k] = g;
        const wrap = document.createElement('div');
        wrap.className = 'cfield' + (f.rich || (f.d || '').length > 46 ? ' wide' : '');
        wrap.dataset.key = f.k;
        wrap.innerHTML = `<label>${f.label} <span style="opacity:.55">· ${f.k}</span></label>`;
        const inp = document.createElement(f.rich || (f.d || '').length > 46 ? 'textarea' : 'input');
        inp.value = contentValue(f.k, f.d);
        inp.placeholder = f.d || '';
        inp.addEventListener('input', () => {
          const cur = (window.CMS_CONTENT || {})[f.k] ?? f.d;
          if (inp.value === cur) { dirty.delete(f.k); wrap.classList.remove('dirty'); }
          else { dirty.add(f.k); wrap.classList.add('dirty'); }
          paintSave(); paintChips();
        });
        wrap.appendChild(inp);
        fieldOf[f.k] = { wrap, input: inp, deflt: f.d };
        grid.appendChild(wrap);
      }
      sec.appendChild(grid);
      contentList.appendChild(sec);
      sections[g] = sec;
    }

    function showPage(g) {
      curPage = g;
      pgTabs.querySelectorAll('.pgtab').forEach(ch => ch.classList.toggle('active', ch.dataset.g === g));
      for (const name of groups) sections[name].hidden = name !== g;
    }
    buildContent.showPage = showPage;
    showPage(groups.includes('Home') ? 'Home' : groups[0]);
    paintSave(); paintChips();
  }

  saveContentBtn.addEventListener('click', async () => {
    if (!dirty.size) return;
    saveContentBtn.disabled = true;
    saveContentBtn.textContent = 'Saving…';
    const updates = {};
    for (const k of dirty) updates[k] = fieldOf[k].input.value;
    try {
      const r = await fetch('/.netlify/functions/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-pass': pass },
        body: JSON.stringify({ updates }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 401) { lock(); throw new Error('Password rejected — signed out.'); }
      if (!r.ok || !d.ok) throw new Error(d.error || 'Save failed.');
      Object.assign(window.CMS_CONTENT, updates);
      for (const k of Object.keys(updates)) {
        dirty.delete(k);
        fieldOf[k].wrap.classList.remove('dirty');
      }
      say(`Saved ${d.saved} change${d.saved === 1 ? '' : 's'} — live on the site.`, 'ok');
    } catch (e) { say(e.message, 'bad'); }
    paintSave(); paintChips();
  });
  document.getElementById('reloadContentBtn').addEventListener('click', async () => {
    dirty.clear();
    await buildContent();
    if (buildContent.showPage) buildContent.showPage(curPage || 'Home');
    say('Content reloaded.', 'ok');
  });

  /* ============================================================
     auth
   ============================================================ */
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
