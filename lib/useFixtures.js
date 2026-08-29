'use client';

import { useEffect, useState } from 'react';
import { FALLBACK_MATCHES } from './matches';

const POLL_MS = 60000;

// Fixture list from /api/fixtures, re-polled every 60s so scores and statuses
// go live without a page refresh. Seeded with the hardcoded fallback so there's
// never an empty first render. `loaded` flips true once the first fetch settles
// (used to tell "still loading" apart from "no such match").
export function useFixtures() {
  const [matches, setMatches] = useState(FALLBACK_MATCHES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/fixtures');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.matches) && data.matches.length) {
          setMatches(data.matches);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { matches, loaded };
}
