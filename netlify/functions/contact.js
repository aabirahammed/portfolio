/* ============================================================
   Netlify function: contact — emails the portfolio owner via Resend
   POST /.netlify/functions/contact  { name, email, message }
   Secrets come from Netlify env vars: RESEND_API_KEY, CONTACT_TO.
   No HTML/parsing deps — plain Node, no build step.
   ============================================================ */
const TO = process.env.CONTACT_TO || 'ahammedaabir@gmail.com';
const FROM = process.env.CONTACT_FROM || 'Portfolio Contact <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (code, body) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  let d;
  try { d = JSON.parse(event.body || '{}'); }
  catch { return json(400, { ok: false, error: 'Bad request' }); }

  const name = String(d.name || '').trim().slice(0, 120);
  const email = String(d.email || '').trim().slice(0, 200);
  const message = String(d.message || '').trim().slice(0, 4000);

  /* honeypot: real visitors never fill this hidden field */
  if (d.website) return json(200, { ok: true }); /* pretend success, drop silently */

  if (!name || !EMAIL_RE.test(email) || message.length < 10)
    return json(422, { ok: false, error: 'Please fill all fields (message needs at least 10 characters).' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return json(500, { ok: false, error: 'Mail service not configured yet — please email me directly.' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `Portfolio inquiry — ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error('resend error', r.status, detail.slice(0, 300));
      return json(502, { ok: false, error: 'Mail service hiccup — please email me directly.' });
    }
    return json(200, { ok: true });
  } catch (e) {
    console.error('contact fn', e);
    return json(502, { ok: false, error: 'Network hiccup — please try again.' });
  }
};
