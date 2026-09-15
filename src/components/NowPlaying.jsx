import { useEffect, useRef, useState } from 'react';
import './NowPlaying.css';

// served by api/spotify.js (Vercel) or scripts/spotify-dev-api.js (`vite` dev)
const ENDPOINT = '/api/spotify';
const POLL_PLAYING_MS = 15_000;
const POLL_IDLE_MS = 60_000;

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

function timeAgo(iso, now) {
  const seconds = Math.round((Date.parse(iso) - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return 'just now';
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), 'hour');
  return relative.format(Math.round(seconds / 86400), 'day');
}

function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15 10.56 18.72 12.84c.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="np">
      <div className="np-card glass" role="status" aria-label="Loading Spotify activity">
        <span className="np-art np-shimmer" />
        <div className="np-body">
          <span className="np-line np-shimmer" style={{ width: '28%' }} />
          <span className="np-line np-line--title np-shimmer" style={{ width: '70%' }} />
          <span className="np-line np-shimmer" style={{ width: '45%' }} />
        </div>
      </div>
    </div>
  );
}

export default function NowPlaying() {
  const [data, setData] = useState(null); // null while the first request is in flight
  const [now, setNow] = useState(() => Date.now());
  const latest = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;

    const schedule = () => {
      clearTimeout(timer);
      if (document.hidden) return;
      const current = latest.current;
      let delay = POLL_IDLE_MS;
      if (current?.status === 'playing' && current.track.durationMs) {
        const elapsed = Date.now() - current.fetchedAt;
        const remaining = current.track.durationMs - (current.progressMs + elapsed);
        // check again just after the song should end so the next one shows promptly
        delay = Math.max(2_000, Math.min(POLL_PLAYING_MS, remaining + 1_500));
      } else if (current?.status === 'playing') {
        delay = POLL_PLAYING_MS;
      }
      timer = setTimeout(load, delay);
    };

    async function load() {
      let next;
      try {
        const res = await fetch(ENDPOINT);
        next = { ...(await res.json()), fetchedAt: Date.now() };
      } catch {
        next = { status: 'error', fetchedAt: Date.now() };
      }
      if (cancelled) return;
      // a transient failure shouldn't wipe a track that's already on screen
      if (next.status === 'error' && latest.current?.track) {
        next = latest.current;
      }
      latest.current = next;
      setData(next);
      setNow(Date.now());
      schedule();
    }

    // don't poll Spotify from a background tab; catch up as soon as it's visible
    const onVisibilityChange = () => {
      if (document.hidden) clearTimeout(timer);
      else load();
    };

    load();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const playing = data?.status === 'playing';
  const hasTrack = Boolean(data?.track);

  // tick the progress bar every second while playing; refresh "x minutes ago" otherwise
  useEffect(() => {
    if (!hasTrack) return undefined;
    const id = setInterval(() => setNow(Date.now()), playing ? 1_000 : 30_000);
    return () => clearInterval(id);
  }, [playing, hasTrack]);

  if (!data) return <Skeleton />;

  if (!hasTrack) {
    let message = 'Spotify is taking a break right now.';
    if (data.status === 'idle') message = 'Nothing played on Spotify lately.';
    if (import.meta.env.DEV && data.status === 'unauthorized') {
      message = (
        <>
          Spotify isn&rsquo;t connected yet &mdash; <a href="/api/spotify/login">connect it</a> (dev
          only, one time).
        </>
      );
    }
    if (import.meta.env.DEV && data.status === 'unconfigured') {
      message = 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local.';
    }
    return <p className="panel-empty np-empty mono">{message}</p>;
  }

  const { track } = data;
  const progress = playing
    ? Math.min(track.durationMs ?? Infinity, data.progressMs + Math.max(0, now - data.fetchedAt))
    : 0;
  const percent = playing && track.durationMs ? (progress / track.durationMs) * 100 : 0;

  return (
    <div className="np">
      {track.art && (
        <div className="np-glow" style={{ backgroundImage: `url("${track.art}")` }} aria-hidden="true" />
      )}

      <article className="np-card glass">
        <a
          className="np-art"
          href={track.url || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${track.title} on Spotify`}
        >
          {track.art && <img src={track.art} alt="" />}
        </a>

        <div className="np-body">
          <div className={`np-status mono${playing ? ' is-playing' : ''}`}>
            {playing ? (
              <>
                <span className="np-eq" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                Now playing
              </>
            ) : (
              <>Last played{data.playedAt && ` · ${timeAgo(data.playedAt, now)}`}</>
            )}
          </div>

          <h3 className="np-title display">{track.title}</h3>
          {track.artists && <p className="np-artist">{track.artists}</p>}
          {track.album && <p className="np-album mono">{track.album}</p>}

          {playing && track.durationMs ? (
            <div className="np-progress mono">
              <span>{formatTime(progress)}</span>
              <div
                key={track.url}
                className="np-bar"
                role="progressbar"
                aria-label="Track progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(percent)}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
              <span>{formatTime(track.durationMs)}</span>
            </div>
          ) : null}

          {track.url && (
            <a className="np-link mono" href={track.url} target="_blank" rel="noopener noreferrer">
              <SpotifyIcon />
              Open in Spotify
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
