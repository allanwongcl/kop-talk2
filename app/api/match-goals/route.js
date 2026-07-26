import { NextResponse } from 'next/server';
import { getFixtureIdByDate, getGoalEvents } from '../../../lib/apiFootball';

export async function GET(request) {
  const date = request.nextUrl.searchParams.get('date');
  if (!date) {
    return NextResponse.json({ error: 'Missing date' }, { status: 400 });
  }

  const fixtureId = await getFixtureIdByDate(date);
  if (!fixtureId) {
    return NextResponse.json({ goals: [] });
  }

  const goals = await getGoalEvents(fixtureId);
  return NextResponse.json({ goals });
}
