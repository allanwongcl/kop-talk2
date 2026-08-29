import { NextResponse } from 'next/server';
import { getLiverpoolMatches, mapMatch } from '../../../lib/footballData';
import { STATIC_MATCHES, MANUAL_GOALS, FALLBACK_MATCHES } from '../../../lib/matches';

// Cache the whole response for 60s; football-data.org is also fetched with a
// 60s revalidate, so upstream sees at most ~1 request/minute regardless of
// traffic (well within the free tier's 10 req/min limit).
export const revalidate = 60;

function withManualGoals(match) {
  const goals = MANUAL_GOALS[match.id];
  return goals ? { ...match, goals } : match;
}

function byKickoff(a, b) {
  return new Date(a.kickoff) - new Date(b.kickoff);
}

export async function GET() {
  const raw = await getLiverpoolMatches();

  if (!raw) {
    return NextResponse.json({ matches: FALLBACK_MATCHES, source: 'fallback' });
  }

  const competitive = raw.map(mapMatch).map(withManualGoals);
  const matches = [...STATIC_MATCHES, ...competitive].sort(byKickoff);

  return NextResponse.json({ matches, source: 'live' });
}
