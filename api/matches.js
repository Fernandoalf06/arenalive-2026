export default async function handler(req, res) {
  try {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const data = await response.json();

    const matches = data.events.map(event => {
      const comp = event.competitions[0];
      const homeTeam = comp.competitors.find(c => c.homeAway === 'home');
      const awayTeam = comp.competitors.find(c => c.homeAway === 'away');
      
      return {
        id: event.id,
        name: event.name,
        date: event.date,
        status: comp.status.type.description,
        state: comp.status.type.state, // 'pre', 'in', 'post'
        clock: comp.status.displayClock,
        home: {
          name: homeTeam.team.displayName,
          logo: homeTeam.team.logo,
          score: homeTeam.score,
          winner: homeTeam.winner
        },
        away: {
          name: awayTeam.team.displayName,
          logo: awayTeam.team.logo,
          score: awayTeam.score,
          winner: awayTeam.winner
        }
      };
    });

    // Cache the response at the edge for 15 seconds, stale while revalidating for 30s
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.status(200).json({ matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}
