async function run() {
  const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=698188');
  const data = await res.json();
  const leaders = data.leaders || [];
  
  if (leaders.length > 0) {
    console.log(JSON.stringify(leaders[0].leaders[0], null, 2));
  } else {
    console.log("No leaders");
  }
}
run();
