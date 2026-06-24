async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];
  const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event.id}`;
  const response = await fetch(summaryUrl);
  const data = await response.json();
  
  // My commentary.js mapping
  const keyEvents = data.keyEvents ? data.keyEvents.map(e => ({
    id: e.id,
    text: e.text,
    clock: e.clock ? e.clock.displayValue : '',
    type: e.type ? e.type.text : 'Unknown',
    team: e.team ? e.team.displayName : null
  })) : [];
  
  const boxscore = data.boxscore ? data.boxscore.teams : null;
  const rosters = data.rosters || [];
  const gameInfo = data.gameInfo || null;
  const lastFiveGames = data.lastFiveGames || [];
  const headToHeadGames = data.headToHeadGames || [];
  const broadcasts = data.broadcasts || [];
  const news = data.news || null;
  const videos = data.videos || [];
  const article = data.article || null;
  const leaders = data.leaders || [];
  const standings = data.standings || null;

  const result = { keyEvents, boxscore, rosters, gameInfo, lastFiveGames, headToHeadGames, broadcasts, news, videos, article, leaders, standings };

  function findIdTypeObjects(obj, path) {
    if (!obj) return;
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 2 && keys.includes('id') && keys.includes('type')) {
        console.log(`Found exactly {id, type} at ${path}:`, obj);
      }
      for (const k of keys) {
        findIdTypeObjects(obj[k], path + '.' + k);
      }
    }
  }

  findIdTypeObjects(result, 'root');
}
run();
