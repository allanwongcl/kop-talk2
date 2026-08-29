'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import { useFixtures } from '../../../lib/useFixtures';
import { useMatchGoals } from '../../../lib/useMatchGoals';

const REACTIONS = ['🔴', '⚽', '😱', '🔥', '😂'];

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function reactedLocally(postId, emoji) {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(`koptalk:reacted:${postId}:${emoji}`) === '1';
}

export default function MatchThread({ params }) {
  const { matches, loaded } = useFixtures();
  const match = matches.find((m) => m.id === params.id);
  // Goal scorers/minutes: real fixtures try api-football.com by date; friendlies
  // and anything that feed doesn't cover fall back to a manually entered list
  // (match.goals, from MANUAL_GOALS / STATIC_MATCHES in lib/matches.js).
  const liveGoals = useMatchGoals(
    match?.footballDataId && match?.kickoff ? match.kickoff.slice(0, 10) : null
  );
  const goals = match?.goals || liveGoals;
  const [posts, setPosts] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [reactionError, setReactionError] = useState(null);

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
    if (!text.trim()) {
      setPostError('Write something before posting.');
      return;
    }
    setPostError(null);
    setPosting(true);

    const optimisticPost = {
      id: `optimistic-${Date.now()}`,
      match_id: match.id,
      name: name.trim() || 'Anonymous Red',
      text: text.trim(),
      reactions: {},
      created_at: new Date().toISOString(),
    };
    setPosts((prev) => [...prev, optimisticPost]);

    const { error } = await supabase.from('posts').insert({
      match_id: match.id,
      name: optimisticPost.name,
      text: optimisticPost.text,
      reactions: {},
    });

    setPosting(false);

    if (error) {
      console.error(error);
      setPosts((prev) => prev.filter((p) => p.id !== optimisticPost.id));
      setPostError("Couldn't post your comment — check your connection and try again.");
      return;
    }

    setText('');
  }

  async function react(postId, emoji) {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const alreadyReacted = reactedLocally(postId, emoji);
    const delta = alreadyReacted ? -1 : 1;
    const reactions = { ...post.reactions };
    reactions[emoji] = Math.max(0, (reactions[emoji] || 0) + delta);

    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reactions } : p)));
    if (typeof window !== 'undefined') {
      const key = `koptalk:reacted:${postId}:${emoji}`;
      if (alreadyReacted) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, '1');
    }

    const { error } = await supabase.from('posts').update({ reactions }).eq('id', postId);
    if (error) {
      console.error(error);
      setReactionError("Couldn't save your reaction — try again.");
    }
  }

  if (!match) {
    return (
      <main className="px-5 py-6 max-w-2xl mx-auto">
        <p className="text-gray-400">{loaded ? 'Match not found.' : 'Loading match…'}</p>
        <Link href="/" className="text-red-500 text-sm">← Back</Link>
      </main>
    );
  }

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
          {match.live && (
            <span className="text-[11px] uppercase tracking-wider text-red-500 font-semibold animate-pulse">
              ● Live
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-xl">{match.home}</span>
          <span className="mx-3 text-3xl font-mono font-bold text-red-500">{match.score}</span>
          <span className="text-white font-bold text-xl text-right">{match.away}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">{match.status}</div>

        {goals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
            {goals.map((g, i) => (
              <div key={i} className="text-xs text-gray-300 flex gap-1.5">
                <span className="text-gray-500 font-mono shrink-0">{g.minute}'</span>
                <span>
                  ⚽ {g.scorer}
                  {g.assist && <span className="text-gray-500"> (assist: {g.assist})</span>}
                  <span className="text-gray-500"> — {g.team}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="inline-block text-xs uppercase tracking-widest text-gray-300 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded mb-3">
        Match reactions
      </p>

      {loading && (
        <p className="inline-block text-gray-400 text-sm bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
          Loading thread…
        </p>
      )}

      <div className="space-y-3 mb-4">
        {!loading && posts.length === 0 && (
          <div className="text-center text-gray-400 text-sm italic bg-black/30 backdrop-blur-sm border border-white/5 rounded-lg py-6 px-4">
            No comments yet. Be the first Red to sound off.
          </div>
        )}
        {reactionError && (
          <p className="text-red-400 text-xs">{reactionError}</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="bg-[#10141f] border border-white/5 rounded-lg p-3">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-red-400 font-semibold text-sm">{p.name}</span>
              <span className="text-gray-400 text-xs">{timeAgo(p.created_at)}</span>
            </div>
            <p className="text-gray-200 text-sm mb-2 whitespace-pre-wrap">{p.text}</p>
            <div className="flex gap-2 flex-wrap">
              {REACTIONS.map((e) => {
                const selected = reactedLocally(p.id, e);
                return (
                  <button
                    key={e}
                    onClick={() => react(p.id, e)}
                    aria-pressed={selected}
                    className={`text-xs border rounded-full px-3 py-1.5 transition-colors ${
                      selected
                        ? 'bg-red-600/20 border-red-500 text-red-300'
                        : 'bg-black/40 hover:bg-black/70 border-white/5 text-gray-200'
                    }`}
                  >
                    {e} {p.reactions?.[e] || ''}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#10141f] border border-white/5 rounded-lg p-3 sticky bottom-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          aria-label="Your name (optional)"
          className="w-full bg-transparent border-b border-white/10 text-sm text-white placeholder-gray-400 py-1 mb-2 outline-none focus:border-red-600"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you think of that match?"
          aria-label="Your comment"
          rows={2}
          maxLength={500}
          className="w-full bg-transparent text-sm text-white placeholder-gray-400 outline-none resize-none"
        />
        <div className="flex justify-between items-center mt-2">
          {postError ? (
            <p className="text-red-400 text-xs">{postError}</p>
          ) : (
            <span />
          )}
          <button
            onClick={addPost}
            disabled={posting}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </main>
  );
}
