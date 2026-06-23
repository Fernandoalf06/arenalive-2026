export default async function handler(req, res) {
  try {
    const dates = '20260601-20260719'; // Cover the whole tournament span
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dates}&limit=100`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.events) {
      return res.status(200).json({ bracket: [] });
    }

    // Filter matches that are part of the knockout stage
    // Usually ESPN indicates this in season.type (3 = Post Season) or notes.
    const knockoutMatches = data.events.filter(event => {
       const comp = event.competitions[0];
       // Type 3 is typically post-season/knockouts. Or check notes.
       return event.season.type === 3 || (comp.notes && comp.notes.length > 0);
    }).map(event => {
       const comp = event.competitions[0];
       const homeTeam = comp.competitors.find(c => c.homeAway === 'home');
       const awayTeam = comp.competitors.find(c => c.homeAway === 'away');
       
       let phase = 'Knockouts';
       if (comp.notes && comp.notes.length > 0) {
         phase = comp.notes[0].headline;
       }

       return {
         id: event.id,
         name: event.name,
         date: event.date,
         status: comp.status.type.description,
         phase: phase,
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

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json({ bracket: knockoutMatches });
  } catch (error) {
    console.error('Error fetching bracket:', error);
    res.status(500).json({ error: 'Failed to fetch bracket' });
  }
}
