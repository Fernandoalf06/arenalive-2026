async function run() {
  const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=700813');
  // Wait, I don't know the exact ID for Scotland vs Brazil.
  // Let me fetch the scoreboard first.
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];
  console.log('Event ID:', event.id);

  const summaryRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=' + event.id);
  const summaryData = await summaryRes.json();
  
  console.log('Summary Keys:', Object.keys(summaryData));
  if (summaryData.standings) {
    console.log('Standings entries[0] stats keys:', summaryData.standings.groups?.[0]?.standings?.entries?.[0]?.stats?.map(s => s.name));
  }
}
run();
