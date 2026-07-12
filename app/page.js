'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { MATCHES } from '../lib/matches';

function Ticker() {
  const text = MATCHES.map((m) => `${m.home} vs ${m.away} — ${m.status}`).join('    •    ');
  return (
    <div className="overflow-hidden border-y border-red-900/40 bg-black">
      <div className="ticker-track whitespace-nowrap py-2 text-sm tracking-widest text-red-500 font-mono">
        {text}    •    {text}
      </div>
    </div>
  );
}

export default function Home() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    async function loadCounts() {
      const { data, error } = await supabase
        .from('posts')
        .select('match_id');
      if (error) {
        console.error(error);
        return;
      }
      const next = {};
      for (const row of data) {
        next[row.match_id] = (next[row.match_id] || 0) + 1;
      }
      setCounts(next);
    }
    loadCounts();
  }, []);

  return (
    <div>
      <header className="border-b border-red-900/30 px-5 py-4">
        <h1 className="text-white font-extrabold text-2xl tracking-tight">
          KOP<span className="text-red-600">TALK</span>
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">Match reactions, straight from the Kop.</p>
      </header>

      <Ticker />

      <main className="px-5 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Match threads</p>
          {MATCHES.map((m) => (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              className="block bg-[#10141f] hover:bg-[#161b29] border border-white/5 rounded-lg p-4 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] uppercase tracking-wider text-red-500 font-semibold">
                  {m.comp}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">{m.home}</span>
                <span className="mx-3 text-2xl font-mono font-bold text-red-500">{m.score}</span>
                <span className="text-white font-bold text-lg text-right">{m.away}</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">{m.status}</span>
                <span className="text-xs text-gray-400">{counts[m.id] || 0} comments</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
