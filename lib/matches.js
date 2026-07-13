// Real Liverpool fixtures — update as the season progresses,
// or swap this for a live API call (e.g. football-data.org) later.
export const MATCHES = [
  {
    id: 'ps1',
    comp: 'Pre-season · US Tour',
    home: 'Sunderland',
    away: 'Liverpool',
    score: '—',
    status: 'Sat 25 Jul, Nashville',
  },
  {
    id: 'ps2',
    comp: 'Pre-season · US Tour',
    home: 'Liverpool',
    away: 'Wrexham',
    score: '—',
    status: 'Wed 29 Jul, New York',
  },
  {
    id: 'ps3',
    comp: 'Pre-season · US Tour',
    home: 'Leeds United',
    away: 'Liverpool',
    score: '—',
    status: 'Sun 2 Aug, Chicago',
  },
  {
    id: 'ps4',
    comp: 'Pre-season · Anfield',
    home: 'Liverpool',
    away: 'AS Monaco',
    score: '—',
    status: 'Sun 9 Aug, 2:30pm',
  },
  {
    id: 'ps5',
    comp: 'Pre-season · Anfield',
    home: 'Liverpool',
    away: 'Como',
    score: '—',
    status: 'Sun 16 Aug, 6:00pm',
  },
  {
    id: 'pl1',
    comp: 'Premier League · Matchday 1',
    home: 'Newcastle United',
    away: 'Liverpool',
    score: '—',
    status: 'Sun 23 Aug, 4:30pm',
    footballDataId: 560550,
  },
];

export function getMatch(id) {
  return MATCHES.find((m) => m.id === id);
}
