'use client';

import { useEffect, useState } from 'react';

const POLL_MS = 60000;

export function useLiveScore(footballDataId) {
  const [live, setLive] = useState(null);

  useEffect(() => {
    if (!footballDataId) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/live-scores?id=${footballDataId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setLive(data);
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
  }, [footballDataId]);

  return live;
}
