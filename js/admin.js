/* ============================================================
   ADMIN — /admin page logic (CMS studio)
   Landing: cards of pages (Global/Home/Work/Reel/About/Services).
   Open a card → that page's editor, organized in sections.
   The Work page also contains the Projects (3D carousel) editor.
   All reads/writes go through the Netlify functions with the
   password (sessionStorage). No secrets live in this page.
   ============================================================ */
(function () {
  const FN_PROJECTS = '/.netlify/functions/projects';
  const FN_CONTENT = '/.netlify/functions/content';
  const KEY = 'aabir-admin-pass';

  const gate = document.getElementById('gate');
  const gateMsg = document.getElementById('gateMsg');
  const passEl = document.getElementById('pass');
  const app = document.getElementById('app');
  const pagesGrid = document.getElementById('pagesGrid');
  const pageEdit = document.getElementById('pageEdit');
  const backBtn = document.getElementById('backBtn');
  const where = document.getElementById('where');
  const saveHint = document.getElementById('saveHint');
  const saveContentBtn = document.getElementById('saveContentBtn');
  const reloadBtn = document.getElementById('reloadBtn');
  const toast = document.getElementById('toast');

  const PAGES = [
    { name: 'Global',   desc: 'Logo wordmark, nav button and contact email, shared by every page' },
    { name: 'Home',     desc: 'Hero, roles, stats row and the ticker marquee' },
    { name: 'Work',     desc: 'Hero + the 3D project carousel editor' },
    { name: 'Reel',     desc: 'Hero, loop badge and the scene captions' },
    { name: 'About',    desc: 'Hero and the four career milestones' },
    { name: 'Services', desc: 'Hero and the four service cards' },
  ];

  let rows = [];            /* projects from the DB */
  let pass = null;
  let dirty = new Set();    /* content keys with unsaved edits */
  let fieldOf = {};         /* key → { wrap, input, deflt } */
  let pageOf = {};          /* key → page name */
  let curPage = null;       /* page currently open, null = landing */
  let listEl = null;        /* projects list container (Work page) */
  let toastT = null;

  function say(txt, kind) {
    toast.textContent = txt;
    toast.className = 'show ' + (kind || 'busy');
    clearTimeout(toastT);
    if (kind !== 'busy') toastT = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  async function api(method, body, qs) {
    const r = await fetch(FN_PROJECTS + (qs || ''), {
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
     AUTH
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
      curPage = null;
      paintLanding();
      say('Unlocked.', 'ok');
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

  /* ============================================================
     HELPERS
   ============================================================ */
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

  /* ============================================================
     PROJECTS — card editor (lives inside the Work page)
   ============================================================ */
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

    el.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
      el.classList.add('dirty');
      if (inp.dataset.k === 'c0' || inp.dataset.k === 'c1') paint(el);
    }));

    el.querySelector('.save').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true; btn.textContent = 'Saving…';
      try {
        await api('PATCH', { id: r.id, ...collect(el) });
        el.classList.remove('dirty');
        say('Saved — live on the site.', 'ok');
      } catch (err) { say(err.message, 'bad'); }
      btn.disabled = false; btn.textContent = 'Save';
    });

    const swap = async (dir) => {
      const j = i + dir;
      if (j < 0 || j >= rows.length) return;
      const a = rows[i], b = rows[j];
      say('Reordering…');
      try {
        await api('PATCH', { id: a.id, sort: b.sort });
        await api('PATCH', { id: b.id, sort: a.sort });
        await refreshProjects();
        say('Order updated.', 'ok');
      } catch (err) { say(err.message, 'bad'); }
    };
    el.querySelector('.up').addEventListener('click', () => swap(-1));
    el.querySelector('.down').addEventListener('click', () => swap(1));

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
        await refreshProjects();
      } catch (err) { say(err.message, 'bad'); }
    });

    return el;
  }

  function renderProjects() {
    if (!listEl) return;
    listEl.innerHTML = '';
    rows.forEach((r, i) => listEl.appendChild(card(r, i)));
    const count = document.getElementById('projCount');
    if (count) count.textContent = rows.length + ' projects · ' + rows.filter(x => x.live).length + ' live';
  }

  async function refreshProjects() {
    try {
      rows = (await api('GET')).rows;
      renderProjects();
    } catch (e) { say(e.message, 'bad'); }
  }

  /* ============================================================
     LANDING — page cards
   ============================================================ */
  function paintLanding() {
    where.innerHTML = 'ALL PAGES';
    backBtn.hidden = true;
    pagesGrid.hidden = false;
    pageEdit.hidden = true;
    pagesGrid.innerHTML = '';
    for (const p of PAGES) {
      const el = document.createElement('div');
      el.className = 'pcard';
      el.dataset.page = p.name;
      const n = window.CMS_CATALOG.filter(f => f.page === p.name).length;
      el.innerHTML = `
        <span class="nd"></span>
        <div class="go">→</div>
        <div class="pname">${p.name === 'Global' ? 'GLOBAL' : p.name.toUpperCase()}</div>
        <div class="pdesc">${p.desc}</div>
        <div class="pcount">${p.name === 'Work' ? n + ' text fields + projects' : n + ' text fields'}</div>`;
      el.addEventListener('click', () => openPage(p.name));
      pagesGrid.appendChild(el);
    }
    paintDirty();
    paintSave();
  }

  function paintDirty() {
    pagesGrid.querySelectorAll('.pcard').forEach(el => {
      el.classList.toggle('has-dirty', [...dirty].some(k => pageOf[k] === el.dataset.page));
    });
  }

  /* ============================================================
     PAGE EDITOR — sections from the catalog
   ============================================================ */
  function fld(f) {
    const wrap = document.createElement('div');
    wrap.className = 'fld' + (f.rich || (f.d || '').length > 46 ? ' wide' : '');
    wrap.dataset.key = f.k;
    const lbl = document.createElement('label');
    lbl.innerHTML = `<span>${f.label}</span>` + (f.hint ? `<span class="hint">${f.hint}</span>` : '');
    wrap.appendChild(lbl);
    const inp = document.createElement(f.rich || (f.d || '').length > 46 ? 'textarea' : 'input');
    const cur = (window.CMS_CONTENT || {})[f.k];
    inp.value = cur === undefined ? f.d : cur;
    inp.placeholder = f.d || '';
    inp.addEventListener('input', () => {
      const base = (window.CMS_CONTENT || {})[f.k] ?? f.d;
      if (inp.value === base) { dirty.delete(f.k); wrap.classList.remove('dirty'); }
      else { dirty.add(f.k); wrap.classList.add('dirty'); }
      paintSave(); paintDirty();
    });
    wrap.appendChild(inp);
    fieldOf[f.k] = { wrap, input: inp, deflt: f.d };
    return wrap;
  }

  function section(title, fields) {
    const sec = document.createElement('div');
    sec.className = 'sec';
    sec.innerHTML = `<div class="sec-h">${title.toUpperCase()} <span class="gcount">— ${fields.length} field${fields.length === 1 ? '' : 's'}</span></div>`;
    const grid = document.createElement('div');
    grid.className = 'fgrid';
    let sub = null;
    for (const f of fields) {
      if (f.sub !== sub) {
        sub = f.sub;
        if (sub) {
          const sb = document.createElement('div');
          sb.className = 'subblock';
          sb.innerHTML = `<h4>${sub.toUpperCase()}</h4><div class="fgrid"></div>`;
          grid.appendChild(sb);
        }
      }
      const host = sub ? grid.lastElementChild.querySelector('.fgrid') : grid;
      host.appendChild(fld(f));
    }
    sec.appendChild(grid);
    return sec;
  }

  function projectsSection() {
    const sec = document.createElement('div');
    sec.className = 'sec';
    sec.innerHTML = `<div class="sec-h">PROJECTS <span class="gcount">— the 3D carousel</span></div>
      <p class="chint" style="margin-top:10px">Cards below appear in the Work-page gallery. <b>Sort</b> sets the order, <b>LIVE</b> shows/hides, colors paint the frame artwork.</p>
      <div class="proj-bar">
        <button class="btn primary" id="addBtn" type="button">+ Add project</button>
        <span class="ghostnum" id="projCount"></span>
      </div>`;
    listEl = document.createElement('div');
    listEl.style.marginTop = '14px';
    sec.appendChild(listEl);
    sec.querySelector('#addBtn').addEventListener('click', async () => {
      const maxSort = rows.length ? Math.max(...rows.map(r => r.sort)) : 0;
      say('Creating…');
      try {
        await api('POST', { row: {
          title: 'NEW PROJECT', client: 'Client', year: new Date().getFullYear(),
          meta: 'Edit + Motion', colors: ['#ffb020', '#ff6a3d'], sort: maxSort + 10, live: false,
        }});
        await refreshProjects();
        say('Project added (hidden) — edit and tick LIVE.', 'ok');
        listEl.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) { say(e.message, 'bad'); }
    });
    return sec;
  }

  async function openPage(name) {
    if (window.CMS_CONTENT_READY) await window.CMS_CONTENT_READY;
    curPage = name;
    for (const k in fieldOf) delete fieldOf[k];
    pagesGrid.hidden = true;
    pageEdit.hidden = false;
    pageEdit.innerHTML = '';
    backBtn.hidden = false;
    where.innerHTML = name.toUpperCase() + ' <i>/ editor</i>';

    const fields = window.CMS_CATALOG.filter(f => f.page === name);
    const secs = [...new Set(fields.map(f => f.sec))];
    for (const s of secs) {
      pageEdit.appendChild(section(s, fields.filter(f => f.sec === s)));
    }
    if (name === 'Work') {
      pageEdit.appendChild(projectsSection());
      renderProjects();
    }
    paintSave();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backBtn.addEventListener('click', () => {
    curPage = null;
    listEl = null;
    paintLanding();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     SAVE / RELOAD (global)
   ============================================================ */
  function paintSave() {
    saveContentBtn.disabled = dirty.size === 0;
    saveContentBtn.textContent = dirty.size ? `Save content (${dirty.size})` : 'Save content';
    saveHint.textContent = dirty.size
      ? `${dirty.size} unsaved edit${dirty.size === 1 ? '' : 's'} — pages marked ●`
      : 'Edits are marked — save when ready';
  }

  saveContentBtn.addEventListener('click', async () => {
    if (!dirty.size) return;
    saveContentBtn.disabled = true;
    saveContentBtn.textContent = 'Saving…';
    const updates = {};
    for (const k of dirty) updates[k] = fieldOf[k].input.value;
    try {
      const r = await fetch(FN_CONTENT, {
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
        if (fieldOf[k]) fieldOf[k].wrap.classList.remove('dirty');
      }
      say(`Saved ${d.saved} change${d.saved === 1 ? '' : 's'} — live on the site.`, 'ok');
    } catch (e) { say(e.message, 'bad'); }
    paintSave(); paintDirty();
  });

  reloadBtn.addEventListener('click', async () => {
    say('Reloading…');
    dirty.clear();
    if (window.CMS_REFETCH) await window.CMS_REFETCH();
    await refreshProjects();
    if (curPage) await openPage(curPage); else paintLanding();
    say('Reloaded from the database.', 'ok');
  });

  /* auto-unlock if the session already has the pass */
  const saved = sessionStorage.getItem(KEY);
  if (saved) unlock(saved);
  else passEl.focus();
})();
