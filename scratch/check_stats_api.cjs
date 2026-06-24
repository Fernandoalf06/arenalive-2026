async function run() {
  const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/statistics');
  const data = await res.json();
  if (data.stats && data.stats.length > 0) {
    const cat = data.stats[0];
    console.log("Category name:", cat.name || cat.displayName);
    if (cat.leaders && cat.leaders.length > 0) {
      const l = cat.leaders[0];
      console.log("leader keys:", Object.keys(l));
      console.log("leader.athlete keys:", l.athlete ? Object.keys(l.athlete) : 'no athlete');
      console.log("leader.athlete.headshot:", l.athlete?.headshot);
      console.log("leader.athlete.headshot type:", typeof l.athlete?.headshot);
      console.log("leader.displayValue:", l.displayValue, "type:", typeof l.displayValue);
      console.log("leader.team:", l.team);
    }
  }
}
run();
