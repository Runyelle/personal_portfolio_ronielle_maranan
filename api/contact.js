// Delivers the <TextMe /> chat card's answers to my inbox, via Resend.
//
//   RESEND_API_KEY   from https://resend.com (free tier) — required
//   CONTACT_TO       where to deliver (defaults to my address)
//   CONTACT_FROM     verified sender; Resend's shared onboarding@resend.dev
//                    works until you verify your own domain
//
// Replies go to whatever email the visitor typed, so "Reply" in the inbox
// just works.

const RESEND_URL = 'https://api.resend.com/emails';
const DEFAULT_TO = 'ron.maranan01@gmail.com';
const DEFAULT_FROM = 'Portfolio <onboarding@resend.dev>';
const MAX_LENGTH = 500;
const FIELDS = ['name', 'topic', 'email', 'extra'];

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

// Vercel's Node runtime parses JSON bodies; the plain connect server in dev doesn't
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = await readBody(req);
  const answers = Object.fromEntries(
    FIELDS.map((field) => [field, String(body[field] ?? '').trim().slice(0, MAX_LENGTH)])
  );

  if (!answers.name || !answers.topic || !isEmail(answers.email)) {
    res.status(400).json({ error: 'Missing or invalid fields' });
    return;
  }

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY) {
    console.error('contact: RESEND_API_KEY not set');
    res.status(503).json({ error: 'Contact delivery not configured' });
    return;
  }

  const lines = [
    `Name:  ${answers.name}`,
    `Email: ${answers.email}`,
    '',
    `Wants to talk about:`,
    answers.topic,
    '',
    `Anything else:`,
    answers.extra || '—',
  ];

  try {
    const send = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM || DEFAULT_FROM,
        to: [CONTACT_TO || DEFAULT_TO],
        reply_to: answers.email,
        subject: `Portfolio chat — ${answers.name}`,
        text: lines.join('\n'),
        html: `<pre style="font:14px/1.6 ui-monospace,monospace">${escapeHtml(lines.join('\n'))}</pre>`,
      }),
    });

    if (!send.ok) {
      const detail = await send.text().catch(() => '');
      throw new Error(`resend ${send.status}: ${detail.slice(0, 200)}`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('contact:', err.message);
    res.status(502).json({ error: 'Could not send the message' });
  }
}
