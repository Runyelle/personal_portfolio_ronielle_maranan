// Spotify listening activity for the "Outside Work" panel (Showcase panel 3).
//
// Uses the site owner's refresh token (SPOTIFY_REFRESH_TOKEN), so visitors see
// what I'm listening to without logging in themselves. Mint that token once
// locally — see scripts/spotify-dev-api.js — then set all three SPOTIFY_* vars
// in Vercel's Project Settings -> Environment Variables.
//
// Response shape:
//   { status: 'playing', track, progressMs }
//   { status: 'recent',  track, playedAt }
//   { status: 'idle' }                         nothing played recently
//   { status: 'unconfigured' | 'unauthorized' | 'error', error }

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_URL = 'https://api.spotify.com/v1';

// access tokens last an hour; reuse one while a lambda / dev server stays warm
let cachedToken = null;

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: SPOTIFY_REFRESH_TOKEN }),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(`token refresh failed (${res.status}): ${data.error_description || data.error}`);
    // a revoked / wrong refresh token needs a fresh login, not a retry
    err.unauthorized = data.error === 'invalid_grant';
    throw err;
  }

  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function spotifyGet(path, token) {
  const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${path} failed (${res.status}): ${data?.error?.message}`);
  return data;
}

function toTrack(item) {
  const isEpisode = item.type === 'episode';
  return {
    title: item.name,
    artists: isEpisode ? item.show?.name : item.artists?.map((a) => a.name).join(', '),
    album: isEpisode ? item.show?.publisher : item.album?.name,
    art: (isEpisode ? item.images : item.album?.images)?.[0]?.url || null,
    url: item.external_urls?.spotify || null,
    durationMs: item.duration_ms ?? null,
  };
}

export default async function handler(req, res) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    res.status(500).json({ status: 'unconfigured', error: 'SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set' });
    return;
  }
  if (!SPOTIFY_REFRESH_TOKEN) {
    res.status(503).json({ status: 'unauthorized', error: 'SPOTIFY_REFRESH_TOKEN not set' });
    return;
  }

  try {
    const token = await getAccessToken();
    const current = await spotifyGet('/me/player/currently-playing?additional_types=track,episode', token);

    let body;
    // a paused track (or an ad, which has no item) counts as "not playing"
    if (current?.item && current.is_playing) {
      body = { status: 'playing', track: toTrack(current.item), progressMs: current.progress_ms ?? 0 };
    } else {
      const recent = await spotifyGet('/me/player/recently-played?limit=1', token);
      const last = recent?.items?.[0];
      body = last
        ? { status: 'recent', track: toTrack(last.track), playedAt: last.played_at }
        : { status: 'idle' };
    }

    // a short shared cache absorbs traffic spikes without making "now playing" stale
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=20');
    res.status(200).json(body);
  } catch (err) {
    console.error('spotify:', err.message);
    if (err.unauthorized) {
      res.status(503).json({ status: 'unauthorized', error: 'Refresh token rejected — log in again' });
    } else {
      res.status(502).json({ status: 'error', error: 'Failed to reach Spotify' });
    }
  }
}
