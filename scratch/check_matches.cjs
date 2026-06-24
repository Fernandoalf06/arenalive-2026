async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];
  const comp = event.competitions[0];
  const homeTeam = comp.competitors.find(c => c.homeAway === 'home');
  console.log("homeTeam.team.logo type:", typeof homeTeam.team.logo, "value:", homeTeam.team.logo);
  console.log("homeTeam.team.displayName type:", typeof homeTeam.team.displayName);
  console.log("homeTeam.score type:", typeof homeTeam.score, "value:", homeTeam.score);
}
run();
