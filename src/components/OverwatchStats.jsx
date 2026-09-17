import { useEffect, useState } from 'react';
import './OverwatchStats.css';

// served by api/overwatch.js (Vercel) or scripts/overwatch-dev-api.js (`vite` dev)
const ENDPOINT = '/api/overwatch';

const number = new Intl.NumberFormat();
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function Skeleton() {
  return (
    <div className="ow">
      <div className="ow-card glass" role="status" aria-label="Loading Overwatch stats">
        <div className="ow-head">
          <span className="ow-avatar ow-shimmer" />
          <div className="ow-id">
            <span className="ow-line ow-line--title ow-shimmer" style={{ width: '55%' }} />
            <span className="ow-line ow-shimmer" style={{ width: '35%' }} />
          </div>
        </div>
        <div className="ow-stats">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="ow-stat ow-shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function emptyMessage(data) {
  if (import.meta.env.DEV) {
    if (data.status === 'unconfigured') return 'Add OVERWATCH_BATTLETAG to .env.local.';
    if (data.status === 'offline') return 'Couldn’t reach the OverFast API — check OVERFAST_API_URL or try again.';
    if (data.status === 'not_found') return data.error;
  }
  return 'Overwatch stats are taking a break right now.';
}

export default function OverwatchStats() {
  const [data, setData] = useState(null); // null while the request is in flight

  // career stats move slowly (OverFast caches them ~10 min), so one fetch per visit is plenty
  useEffect(() => {
    let cancelled = false;
    fetch(ENDPOINT)
      .then((res) => res.json())
      .catch(() => ({ status: 'error' }))
      .then((next) => {
        if (!cancelled) setData(next);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return <Skeleton />;
  if (data.status !== 'ok') {
    // still a card, so the Outside Work stack keeps its shape
    return (
      <div className="ow">
        <div className="ow-card glass">
          <p className="ow-empty mono">{emptyMessage(data)}</p>
        </div>
      </div>
    );
  }

  const { player } = data;

  return (
    <div className="ow">
      {player.namecard && (
        <div className="ow-glow" style={{ backgroundImage: `url("${player.namecard}")` }} aria-hidden="true" />
      )}

      <article className="ow-card glass">
        <header className="ow-head">
          {player.avatar && <img className="ow-avatar" src={player.avatar} alt="" />}
          <div className="ow-id">
            <h3 className="ow-name display">
              <a href={player.profileUrl} target="_blank" rel="noopener noreferrer">
                {player.name}
                <span className="ow-arrow" aria-hidden="true">
                  {' '}
                  ↗
                </span>
              </a>
            </h3>
            <p className="ow-sub mono">
              {/* each part stays whole; a narrow card breaks between them, not inside one */}
              {[player.title, player.endorsement != null && `Endorsement ${player.endorsement}`]
                .filter(Boolean)
                .map((part, i) => (
                  <span key={part}>
                    {i > 0 && ' · '}
                    {part}
                  </span>
                ))}
            </p>
          </div>

          {player.ranks.length > 0 && (
            <ul className="ow-ranks" aria-label={`Competitive ranks${player.season ? `, season ${player.season}` : ''}`}>
              {player.ranks.map((r) => (
                <li key={r.role} className="ow-rank">
                  {r.icon && <img src={r.icon} alt="" />}
                  <span className="mono">
                    <b>{capitalize(r.role)}</b>
                    {capitalize(r.division)} {r.tier}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </header>

        {player.stats ? (
          <>
            <dl className="ow-stats">
              <div className="ow-stat">
                <dt className="mono">Hours</dt>
                <dd className="display">{number.format(player.stats.hoursPlayed)}</dd>
              </div>
              <div className="ow-stat">
                <dt className="mono">Games</dt>
                <dd className="display">{number.format(player.stats.gamesPlayed)}</dd>
              </div>
              <div className="ow-stat">
                <dt className="mono">Win rate</dt>
                <dd className="display">{player.stats.winrate.toFixed(1)}%</dd>
              </div>
              <div className="ow-stat">
                <dt className="mono">KDA</dt>
                <dd className="display">{player.stats.kda.toFixed(2)}</dd>
              </div>
            </dl>

            {player.topHeroes.length > 0 && (
              <ol className="ow-heroes" aria-label="Most played heroes">
                {player.topHeroes.map((h) => (
                  <li key={h.key} className="ow-hero">
                    {h.portrait && <img src={h.portrait} alt="" />}
                    <div>
                      <span className="ow-hero-name">{h.name}</span>
                      <span className="ow-hero-meta mono">
                        {number.format(h.hoursPlayed)}h · {h.winrate.toFixed(0)}% WR
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <p className="ow-empty mono">Career stats are private right now.</p>
        )}
      </article>
    </div>
  );
}
