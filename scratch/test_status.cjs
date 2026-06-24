async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  for (const event of scoreData.events) {
    const comp = event.competitions[0];
    console.log(comp.status.type);
    break;
  }
}
run();
