import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  console.log('Fetching scoreboard...');
  const scoreboard = await fetchUrl('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  
  if (!scoreboard.events || scoreboard.events.length === 0) {
    console.log('No events found in scoreboard. Fetching a fallback league (e.g. ENG.1 - Premier League) just to inspect data structure...');
    const plScoreboard = await fetchUrl('https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard');
    if (plScoreboard.events && plScoreboard.events.length > 0) {
        const eventId = plScoreboard.events[0].id;
        console.log('Found event:', eventId);
        const summary = await fetchUrl(`https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/summary?event=${eventId}`);
        console.log('Has Rosters?', !!summary.rosters);
        console.log('Has Boxscore?', !!summary.boxscore);
        console.log('Has Predictor?', !!summary.predictor);
        if (summary.rosters && summary.rosters.length > 0) {
            console.log('Sample Roster item:', JSON.stringify(summary.rosters[0].roster[0], null, 2));
        }
    } else {
        console.log('No PL events either.');
    }
  } else {
    const eventId = scoreboard.events[0].id;
    console.log('Found event:', eventId);
    const summary = await fetchUrl(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
    console.log('Has Rosters?', !!summary.rosters);
    if (summary.rosters && summary.rosters.length > 0) {
        console.log('Sample Roster item:', JSON.stringify(summary.rosters[0].roster[0], null, 2));
    }
  }
}

test();
