/* ============================================================
   Netlify function: contact — emails the portfolio owner via Resend
   POST /.netlify/functions/contact  { name, email, message }
   Secrets come from Netlify env vars: RESEND_API_KEY, CONTACT_TO.
   No HTML/parsing deps — plain Node, no build step.
   Email validation: syntax + the domain must actually accept mail
   (DNS MX/A lookup) + disposable-domain blocklist.
   ============================================================ */
const dns = require('dns').promises;

const TO = process.env.CONTACT_TO || 'ahammedaabir@gmail.com';
const FROM = process.env.CONTACT_FROM || 'Portfolio Contact <onboarding@resend.dev>';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* throwaway-address providers — reject outright */
const DISPOSABLE = new Set([
  'mailinator.com','10minutemail.com','guerrillamail.com','yopmail.com',
  'temp-mail.org','throwawaymail.com','sharklasers.com','dispostable.com',
  'fakeinbox.com','getnada.com','trashmail.com','tempmail.dev','maildrop.cc',
  'mailnesia.com','spamgourmet.com','burnermail.io','trbvm.com','mohmal.com',
]);

/* true if the domain publishes MX records (or an A fallback, which
   mail servers accept per RFC) — i.e. it can receive email */
async function domainAcceptsMail(domain) {
  try {
    const mx = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, rej) => setTimeout(() => rej(new Error('dns-timeout')), 4000)),
    ]);
    if (Array.isArray(mx) && mx.length) return true;
  } catch { /* fall through */ }
  try {
    const a = await Promise.race([
      dns.resolve4(domain),
      new Promise((_, rej) => setTimeout(() => rej(new Error('dns-timeout')), 4000)),
    ]);
    return Array.isArray(a) && a.length > 0;
  } catch { return false; }
}

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

  /* the email must belong to a domain that can actually receive mail */
  const domain = email.split('@')[1].toLowerCase();
  if (DISPOSABLE.has(domain))
    return json(422, { ok: false, error: 'Disposable email addresses are not accepted — please use your real email, I reply to it.' });
  if (!(await domainAcceptsMail(domain)))
    return json(422, { ok: false, error: "That email domain doesn't accept mail — please double-check the address, I reply to it." });

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
