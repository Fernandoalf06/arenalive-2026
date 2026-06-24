async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  // Find a completed game
  const completedEvent = scoreData.events.find(e => e.status.type.state === 'post');
  if (!completedEvent) {
    console.log("No completed games found");
    return;
  }
  const summaryRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=' + completedEvent.id);
  const data = await summaryRes.json();
  if (data.keyEvents && data.keyEvents.length > 0) {
    console.log("Key Event 0:", data.keyEvents[0]);
    console.log("Key Event 0 type:", data.keyEvents[0].type);
  }
}
run();
