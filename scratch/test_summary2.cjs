async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];

  const summaryRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=' + event.id);
  const data = await summaryRes.json();
  
  console.log('Leaders:', JSON.stringify(data.leaders, null, 2));
  console.log('Boxscore:', JSON.stringify(data.boxscore, null, 2));
  console.log('Rosters:', JSON.stringify(data.rosters, null, 2));
}
run();
