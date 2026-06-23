async function inspect() {
  try {
    const statsRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/statistics');
    const statsData = await statsRes.json();
    if (statsData.stats) {
      console.log('Statistics Categories Available:');
      statsData.stats.forEach((s, idx) => {
        console.log(`${idx + 1}. ${s.displayName} (${s.name})`);
        if (s.leaders && s.leaders.length > 0) {
          console.log(`   Sample Leader: ${s.leaders[0].athlete?.displayName} (${s.leaders[0].displayValue})`);
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
