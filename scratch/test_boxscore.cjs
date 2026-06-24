const fetch = require('node-fetch');

async function check() {
  const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const data = await res.json();
  const eventId = data.events[0].id;

  const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
  const sumData = await sumRes.json();
  
  console.log("Boxscore exists:", !!sumData.boxscore);
  if (sumData.boxscore) {
    console.log("Boxscore teams length:", sumData.boxscore.teams?.length);
    if (sumData.boxscore.teams?.[0]) {
      console.log("Has statistics array:", !!sumData.boxscore.teams[0].statistics);
    }
  }
}

check().catch(console.error);
