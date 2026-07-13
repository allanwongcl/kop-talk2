'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { getMatch } from '../../../lib/matches';
import { useLiveScore } from '../../../lib/useLiveScore';
import { deriveDisplay } from '../../../lib/liveScore';

const REACTIONS = ['🔴', '⚽', '😱', '🔥', '😂'];

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function MatchThread({ params }) {
  const match = getMatch(params.id);
  const live = useLiveScore(match?.footballDataId);
  const [posts, setPosts] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!match) return;
    loadPosts();

    // Live updates: new comments/reactions from other fans appear without a refresh
    const channel = supabase
      .channel(`match-${match.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts', filter: `match_id=eq.${match.id}` },
        () => loadPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.id]);

  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('match_id', match.id)
      .order('created_at', { ascending: true });
    if (error) console.error(error);
    setPosts(data || []);
    setLoading(false);
  }

  async function addPost() {
    if (!text.trim()) return;
    const { error } = await supabase.from('posts').insert({
      match_id: match.id,
      name: name.trim() || 'Anonymous Red',
      text: text.trim(),
      reactions: {},
    });
    if (error) {
      console.error(error);
      return;
    }
    setText('');
  }

  async function react(postId, emoji) {
    const post = posts.find((p) => p.id === postId);
    const reactions = { ...post.reactions };
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    const { error } = await supabase.from('posts').update({ reactions }).eq('id', postId);
    if (error) console.error(error);
  }

  if (!match) {
    return (
      <main className="px-5 py-6 max-w-2xl mx-auto">
        <p className="text-gray-400">Match not found.</p>
        <Link href="/" className="text-red-500 text-sm">← Back</Link>
      </main>
    );
  }

  const matchDisplay = deriveDisplay(match, live);

  return (
    <main className="px-5 py-6 max-w-2xl mx-auto">
      <Link href="/" className="text-red-500 text-sm mb-4 inline-block hover:text-red-400">
        ← All matches
      </Link>

      <div className="bg-[#10141f] border border-white/5 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] uppercase tracking-wider text-red-500 font-semibold">
            {match.comp}
          </span>
          {matchDisplay.isLive && (
            <span className="text-[11px] uppercase tracking-wider text-red-500 font-semibold animate-pulse">
              ● Live
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-xl">{match.home}</span>
          <span className="mx-3 text-3xl font-mono font-bold text-red-500">{matchDisplay.score}</span>
          <span className="text-white font-bold text-xl text-right">{match.away}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{matchDisplay.label}</div>
      </div>

      <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Match reactions</p>

      {loading && <p className="text-gray-500 text-sm">Loading thread…</p>}

      <div className="space-y-3 mb-4">
        {!loading && posts.length === 0 && (
          <p className="text-gray-500 text-sm italic">No comments yet. Be the first Red to sound off.</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="bg-[#10141f] border border-white/5 rounded-lg p-3">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-red-400 font-semibold text-sm">{p.name}</span>
              <span className="text-gray-600 text-xs">{timeAgo(p.created_at)}</span>
            </div>
            <p className="text-gray-200 text-sm mb-2 whitespace-pre-wrap">{p.text}</p>
            <div className="flex gap-2 flex-wrap">
              {REACTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => react(p.id, e)}
                  className="text-xs bg-black/40 hover:bg-black/70 border border-white/5 rounded-full px-2 py-0.5 transition-colors"
                >
                  {e} {p.reactions?.[e] || ''}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#10141f] border border-white/5 rounded-lg p-3 sticky bottom-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full bg-transparent border-b border-white/10 text-sm text-white placeholder-gray-600 py-1 mb-2 outline-none focus:border-red-600"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you think of that match?"
          rows={2}
          className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={addPost}
            className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </main>
  );
}
