async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];
  const summaryRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event.id}`);
  const data = await summaryRes.json();

  // Check news articles structure
  if (data.news && data.news.articles) {
    const a = data.news.articles[0];
    console.log("=== news.articles[0] keys:", Object.keys(a));
    console.log("images:", a.images ? JSON.stringify(a.images[0], null, 2) : 'NONE');
    console.log("links:", JSON.stringify(a.links, null, 2));
    console.log("headline:", a.headline);
    console.log("description:", a.description);
    console.log("type:", a.type);
  }

  // Check broadcasts structure again - the names field
  if (data.broadcasts && data.broadcasts.length > 0) {
    const b = data.broadcasts[0];
    console.log("\n=== broadcasts[0] keys:", Object.keys(b));
    console.log("b.names:", b.names);
    console.log("b.media:", b.media);
    console.log("b.type:", JSON.stringify(b.type));
  }

  // Check videos
  if (data.videos && data.videos.length > 0) {
    const v = data.videos[0];
    console.log("\n=== videos[0] keys:", Object.keys(v));
    console.log("thumbnail:", v.thumbnail);
    console.log("headline:", v.headline);
    console.log("links:", JSON.stringify(v.links, null, 2));
  }

  // Check article 
  if (data.article) {
    console.log("\n=== article keys:", Object.keys(data.article));
    console.log("headline:", data.article.headline);
    console.log("story type:", typeof data.article.story, "len:", data.article.story?.length);
    console.log("links:", JSON.stringify(data.article.links, null, 2));
    console.log("images:", data.article.images ? JSON.stringify(data.article.images[0], null, 2) : 'NONE');
  }

  // Check what commentary API will return for lastFiveGames
  // The MatchDetailDialog uses: teamForm.team  and teamForm.form
  // But raw data has: team (object!), events (array of objects with gameResult)
  // So teamForm.team is an OBJECT not a string -> React error!
  console.log("\n=== CRITICAL: lastFiveGames[0].team is an OBJECT, not a string!");
  console.log("headToHeadGames is also structured differently than expected");
  
  if (data.headToHeadGames && data.headToHeadGames.length > 0) {
    const h = data.headToHeadGames[0];
    console.log("\n=== headToHeadGames[0] keys:", Object.keys(h));
    console.log("team:", typeof h.team);
    if (h.events && h.events.length > 0) {
      const e = h.events[0];
      console.log("events[0] relevant:", { 
        date: e.gameDate, 
        score: e.score,
        homeTeamId: e.homeTeamId,
        awayTeamId: e.awayTeamId
      });
    }
  }
}
run();
