import { NextResponse } from 'next/server';
import { getFixtureIdByDate, getGoalEvents } from '../../../lib/apiFootball';
import { getCachedGoals, saveCachedGoals } from '../../../lib/matchGoalsStore';

// Tries api-football.com first, since it's the only source with fresh data
// while a fixture is inside the free plan's ~3-day date window. Any time
// that succeeds, the result is saved to Supabase (lib/matchGoalsStore.js) so
// the match stays covered once the window closes and the live lookup starts
// coming back empty — no need to hand-enter it into MANUAL_GOALS.
export async function GET(request) {
  const matchId = request.nextUrl.searchParams.get('matchId');
  const date = request.nextUrl.searchParams.get('date');

  if (!matchId) {
    return NextResponse.json({ error: 'Missing matchId' }, { status: 400 });
  }

  if (date) {
    const fixtureId = await getFixtureIdByDate(date);
    if (fixtureId) {
      const goals = await getGoalEvents(fixtureId);
      if (goals.length > 0) {
        await saveCachedGoals(matchId, goals);
        return NextResponse.json({ goals, source: 'live' });
      }
    }
  }

  const cached = await getCachedGoals(matchId);
  return NextResponse.json({ goals: cached || [], source: cached ? 'cache' : 'none' });
}
