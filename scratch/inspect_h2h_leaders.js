async function inspect() {
  try {
    const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const sbData = await sbRes.json();
    if (sbData.events && sbData.events.length > 0) {
      const event = sbData.events[0];
      const eventId = event.id;
      const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
      const sumData = await sumRes.json();

      console.log('=== lastFiveGames RAW ===');
      console.log(JSON.stringify(sumData.lastFiveGames, null, 2).substring(0, 2000));

      console.log('=== headToHeadGames RAW ===');
      console.log(JSON.stringify(sumData.headToHeadGames, null, 2).substring(0, 1000));

      console.log('=== leaders RAW ===');
      console.log(JSON.stringify(sumData.leaders, null, 2).substring(0, 2000));
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
