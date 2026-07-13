const BASE_URL = 'https://api.football-data.org/v4';

export async function getMatchById(id) {
  const res = await fetch(`${BASE_URL}/matches/${id}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    console.error('football-data.org error', res.status, await res.text());
    return null;
  }
  return res.json();
}
