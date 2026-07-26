'use client';

import { useEffect, useState } from 'react';

const POLL_MS = 120000;

export function useMatchGoals(date) {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/match-goals?date=${date}`);
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
  }, [date]);

  return goals;
}
