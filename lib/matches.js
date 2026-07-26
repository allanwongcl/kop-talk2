// Real Liverpool fixtures — update as the season progresses,
// or swap this for a live API call (e.g. football-data.org) later.
export const MATCHES = [
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
    score: '—',
    status: 'Wed 29 Jul, New York',
    kickoff: '2026-07-29T19:00:00-04:00',
  },
  {
    id: 'ps3',
    comp: 'Pre-season · US Tour',
    home: 'Leeds United',
    away: 'Liverpool',
    score: '—',
    status: 'Sun 2 Aug, Chicago',
    kickoff: '2026-08-02T15:00:00-05:00',
  },
  {
    id: 'ps4',
    comp: 'Pre-season · Anfield',
    home: 'Liverpool',
    away: 'AS Monaco',
    score: '—',
    status: 'Sun 9 Aug, 2:30pm',
    kickoff: '2026-08-09T14:30:00+01:00',
  },
  {
    id: 'ps5',
    comp: 'Pre-season · Anfield',
    home: 'Liverpool',
    away: 'Como',
    score: '—',
    status: 'Sun 16 Aug, 6:00pm',
    kickoff: '2026-08-16T18:00:00+01:00',
  },
  {
    id: 'pl1',
    comp: 'Premier League · Matchday 1',
    home: 'Newcastle United',
    away: 'Liverpool',
    score: '—',
    status: 'Sun 23 Aug, 4:30pm',
    kickoff: '2026-08-23T16:30:00+01:00',
    footballDataId: 560550,
  },
];

export function getMatch(id) {
  return MATCHES.find((m) => m.id === id);
}
