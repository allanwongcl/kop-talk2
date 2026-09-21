import { NextResponse } from 'next/server';
import { getGoalEvents } from '../../../lib/espn';
import { getCachedGoals, saveCachedGoals } from '../../../lib/matchGoalsStore';

// Goal scorers come live from ESPN (lib/espn.js). Every successful fetch is
// saved to Supabase (lib/matchGoalsStore.js) so a match stays covered if ESPN
// is ever unreachable or changes its feed.
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const matchId = params.get('matchId');
  const kickoff = params.get('kickoff');
  const home = params.get('home');
  const away = params.get('away');

  if (!matchId) {
    return NextResponse.json({ error: 'Missing matchId' }, { status: 400 });
  }

  if (kickoff && home && away) {
    const goals = await getGoalEvents({ matchId, kickoff, home, away });
    if (goals.length > 0) {
      await saveCachedGoals(matchId, goals);
      return NextResponse.json({ goals, source: 'live' });
    }
  }

  const cached = await getCachedGoals(matchId);
  return NextResponse.json({ goals: cached || [], source: cached ? 'cache' : 'none' });
}
