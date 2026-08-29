// football-data.org data layer. Free tier ("TIER_ONE") covers the Premier
// League and the Champions League for Liverpool (team id 64), which is all
// KopTalk shows. Needs FOOTBALL_DATA_API_KEY in the environment.

const BASE_URL = 'https://api.football-data.org/v4';
const LIVERPOOL_TEAM_ID = 64;

// Whole-season window so we get every fixture, not just the next handful.
// The PL/CL season runs roughly August–May; treat July as the rollover.
function seasonWindow(now = new Date()) {
  const startYear =
    now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  return { dateFrom: `${startYear}-07-01`, dateTo: `${startYear + 1}-06-30` };
}

// Returns the raw football-data.org match objects for Liverpool this season,
// or null on any failure (caller falls back to the hardcoded snapshot).
export async function getLiverpoolMatches() {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    console.error('football-data.org: FOOTBALL_DATA_API_KEY not set');
    return null;
  }

  const { dateFrom, dateTo } = seasonWindow();
  let res;
  try {
    res = await fetch(
      `${BASE_URL}/teams/${LIVERPOOL_TEAM_ID}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      { headers: { 'X-Auth-Token': key }, next: { revalidate: 60 } }
    );
  } catch (err) {
    console.error('football-data.org fetch failed', err);
    return null;
  }

  if (!res.ok) {
    console.error('football-data.org error', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return Array.isArray(data.matches) ? data.matches : null;
}

const COMP_NAMES = {
  PL: 'Premier League',
  CL: 'Champions League',
};

const STAGE_LABELS = {
  LEAGUE_STAGE: 'League Phase',
  PLAYOFFS: 'Play-offs',
  PLAYOFF_ROUND: 'Play-off Round',
  LAST_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-Final',
  SEMI_FINALS: 'Semi-Final',
  FINAL: 'Final',
};

// Stripping " FC" off the official name handles most clubs cleanly
// ("Newcastle United FC" -> "Newcastle United"). These few come out awkward,
// so override them by football-data.org team id.
const TEAM_NAMES = {
  71: 'Sunderland',
  78: 'Atlético Madrid',
  94: 'Villarreal',
  108: 'Inter Milan',
  322: 'Hull City',
  503: 'Porto',
  546: 'Lens',
  613: 'Fenerbahçe',
  851: 'Club Brugge',
};

function displayName(team) {
  if (TEAM_NAMES[team.id]) return TEAM_NAMES[team.id];
  const name = team.name || team.shortName || '';
  return name.replace(/\s+FC$/, '');
}

function formatKickoff(iso) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date(iso));
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const period = get('dayPeriod').toLowerCase().replace(/\s+/g, '');
  return `${get('weekday')} ${get('day')} ${get('month')}, ${get('hour')}:${get('minute')}${period}`;
}

function statusLabel(match) {
  switch (match.status) {
    case 'IN_PLAY':
      return 'LIVE';
    case 'PAUSED':
      return 'HALF-TIME';
    case 'FINISHED':
    case 'AWARDED':
      return 'FULL-TIME';
    case 'POSTPONED':
      return 'Postponed';
    case 'SUSPENDED':
      return 'Suspended';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return formatKickoff(match.utcDate);
  }
}

// Turns one raw football-data.org match into KopTalk's fixture shape.
//
// The id is stable and human-readable — `pl<matchday>` / `cl<matchday>` — so
// existing comment threads (keyed by match_id in Supabase) stay attached across
// deploys. Knockout ties with no matchday fall back to `<code>-<fixtureId>`.
export function mapMatch(match) {
  const code = String(match.competition.code || '').toLowerCase();
  const compName = COMP_NAMES[match.competition.code] || match.competition.name;
  const hasMatchday = match.matchday != null;

  const id = hasMatchday ? `${code}${match.matchday}` : `${code}-${match.id}`;

  let comp;
  if (hasMatchday) {
    comp = `${compName} · Matchday ${match.matchday}`;
  } else if (match.stage && STAGE_LABELS[match.stage]) {
    comp = `${compName} · ${STAGE_LABELS[match.stage]}`;
  } else {
    comp = compName;
  }

  const ft = match.score.fullTime;
  const hasScore = ft.home != null && ft.away != null;

  return {
    id,
    footballDataId: match.id,
    comp,
    home: displayName(match.homeTeam),
    away: displayName(match.awayTeam),
    score: hasScore ? `${ft.home} - ${ft.away}` : '—',
    status: statusLabel(match),
    kickoff: match.utcDate,
    live: match.status === 'IN_PLAY' || match.status === 'PAUSED',
  };
}
