import { NextResponse } from 'next/server';
import { getMatchById } from '../../../lib/footballData';

export async function GET(request) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const match = await getMatchById(id);
  if (!match) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: match.status,
    homeGoals: match.score.fullTime.home,
    awayGoals: match.score.fullTime.away,
  });
}
