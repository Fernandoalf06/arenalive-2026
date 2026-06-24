async function check() { 
  const stRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/statistics'); 
  const stData = await stRes.json(); 
  console.log('Stats:'); 
  console.log(JSON.stringify(stData.stats.slice(0, 2), null, 2)); 
} 
check().catch(console.error);
