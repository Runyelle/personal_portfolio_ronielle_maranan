// Dev-only (`vite` serve) Spotify routes. In production Vercel serves
// api/spotify.js directly; plain `vite` has no serverless runtime, so this
// plugin mounts that same handler locally, plus a one-time login that mints
// the owner's refresh token:
//
//   1. npm run dev
//   2. open http://127.0.0.1:5173/api/spotify/login and approve
//   3. Spotify redirects to /callback, which saves SPOTIFY_REFRESH_TOKEN to
//      .env.local and shows the value to copy into Vercel
//
// The redirect URI must be registered in the Spotify dashboard exactly as
// DEFAULT_REDIRECT_URI (or whatever SPOTIFY_REDIRECT_URI overrides it with).

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';
import spotifyHandler from '../api/spotify.js';

const DEFAULT_REDIRECT_URI = 'http://127.0.0.1:5173/callback';
const SCOPES = 'user-read-currently-playing user-read-recently-played';

// Vercel's Node runtime adds res.status()/res.json(); connect's res doesn't
function withVercelHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

function saveRefreshToken(root, token) {
  const file = path.join(root, '.env.local');
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  const existing = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const pattern = /^SPOTIFY_REFRESH_TOKEN=.*$/m;
  const next = pattern.test(existing)
    ? existing.replace(pattern, () => line)
    : `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}${line}\n`;
  writeFileSync(file, next);
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const page = (title, body) => `<!doctype html>
<meta charset="utf-8">
<title>${title}</title>
<body style="font:15px/1.6 system-ui,sans-serif;background:#08080a;color:#e9eaee;max-width:640px;margin:60px auto;padding:0 20px">
${body}
</body>`;

const LINK_STYLE = 'color:#b9bcc4';

export default function spotifyDevApi() {
  let root = process.cwd();
  const pendingStates = new Set();

  return {
    name: 'spotify-dev-api',
    apply: 'serve',

    configResolved(config) {
      root = config.root;
      // expose only the SPOTIFY_* values to the handler, the way Vercel would
      const env = loadEnv(config.mode, config.envDir || root, 'SPOTIFY_');
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value;
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://127.0.0.1');
          const redirectUri = process.env.SPOTIFY_REDIRECT_URI || DEFAULT_REDIRECT_URI;

          if (url.pathname === '/api/spotify') {
            await spotifyHandler(req, withVercelHelpers(res));
            return;
          }

          if (url.pathname === '/api/spotify/login') {
            const state = randomBytes(16).toString('hex');
            pendingStates.add(state);
            const params = new URLSearchParams({
              response_type: 'code',
              client_id: process.env.SPOTIFY_CLIENT_ID || '',
              scope: SCOPES,
              redirect_uri: redirectUri,
              state,
            });
            res.statusCode = 302;
            res.setHeader('Location', `https://accounts.spotify.com/authorize?${params}`);
            res.end();
            return;
          }

          if (url.pathname === new URL(redirectUri).pathname) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');
            const denied = url.searchParams.get('error');

            if (denied) {
              res.end(page('Spotify', `<p>Spotify returned <code>${escapeHtml(denied)}</code>. <a style="${LINK_STYLE}" href="/api/spotify/login">Try again</a>.</p>`));
              return;
            }
            if (!code || !pendingStates.has(state)) {
              res.statusCode = 400;
              res.end(page('Spotify', `<p>Invalid or expired login attempt. <a style="${LINK_STYLE}" href="/api/spotify/login">Start again</a>.</p>`));
              return;
            }
            pendingStates.delete(state);

            const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              headers: {
                Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
            });
            const data = await tokenRes.json().catch(() => ({}));

            if (!tokenRes.ok || !data.refresh_token) {
              res.statusCode = 502;
              res.end(page('Spotify', `<p>Token exchange failed: <code>${escapeHtml(data.error_description || data.error || tokenRes.status)}</code></p>`));
              return;
            }

            process.env.SPOTIFY_REFRESH_TOKEN = data.refresh_token;
            // respond before touching .env.local — Vite restarts when env files change
            res.end(
              page(
                'Spotify connected',
                `<h1 style="font-size:24px">Spotify connected</h1>
<p>Saved <code>SPOTIFY_REFRESH_TOKEN</code> to <code>.env.local</code>, so the Outside Work panel works locally now.</p>
<p>For production, add the same value in Vercel &rarr; Project Settings &rarr; Environment Variables:</p>
<pre style="white-space:pre-wrap;word-break:break-all;background:#15151a;padding:12px;border-radius:8px">${escapeHtml(data.refresh_token)}</pre>
<p><a style="${LINK_STYLE}" href="/">Back to the site</a></p>`
              )
            );
            saveRefreshToken(root, data.refresh_token);
            return;
          }

          next();
        } catch (err) {
          next(err);
        }
      });
    },
  };
}
