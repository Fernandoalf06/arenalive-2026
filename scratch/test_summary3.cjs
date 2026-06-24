async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];

  const summaryRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=' + event.id);
  const data = await summaryRes.json();
  
  console.log('Leaders length:', data.leaders ? data.leaders.length : 0);
  if (data.leaders && data.leaders.length > 0) {
     console.log('Leader 0 keys:', Object.keys(data.leaders[0]));
     console.log('Leader 0 team:', data.leaders[0].team);
     console.log('Leader 0 leaders keys:', data.leaders[0].leaders?.map(l => Object.keys(l)));
     if (data.leaders[0].leaders && data.leaders[0].leaders.length > 0) {
        console.log('Leader 0 leaders[0] leaders:', data.leaders[0].leaders[0].leaders);
     }
  }
}
run();
