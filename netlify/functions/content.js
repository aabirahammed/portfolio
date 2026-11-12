/* ============================================================
   Netlify function: content — CMS writes for the /admin page
   POST { updates: { key: value, ... } }  → upsert rows.
   Auth: header x-admin-pass === env ADMIN_PASS.
   Uses SUPABASE_SERVICE_KEY (server-only secret).
   Reads are public (publishable key + RLS read policy).
   ============================================================ */
const crypto = require('crypto');
const URL_ = 'https://jaicdkzevoswlmvnphbv.supabase.co';

const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

function passOK(given) {
  const want = process.env.ADMIN_PASS || '';
  if (!want) return false;
  const a = crypto.createHash('sha256').update(String(given || '')).digest();
  const b = crypto.createHash('sha256').update(want).digest();
  return crypto.timingSafeEqual(a, b);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });
  if (!passOK(event.headers['x-admin-pass'])) return json(401, { ok: false, error: 'Wrong password.' });

  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) return json(500, { ok: false, error: 'CMS service key not configured yet.' });

  let d;
  try { d = JSON.parse(event.body || '{}'); }
  catch { return json(400, { ok: false, error: 'Bad request' }); }

  const updates = d.updates && typeof d.updates === 'object' ? d.updates : null;
  if (!updates) return json(422, { ok: false, error: 'Nothing to save.' });

  /* validate + build rows */
  const rows = [];
  for (const [k, v] of Object.entries(updates)) {
    if (!/^[a-z0-9._-]{1,60}$/.test(k)) return json(422, { ok: false, error: `Bad key: ${k}` });
    rows.push({ key: k, value: String(v).slice(0, 4000) });
  }

  try {
    const r = await fetch(`${URL_}/rest/v1/content?on_conflict=key`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error('content upsert', r.status, detail.slice(0, 300));
      return json(502, { ok: false, error: 'Database refused the change.' });
    }
    return json(200, { ok: true, saved: rows.length });
  } catch (e) {
    console.error('content fn', e);
    return json(502, { ok: false, error: 'Network hiccup — try again.' });
  }
};
