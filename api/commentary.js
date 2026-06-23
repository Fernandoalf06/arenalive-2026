export default async function handler(req, res) {
  const { event } = req.query;
  if (!event) {
    return res.status(400).json({ error: 'Missing event id' });
  }

  try {
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event}`;
    const response = await fetch(summaryUrl);
    const data = await response.json();

    // Extract commentary
    const commentary = data.commentary ? data.commentary.map(c => ({
      time: c.time,
      text: c.text
    })) : [];

    // Extract key events (goals, cards, subs)
    const keyEvents = data.keyEvents ? data.keyEvents.map(e => ({
      id: e.id,
      text: e.text,
      clock: e.clock ? e.clock.displayValue : '',
      type: e.type ? e.type.text : 'Unknown',
      team: e.team ? e.team.displayName : null
    })) : [];

    // Extract boxscore stats
    const boxscore = data.boxscore ? data.boxscore.teams : null;
    
    // Extract rosters
    const rosters = data.rosters || [];
    
    // Extract predictor
    const predictor = data.predictor || null;

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    res.status(200).json({ commentary, keyEvents, boxscore, rosters, predictor });
  } catch (error) {
    console.error('Error fetching commentary:', error);
    res.status(500).json({ error: 'Failed to fetch commentary' });
  }
}
