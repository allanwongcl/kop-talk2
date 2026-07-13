// Combines a static fixture (lib/matches.js) with live data polled from
// /api/live-scores to decide what score/label to show.
export function deriveDisplay(match, live) {
  if (!live) {
    return { score: match.score, label: match.status, isLive: false };
  }

  const goals = `${live.homeGoals ?? 0} - ${live.awayGoals ?? 0}`;

  if (live.status === 'IN_PLAY' || live.status === 'PAUSED') {
    return {
      score: goals,
      label: live.status === 'PAUSED' ? 'HALF-TIME' : 'LIVE',
      isLive: true,
    };
  }

  if (live.status === 'FINISHED') {
    return { score: goals, label: 'FULL-TIME', isLive: false };
  }

  return { score: match.score, label: match.status, isLive: false };
}
