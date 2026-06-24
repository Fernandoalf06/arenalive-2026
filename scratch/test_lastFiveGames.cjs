async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];
  const summaryRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=' + event.id);
  const data = await summaryRes.json();
  if (data.lastFiveGames && data.lastFiveGames.length > 0) {
    console.log("lastFiveGames:", JSON.stringify(data.lastFiveGames, null, 2));
  }
}
run();
