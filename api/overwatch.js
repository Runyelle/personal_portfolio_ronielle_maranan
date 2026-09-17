// Overwatch 2 career snapshot for the "Off the clock" panel (Showcase panel 4).
//
// Blizzard has no official Overwatch API, so this reads the community OverFast
// API (https://github.com/TeKrop/overfast-api), which needs no key or login:
//   OVERWATCH_BATTLETAG  whose profile to show, Name#1234 or Name-1234
//   OVERFAST_API_URL     optional, only to use a self-hosted instance instead
// The career profile must be public in game for stats to show up.
//
// Response shape:
//   { status: 'ok', player }        player.stats / topHeroes are null / [] when the career is private
//   { status: 'unconfigured' | 'not_found' | 'offline' | 'error', error }

const DEFAULT_API_URL = 'https://overfast-api.tekrop.fr';
const TIMEOUT_MS = 25_000; // an uncached player makes OverFast scrape Blizzard, which can take a while
const HEROES_TTL_MS = 24 * 60 * 60 * 1000;
const ROLE_ORDER = ['tank', 'damage', 'support', 'open'];

// the hero list (names + portraits) barely changes; reuse it while the lambda / dev server stays warm
let cachedHeroes = null;

class OverfastError extends Error {
  constructor(status, path) {
    super(`${path} failed (${status})`);
    this.status = status;
  }
}

async function overfastGet(baseUrl, path) {
  const res = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new OverfastError(res.status, path);
  return res.json();
}

async function getHeroes(baseUrl) {
  if (cachedHeroes && cachedHeroes.expiresAt > Date.now()) return cachedHeroes.byKey;
  const list = await overfastGet(baseUrl, '/heroes');
  const byKey = Object.fromEntries(list.map((h) => [h.key, h]));
  cachedHeroes = { byKey, expiresAt: Date.now() + HEROES_TTL_MS };
  return byKey;
}

const hours = (seconds) => Math.round(seconds / 3600);

function toRanks(competitive) {
  // prefer PC ranks, fall back to console for console-only players
  const platform = competitive?.pc || competitive?.console;
  if (!platform) return { season: null, ranks: [] };
  const ranks = ROLE_ORDER.filter((role) => platform[role]).map((role) => ({
    role,
    division: platform[role].division,
    tier: platform[role].tier,
    icon: platform[role].rank_icon,
  }));
  return { season: platform.season ?? null, ranks };
}

function toTopHeroes(heroStats, heroes) {
  return Object.entries(heroStats || {})
    .sort(([, a], [, b]) => b.time_played - a.time_played)
    .slice(0, 3)
    .map(([key, s]) => ({
      key,
      name: heroes?.[key]?.name || key,
      portrait: heroes?.[key]?.portrait || null,
      role: heroes?.[key]?.role || null,
      hoursPlayed: hours(s.time_played),
      gamesPlayed: s.games_played,
      winrate: s.winrate,
    }));
}

export default async function handler(req, res) {
  const baseUrl = (process.env.OVERFAST_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
  const battletag = process.env.OVERWATCH_BATTLETAG?.trim().replace('#', '-');

  if (!battletag) {
    res.status(500).json({ status: 'unconfigured', error: 'OVERWATCH_BATTLETAG not set' });
    return;
  }

  const playerPath = `/players/${encodeURIComponent(battletag)}`;

  try {
    const [summary, statsSummary, heroes] = await Promise.all([
      overfastGet(baseUrl, `${playerPath}/summary`),
      overfastGet(baseUrl, `${playerPath}/stats/summary`),
      // portraits are nice-to-have; a failure here shouldn't hide the profile
      getHeroes(baseUrl).catch(() => null),
    ]);

    const general = statsSummary?.general;
    const player = {
      name: summary.username,
      title: summary.title || null,
      avatar: summary.avatar || null,
      namecard: summary.namecard || null,
      endorsement: summary.endorsement?.level ?? null,
      ...toRanks(summary.competitive),
      stats: general
        ? {
            hoursPlayed: hours(general.time_played),
            gamesPlayed: general.games_played,
            winrate: general.winrate,
            kda: general.kda,
          }
        : null,
      topHeroes: toTopHeroes(statsSummary?.heroes, heroes),
      profileUrl: `https://overwatch.blizzard.com/en-us/career/${encodeURIComponent(battletag)}/`,
    };

    // OverFast itself caches careers for ~10 minutes; matching that at the edge
    // also keeps the site to a few requests an hour against the free public instance
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
    res.status(200).json({ status: 'ok', player });
  } catch (err) {
    console.error('overwatch:', err.message);
    if (err.status === 404) {
      res.status(404).json({ status: 'not_found', error: `No Overwatch player found for ${battletag}` });
    } else if (err instanceof OverfastError) {
      res.status(502).json({ status: 'error', error: 'OverFast API returned an error' });
    } else {
      // connection refused / DNS / timeout: OverFast isn't reachable
      res.status(503).json({ status: 'offline', error: `Could not reach OverFast API at ${baseUrl}` });
    }
  }
}
