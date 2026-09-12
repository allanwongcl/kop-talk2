// Persists goal-scorer events fetched from api-football.com into Supabase,
// keyed by our own fixture id (e.g. 'cl1', 'pl4' — see lib/footballData.js).
// The free api-football.com plan only allows looking a fixture up for ~3 days
// around today (see lib/apiFootball.js), so app/api/match-goals/route.js
// writes here the first time a live fetch succeeds and reads from here once
// that window closes, instead of needing MANUAL_GOALS typed in by hand.

import { supabase } from './supabaseClient';

export async function getCachedGoals(matchId) {
  const { data, error } = await supabase
    .from('match_goals')
    .select('goals')
    .eq('match_id', matchId)
    .maybeSingle();

  if (error) {
    console.error('match_goals read failed', error);
    return null;
  }
  return data?.goals ?? null;
}

export async function saveCachedGoals(matchId, goals) {
  const { error } = await supabase
    .from('match_goals')
    .upsert({ match_id: matchId, goals, updated_at: new Date().toISOString() });

  if (error) {
    console.error('match_goals write failed', error);
  }
}
