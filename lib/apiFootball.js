const BASE_URL = 'https://v3.football.api-sports.io';
const LIVERPOOL_TEAM_ID = 40;

async function callApiFootball(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    console.error('api-football.com error', res.status, await res.text());
    return null;
  }
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    // Free-plan date/season restrictions land here (e.g. dates far from
    // today, or seasons outside 2022-2024) — treat as "no data yet" rather
    // than a hard failure, since this resolves itself as match day nears.
    console.error('api-football.com plan restriction', data.errors);
    return null;
  }
  return data.response;
}

// Resolves Liverpool's fixture id for a given match date (YYYY-MM-DD). The
// free plan only allows this for dates within ~a day of today, so this
// returns null well in advance of a match and starts working as game day
// approaches.
export async function getFixtureIdByDate(date) {
  const response = await callApiFootball(`/fixtures?team=${LIVERPOOL_TEAM_ID}&date=${date}`);
  return response?.[0]?.fixture?.id ?? null;
}

// Returns just the goal events for a fixture: minute, scoring team, scorer,
// and assist (if any).
export async function getGoalEvents(fixtureId) {
  const response = await callApiFootball(`/fixtures/events?fixture=${fixtureId}&type=Goal`);
  if (!response) return [];

  return response
    .map((event) => ({
      elapsed: event.time.elapsed,
      minute: event.time.elapsed + (event.time.extra ? `+${event.time.extra}` : ''),
      team: event.team.name,
      scorer: event.player.name,
      assist: event.assist?.name ?? null,
    }))
    .sort((a, b) => a.elapsed - b.elapsed);
}
