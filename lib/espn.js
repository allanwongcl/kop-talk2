// Goal events (scorer, minute, assist) from ESPN's public match feed. It needs
// no API key and has no season restriction, and covers both competitions
// KopTalk shows. It's an unofficial endpoint, so app/api/match-goals/route.js
// still falls back to the Supabase cache if this ever returns nothing.

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const LIVERPOOL_TEAM_ID = '364';
const LEAGUES = { pl: 'eng.1', cl: 'uefa.champions' };

async function getJson(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error('espn error', res.status, url);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('espn fetch failed', err);
    return null;
  }
}

function yyyymmdd(ms) {
  return new Date(ms).toISOString().slice(0, 10).replace(/-/g, '');
}

// ESPN files a match under its own (US-timezone-ish) date, so search a day
// either side of kickoff and pick the Liverpool game closest to kickoff.
async function findEvent(league, kickoffMs) {
  const DAY = 86400000;
  const days = await Promise.all(
    [-DAY, 0, DAY].map((offset) =>
      getJson(`${BASE_URL}/${league}/scoreboard?dates=${yyyymmdd(kickoffMs + offset)}`)
    )
  );

  const candidates = days.flatMap((data) => data?.events ?? []).filter((e) =>
    e.competitions?.[0]?.competitors?.some((c) => c.team?.id === LIVERPOOL_TEAM_ID)
  );
  candidates.sort(
    (a, b) => Math.abs(new Date(a.date) - kickoffMs) - Math.abs(new Date(b.date) - kickoffMs)
  );
  return candidates[0] ?? null;
}

// "90'+5'" -> "90+5"
function formatMinute(displayValue) {
  return String(displayValue ?? '').replace(/'/g, '');
}

// matchId is KopTalk's own fixture id ('pl5', 'cl1', 'cl-12345'); home/away are
// KopTalk's team names so goals line up with the fixture regardless of how ESPN
// spells a club. Returns [] on any failure.
export async function getGoalEvents({ matchId, kickoff, home, away }) {
  const league = LEAGUES[matchId.match(/^(pl|cl)/)?.[1]];
  const kickoffMs = new Date(kickoff).getTime();
  if (!league || Number.isNaN(kickoffMs)) return [];

  const event = await findEvent(league, kickoffMs);
  if (!event) return [];

  const homeTeamId = event.competitions[0].competitors.find((c) => c.homeAway === 'home')?.team?.id;
  const summary = await getJson(`${BASE_URL}/${league}/summary?event=${event.id}`);

  return (summary?.keyEvents ?? [])
    .filter((e) => e.scoringPlay && !e.shootout && e.team?.id)
    .sort((a, b) => a.clock.value - b.clock.value)
    .map((e) => {
      const [scorer, assist] = (e.participants ?? []).map((p) => p.athlete?.displayName);
      const type = e.type?.text ?? '';
      const suffix = /penalty/i.test(type) ? ' (pen)' : /own goal/i.test(type) ? ' (og)' : '';
      return {
        minute: formatMinute(e.clock.displayValue),
        team: e.team.id === homeTeamId ? home : away,
        scorer: `${scorer ?? 'Unknown'}${suffix}`,
        assist: assist ?? null,
      };
    });
}
