export default async function handler(req, res) {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/statistics');
    const data = await response.json();
    
    // Transform stats to ensure all values are React-safe strings
    const stats = (data.stats || []).map(cat => ({
      name: cat.name || cat.displayName || 'Statistics',
      leaders: (cat.leaders || []).map(l => ({
        displayValue: typeof l.displayValue === 'string' ? l.displayValue : String(l.value || ''),
        athlete: {
          displayName: l.athlete?.displayName || l.athlete?.shortName || 'Unknown',
          headshot: typeof l.athlete?.headshot === 'string' 
            ? l.athlete.headshot 
            : (l.athlete?.headshot?.href || l.athlete?.jerseyImage?.[0]?.href || 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png'),
        },
        team: {
          displayName: l.athlete?.team?.displayName || l.team?.displayName || '',
          logo: typeof l.athlete?.team?.logo === 'string' 
            ? l.athlete.team.logo 
            : (l.athlete?.team?.logos?.[0]?.href || null),
        }
      }))
    }));

    // Cache for 60 seconds
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching global stats:', error);
    res.status(500).json({ error: 'Failed to fetch global stats' });
  }
}
