// Fixtures are pulled live from football-data.org via /api/fixtures (see
// lib/footballData.js) and polled by lib/useFixtures.js. This file holds the
// three things the API can't give us on the free tier:
//
//   1. STATIC_MATCHES   — pre-season friendlies (no live feed exists for them)
//   2. MANUAL_GOALS      — goal-scorer breakdowns for competitive games
//   3. FALLBACK_MATCHES  — a snapshot shown only if the API call fails
//
// Keep FALLBACK_MATCHES roughly current so an API outage never shows an empty
// or badly stale fixture list.

// Pre-season friendlies — hand-entered, always shown, sorted in by kickoff time.
export const STATIC_MATCHES = [
  {
    id: 'ps1',
    comp: 'Pre-season · US Tour',
    home: 'Sunderland',
    away: 'Liverpool',
    score: '2 - 4',
    status: 'FULL-TIME · Nashville',
    kickoff: '2026-07-25T19:00:00-05:00',
    goals: [
      { minute: '13', team: 'Liverpool', scorer: 'Morrison', assist: null },
      { minute: '28', team: 'Sunderland', scorer: 'Le Fée', assist: null },
      { minute: '49', team: 'Sunderland', scorer: 'Tuterov', assist: null },
      { minute: '56', team: 'Liverpool', scorer: 'Szoboszlai', assist: null },
      { minute: '72', team: 'Liverpool', scorer: 'Chiesa', assist: null },
      { minute: '85', team: 'Liverpool', scorer: 'Koumas', assist: null },
    ],
  },
  {
    id: 'ps2',
    comp: 'Pre-season · US Tour',
    home: 'Liverpool',
    away: 'Wrexham',
    score: '1 - 0',
    status: 'FULL-TIME · New York',
    kickoff: '2026-07-29T19:00:00-04:00',
    goals: [
      { minute: '75', team: 'Liverpool', scorer: 'Rio Ngumoha', assist: null },
    ],
  },
  {
    id: 'ps3',
    comp: 'Pre-season · US Tour',
    home: 'Leeds United',
    away: 'Liverpool',
    score: '4 - 2',
    status: 'FULL-TIME · Chicago',
    kickoff: '2026-08-02T15:00:00-05:00',
    goals: [
      { minute: '7', team: 'Liverpool', scorer: 'Luke Chambers', assist: null },
      { minute: '40', team: 'Liverpool', scorer: 'Florian Wirtz', assist: null },
      { minute: '60', team: 'Leeds United', scorer: 'Brenden Aaronson', assist: null },
      { minute: '71', team: 'Leeds United', scorer: 'Dominic Calvert-Lewin', assist: null },
      { minute: '73', team: 'Leeds United', scorer: 'Sean Longstaff', assist: null },
      { minute: '85', team: 'Leeds United', scorer: 'Dominic Calvert-Lewin', assist: null },
    ],
  },
  {
    id: 'ps4',
    comp: 'Pre-season · Anfield',
    home: 'Liverpool',
    away: 'AS Monaco',
    score: '2 - 3',
    status: 'FULL-TIME · Anfield',
    kickoff: '2026-08-09T14:30:00+01:00',
    goals: [
      { minute: '16', team: 'Liverpool', scorer: 'Isak', assist: null },
      { minute: '28', team: 'Liverpool', scorer: 'Wirtz', assist: null },
      { minute: '44', team: 'AS Monaco', scorer: 'Golovin (pen)', assist: null },
      { minute: '56', team: 'AS Monaco', scorer: 'Biereth', assist: null },
      { minute: '88', team: 'AS Monaco', scorer: 'Brunner', assist: null },
    ],
  },
  {
    id: 'ps5',
    comp: 'Pre-season · Anfield',
    home: 'Liverpool',
    away: 'Como',
    score: '2 - 0',
    status: 'FULL-TIME · Anfield',
    kickoff: '2026-08-16T18:00:00+01:00',
    goals: [
      { minute: '23', team: 'Liverpool', scorer: 'Gakpo', assist: 'Frimpong' },
      { minute: '45', team: 'Liverpool', scorer: 'Jacquet', assist: 'Gakpo' },
    ],
  },
];

// Goal-scorer breakdowns for competitive matches, keyed by the fixture id the
// API layer assigns: `pl<matchday>` for the Premier League, `cl<matchday>` for
// the Champions League league phase. The free football-data.org tier doesn't
// include goal events, so add these by hand after a match and they'll show on
// the match thread.
export const MANUAL_GOALS = {
  pl1: [
    { minute: '5', team: 'Newcastle United', scorer: 'Elanga', assist: 'Osula' },
    { minute: '55', team: 'Liverpool', scorer: 'Gakpo', assist: null },
    { minute: '58', team: 'Newcastle United', scorer: 'Willock', assist: 'Wissa' },
    { minute: '90+9', team: 'Liverpool', scorer: 'Szoboszlai (pen)', assist: null },
  ],
  pl2: [
    { minute: '23', team: 'Nottingham Forest', scorer: 'Ndoye', assist: 'Gibbs-White' },
    { minute: '59', team: 'Liverpool', scorer: 'Isak', assist: 'Gakpo' },
    { minute: '69', team: 'Nottingham Forest', scorer: 'Gibbs-White (pen)', assist: null },
    { minute: '81', team: 'Liverpool', scorer: 'Muñoz', assist: 'Wirtz' },
  ],
  pl3: [
    { minute: '6', team: 'Liverpool', scorer: 'Isak', assist: 'Gakpo' },
    { minute: '9', team: 'Liverpool', scorer: 'Isak', assist: 'Gakpo' },
  ],
};

// Snapshot used only when the football-data.org fetch fails, so the site never
// renders an empty list. The live data supersedes all of this whenever the API
// responds. Friendlies first, then competitive fixtures, sorted by kickoff.
const FALLBACK_COMPETITIVE = [
  {
    id: 'pl1',
    footballDataId: 560550,
    comp: 'Premier League · Matchday 1',
    home: 'Newcastle United',
    away: 'Liverpool',
    score: '2 - 2',
    status: "FULL-TIME · St James' Park",
    kickoff: '2026-08-23T16:30:00+01:00',
  },
  {
    id: 'pl2',
    footballDataId: 560552,
    comp: 'Premier League · Matchday 2',
    home: 'Liverpool',
    away: 'Nottingham Forest',
    score: '2 - 2',
    status: 'FULL-TIME · Anfield',
    kickoff: '2026-08-29T12:30:00+01:00',
  },
  {
    id: 'pl3',
    footballDataId: 560566,
    comp: 'Premier League · Matchday 3',
    home: 'Ipswich Town',
    away: 'Liverpool',
    score: '0 - 2',
    status: 'FULL-TIME · Portman Road',
    kickoff: '2026-09-04T20:00:00+01:00',
  },
  {
    id: 'pl4',
    footballDataId: 560573,
    comp: 'Premier League · Matchday 4',
    home: 'Liverpool',
    away: 'Fulham',
    score: '—',
    status: 'Sat 12 Sep, 3:00pm',
    kickoff: '2026-09-12T15:00:00+01:00',
  },
  {
    id: 'pl5',
    footballDataId: 560582,
    comp: 'Premier League · Matchday 5',
    home: 'AFC Bournemouth',
    away: 'Liverpool',
    score: '—',
    status: 'Sun 20 Sep, 2:00pm',
    kickoff: '2026-09-20T14:00:00+01:00',
  },
  {
    id: 'pl6',
    footballDataId: 560598,
    comp: 'Premier League · Matchday 6',
    home: 'Liverpool',
    away: 'Manchester City',
    score: '—',
    status: 'Sun 11 Oct, 4:30pm',
    kickoff: '2026-10-11T16:30:00+01:00',
  },
];

function withManualGoals(match) {
  if (match.goals) return match;
  const goals = MANUAL_GOALS[match.id];
  return goals ? { ...match, goals } : match;
}

export const FALLBACK_MATCHES = [...STATIC_MATCHES, ...FALLBACK_COMPETITIVE]
  .map(withManualGoals)
  .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));

// Back-compat for any synchronous importer.
export const MATCHES = FALLBACK_MATCHES;

export function getMatch(id) {
  return FALLBACK_MATCHES.find((m) => m.id === id);
}
