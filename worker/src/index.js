/**
 * BrokenRanks Settings — shared edits API.
 *
 * The page lives on GitHub Pages; this Worker only stores the corrections
 * laid over its built-in tables, so every viewer sees the same values.
 *
 *   GET    /api/edits             -> { edits: { key: value, ... } }   public
 *   PUT    /api/edits  <- { key, value }  -> { ok, key, value }       PIN required
 *   DELETE /api/edits  <- { key }         -> { ok, key }              PIN required
 *   POST   /api/check                     -> { ok }                   PIN required
 *
 * The PIN arrives in the `x-edit-pin` header and is compared against the
 * EDIT_PIN secret (set with `wrangler secret put EDIT_PIN`, never in a file).
 * Only the GitHub Pages origin may call it from a browser.
 */

const ALLOWED_ORIGINS = ['https://ddrake1984.github.io'];
// timers/champions/<group>/<row> holds the kill time (ms since epoch) of a shared respawn timer
const KEY_RE = /^(champions|flasks|shards|timers)\/[A-Za-z0-9 _\-\/.']{1,120}$/;
const MAX_VALUE = 300;

/* Compare without leaking the answer in how long it took. */
function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cors(request) {
  const origin = request.headers.get('origin');
  const h = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    vary: 'origin',
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h['access-control-allow-origin'] = origin;
    h['access-control-allow-methods'] = 'GET, PUT, DELETE, POST, OPTIONS';
    h['access-control-allow-headers'] = 'content-type, x-edit-pin';
    h['access-control-max-age'] = '86400';
  }
  return h;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });

    const origin = request.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) return json({ error: 'origin_not_allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    if (url.pathname === '/api/edits' && request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT key, value FROM edits').all();
      const edits = {};
      for (const r of results) edits[r.key] = r.value;
      return json({ edits });
    }

    if (url.pathname !== '/api/edits' && url.pathname !== '/api/check') return json({ error: 'not_found' }, 404);

    // everything below writes or checks the PIN
    if (!env.EDIT_PIN) return json({ error: 'not_configured', hint: 'wrangler secret put EDIT_PIN' }, 503);
    if (!sameSecret(request.headers.get('x-edit-pin') || '', env.EDIT_PIN)) return json({ error: 'bad_pin' }, 401);

    if (url.pathname === '/api/check' && request.method === 'POST') return json({ ok: true });

    if (request.method !== 'PUT' && request.method !== 'DELETE') return json({ error: 'method_not_allowed' }, 405);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: 'bad_json' }, 400);
    }
    const key = body && body.key;
    if (typeof key !== 'string' || !KEY_RE.test(key)) return json({ error: 'bad_key' }, 400);

    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM edits WHERE key = ?').bind(key).run();
      return json({ ok: true, key });
    }

    const value = body.value;
    if (typeof value !== 'string' || !value.trim() || value.length > MAX_VALUE) return json({ error: 'bad_value' }, 400);
    await env.DB.prepare(
      "INSERT INTO edits (key, value, updated_at) VALUES (?, ?, datetime('now')) " +
      'ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at'
    ).bind(key, value.trim()).run();
    return json({ ok: true, key, value: value.trim() });
  },
};
