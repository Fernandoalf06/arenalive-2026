async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];
  const summaryRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=' + event.id);
  const data = await summaryRes.json();
  console.log("Game state:", event.status.type.state);
  if (data.keyEvents && data.keyEvents.length > 0) {
    console.log("Key Event 0:", data.keyEvents[0]);
    console.log("Key Event 0 type:", data.keyEvents[0].type);
  } else {
    console.log("No key events for event 0");
  }
}
run();
