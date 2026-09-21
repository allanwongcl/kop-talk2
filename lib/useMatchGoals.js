'use client';

import { useEffect, useState } from 'react';

const POLL_MS = 120000;

export function useMatchGoals(matchId, kickoff, home, away) {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    async function poll() {
      try {
        const params = new URLSearchParams({ matchId });
        if (kickoff && home && away) {
          params.set('kickoff', kickoff);
          params.set('home', home);
          params.set('away', away);
        }
        const res = await fetch(`/api/match-goals?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setGoals(data.goals || []);
      } catch (err) {
        console.error(err);
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [matchId, kickoff, home, away]);

  return goals;
}
