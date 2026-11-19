/* The guests' blessings ("Your blessings & good words"), on Vercel.

     GET  /api/wishes   the newest notes first
     POST /api/wishes   { name, text } adds one

   The same rules as netlify/functions/wishes.mjs (the Netlify copy); only the storage differs.
   Notes live in an Upstash Redis database that Vercel connects to the project:
     Vercel project → Storage → Create Database → Upstash for Redis (free plan) → Connect.
   Vercel then hands this function KV_REST_API_URL and KV_REST_API_TOKEN (or the
   UPSTASH_REDIS_REST_* pair); redeploy once after connecting so it sees them.

   Every note is one field of the hash "wishes" (field = the note's id), so two guests
   writing at the same moment never overwrite each other.

   To take a note down: Upstash console → the database → Data Browser → "wishes",
   delete that field, or type in its CLI:   HDEL wishes <id>

   No packages: it talks to Upstash's REST address with the fetch built into Node. */

const { createHmac } = require('node:crypto');

const MAX_NAME = 60, MAX_TEXT = 600, SHOWN = 300, PER_HOUR = 20; // 20 an hour from one connection leaves room for a family or a venue sharing one Wi-Fi
const KEY = 'wishes';

/* plain text only: control characters out, at most one blank line in a row */
const clean = (s, max) => String(s == null ? '' : s)
  .replace(/\r\n?/g, '\n')
  .replace(/[\u0000-\u0009\u000B-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim()
  .slice(0, max)
  .trim();

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

function store() {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '');
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
  if (!url || !token) return null;
  /* one command, or several in one trip: [['INCR', 'k'], ['EXPIRE', 'k', '3600']] */
  async function call(path, body) {
    const r = await fetch(url + path, { method: 'POST', headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const out = await r.json().catch(() => null);
    if (!r.ok || !out) throw new Error('Upstash answered ' + r.status + (out && out.error ? ': ' + out.error : ''));
    return out;
  }
  return {
    token,
    run: async cmd => { const out = await call('', cmd); if (out.error) throw new Error('Upstash: ' + out.error); return out.result; },
    many: async cmds => (await call('/pipeline', cmds)).map(o => { if (o.error) throw new Error('Upstash: ' + o.error); return o.result; })
  };
}

/* Vercel has usually read the body already (req.body); anywhere else, read it here */
async function bodyOf(req) {
  let b;
  try { b = req.body; } catch (e) { return null; } // Vercel's getter throws on broken JSON
  if (b === undefined) {
    const chunks = []; let n = 0;
    for await (const c of req) { n += c.length; if (n > 16384) return null; chunks.push(c); }
    b = Buffer.concat(chunks).toString('utf8');
  }
  if (Buffer.isBuffer(b)) b = b.toString('utf8');
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { return null; } }
  return b && typeof b === 'object' && !Array.isArray(b) ? b : null;
}

function ipOf(req) {
  const h = req.headers || {};
  return String(h['x-real-ip'] || String(h['x-forwarded-for'] || '').split(',')[0] || (req.socket && req.socket.remoteAddress) || 'unknown').trim();
}

module.exports = async function wishes(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') { res.setHeader('allow', 'GET, POST'); return send(res, 405, { error: 'Not allowed' }); }

  const db = store();
  if (!db) {
    console.error('wishes: no database. Connect Upstash for Redis under the project’s Storage tab (it sets KV_REST_API_URL and KV_REST_API_TOKEN), then redeploy.');
    return send(res, 503, { error: 'The blessings wall is not open yet. Please try again soon.' });
  }

  try {
    if (req.method === 'GET') {
      const flat = (await db.run(['HGETALL', KEY])) || [];
      const wishes = [];
      for (let i = 0; i + 1 < flat.length; i += 2) {
        try { const w = JSON.parse(flat[i + 1]); if (w && w.id && w.name && w.text) wishes.push(w); } catch (e) { /* a broken field is skipped */ }
      }
      wishes.sort((a, b) => (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
      return send(res, 200, { wishes: wishes.slice(0, SHOWN) });
    }

    const body = await bodyOf(req);
    if (!body) return send(res, 400, { error: 'Something went wrong. Please try again.' });
    if (body.website) return send(res, 201, { ok: true }); // the hidden field only robots fill in

    const name = clean(body.name, MAX_NAME).replace(/\n+/g, ' ');
    const text = clean(body.text, MAX_TEXT);
    if (!name) return send(res, 400, { error: 'Please add your name.' });
    if (text.length < 2) return send(res, 400, { error: 'Please write a few words.' });

    /* a few notes an hour from one connection is plenty (the address is kept only as a keyed hash, for an hour) */
    const now = Date.now();
    const who = 'ip:' + createHmac('sha256', db.token).update(ipOf(req)).digest('hex').slice(0, 24) + ':' + Math.floor(now / 3600e3);
    const [count] = await db.many([['INCR', who], ['EXPIRE', who, '3600']]);
    if (count > PER_HOUR) return send(res, 429, { error: 'So much love! Please try again in a little while.' });

    const at = new Date(now).toISOString();
    const id = at.replace(/\D/g, '') + '-' + Math.random().toString(36).slice(2, 8);
    const wish = { id, name, text, at };
    await db.run(['HSET', KEY, id, JSON.stringify(wish)]);
    return send(res, 201, { wish });
  } catch (e) {
    console.error('wishes:', e && e.message || e);
    return send(res, 503, { error: 'That didn’t go through. Please try again in a moment.' });
  }
};
