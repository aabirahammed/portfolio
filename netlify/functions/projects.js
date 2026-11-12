/* ============================================================
   Netlify function: projects — CMS write access for /admin
   The Supabase publishable key in the frontend is read-only (RLS).
   Writes go through here, guarded by a password Netlify env var.
   Env vars: SUPABASE_SERVICE_KEY (secret), ADMIN_PASS (secret).
   Headers on every request: x-admin-pass
   GET              → all rows (including hidden), ordered by sort
   POST   {row}     → insert
   PATCH  {id,...}  → update one row's fields
   DELETE ?id=N     → delete one row
   ============================================================ */
const URL_ = 'https://jaicdkzevoswlmvnphbv.supabase.co';
const TABLE = `${URL_}/rest/v1/projects`;

const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/* password check (constant-time-ish) */
const crypto = require('crypto');
function passOK(given) {
  const want = process.env.ADMIN_PASS || '';
  if (!want) return false;
  const a = crypto.createHash('sha256').update(String(given || '')).digest();
  const b = crypto.createHash('sha256').update(want).digest();
  return crypto.timingSafeEqual(a, b);
}

/* Supabase REST with the service key (bypasses RLS, server only) */
async function sb(method, path, body) {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw { status: 500, error: 'CMS service key not configured yet.' };
  const r = await fetch(TABLE + path, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const detail = await r.text();
    console.error('supabase', r.status, detail.slice(0, 300));
    throw { status: 502, error: 'Database refused the change.' };
  }
  return method === 'GET' ? r.json() : null;
}

const FIELDS = ['title', 'client', 'year', 'meta', 'colors', 'sort', 'live'];

/* sanitize row fields coming from the admin UI */
function clean(f) {
  const out = {};
  if (f.title !== undefined) out.title = String(f.title).trim().slice(0, 80);
  if (f.client !== undefined) out.client = String(f.client).trim().slice(0, 60);
  if (f.year !== undefined) out.year = Number(f.year) || 2026;
  if (f.meta !== undefined) out.meta = String(f.meta).trim().slice(0, 60);
  if (f.sort !== undefined) out.sort = Number(f.sort) || 0;
  if (f.live !== undefined) out.live = !!f.live;
  if (f.colors !== undefined) {
    const c = Array.isArray(f.colors) ? f.colors : [];
    out.colors = c.slice(0, 2).map(x => {
      const s = String(x).trim().toLowerCase();
      return /^#[0-9a-f]{6}$/.test(s) ? s : '#ffb020';
    });
    while (out.colors.length < 2) out.colors.push('#ffb020');
  }
  return out;
}

exports.handler = async (event) => {
  /* auth — every verb */
  if (!passOK(event.headers['x-admin-pass']))
    return json(401, { ok: false, error: 'Wrong password.' });

  try {
    if (event.httpMethod === 'GET')
      return json(200, { ok: true, rows: await sb('GET', '?select=*&order=sort.asc') });

    if (event.httpMethod === 'POST') {
      const d = JSON.parse(event.body || '{}');
      const row = clean(d.row || {});
      if (!row.title) return json(422, { ok: false, error: 'Title is required.' });
      await sb('POST', '', row);
      return json(200, { ok: true });
    }

    if (event.httpMethod === 'PATCH') {
      const d = JSON.parse(event.body || '{}');
      const id = Number(d.id);
      if (!id) return json(422, { ok: false, error: 'Missing row id.' });
      await sb('PATCH', `?id=eq.${id}`, clean(d));
      return json(200, { ok: true });
    }

    if (event.httpMethod === 'DELETE') {
      const id = Number((event.queryStringParameters || {}).id);
      if (!id) return json(422, { ok: false, error: 'Missing row id.' });
      await sb('DELETE', `?id=eq.${id}`);
      return json(200, { ok: true });
    }

    return json(405, { ok: false, error: 'Method not allowed' });
  } catch (e) {
    return json(e.status || 500, { ok: false, error: e.error || 'Unexpected error.' });
  }
};
