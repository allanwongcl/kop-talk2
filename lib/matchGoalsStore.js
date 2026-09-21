// Persists goal-scorer events fetched from ESPN (lib/espn.js) into Supabase,
// keyed by our own fixture id (e.g. 'cl1', 'pl4' — see lib/footballData.js).
// app/api/match-goals/route.js writes here on every successful live fetch and
// reads from here if ESPN returns nothing.

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
