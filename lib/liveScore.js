// Friendlies have no live-score feed (see footballDataId), so once kickoff
// plus a full match's worth of time has passed with no manual score update,
// stop showing the stale pre-match date/venue and admit we don't know yet.
const RESULT_PENDING_BUFFER_MS = 2.5 * 60 * 60 * 1000;

// Combines a static fixture (lib/matches.js) with live data polled from
// /api/live-scores to decide what score/label to show.
export function deriveDisplay(match, live) {
  if (!live) {
    if (
      match.score === '—' &&
      match.kickoff &&
      Date.now() - new Date(match.kickoff).getTime() > RESULT_PENDING_BUFFER_MS
    ) {
      return { score: match.score, label: 'Result pending', isLive: false };
    }
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
