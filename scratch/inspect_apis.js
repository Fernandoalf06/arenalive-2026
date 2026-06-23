async function inspect() {
  try {
    const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const sbData = await sbRes.json();
    if (sbData.events && sbData.events.length > 0) {
      const event = sbData.events[0];
      const eventId = event.id;
      console.log(`Fetching summary for event ${eventId}...`);
      const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
      const sumData = await sumRes.json();
      
      console.log('--- gameInfo ---');
      console.log(JSON.stringify(sumData.gameInfo, null, 2));

      console.log('--- lastFiveGames ---');
      if (sumData.lastFiveGames) {
        console.log(JSON.stringify(sumData.lastFiveGames, null, 2));
      } else {
        console.log('No lastFiveGames');
      }

      console.log('--- headToHeadGames ---');
      if (sumData.headToHeadGames) {
        console.log(JSON.stringify(sumData.headToHeadGames, null, 2));
      } else {
        console.log('No headToHeadGames');
      }

      console.log('--- leaders ---');
      if (sumData.leaders) {
        console.log(JSON.stringify(sumData.leaders.slice(0, 2), null, 2));
      } else {
        console.log('No leaders');
      }

      console.log('--- broadcasts ---');
      console.log(JSON.stringify(sumData.broadcasts, null, 2));

      console.log('--- pickcenter ---');
      console.log(JSON.stringify(sumData.pickcenter, null, 2));

      console.log('--- odds ---');
      console.log(JSON.stringify(sumData.odds, null, 2));

      console.log('--- news ---');
      if (sumData.news) {
        console.log('Articles count:', sumData.news.articles ? sumData.news.articles.length : 0);
        if (sumData.news.articles && sumData.news.articles.length > 0) {
          console.log('Sample Article:', JSON.stringify(sumData.news.articles[0], null, 2));
        }
      }

      console.log('--- videos ---');
      if (sumData.videos) {
        console.log('Videos count:', sumData.videos.length);
        if (sumData.videos.length > 0) {
          console.log('Sample Video:', JSON.stringify(sumData.videos[0], null, 2));
        }
      }
      
      console.log('--- header ---');
      if (sumData.header) {
        console.log(JSON.stringify(sumData.header, null, 2));
      }

      console.log('--- standings ---');
      if (sumData.standings) {
        console.log(JSON.stringify(sumData.standings, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
