async function run() {
  const scoreRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
  const scoreData = await scoreRes.json();
  const event = scoreData.events[0];
  const summaryRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event.id}`);
  const data = await summaryRes.json();

  // Check lastFiveGames raw structure
  if (data.lastFiveGames && data.lastFiveGames.length > 0) {
    const lfg = data.lastFiveGames[0];
    console.log("=== lastFiveGames[0] keys:", Object.keys(lfg));
    console.log("team type:", typeof lfg.team, "team value:", lfg.team);
    // check for events
    if (lfg.events) {
      console.log("events[0] keys:", Object.keys(lfg.events[0]));
      console.log("events[0].gameResult:", lfg.events[0].gameResult);
    }
  }

  // Check broadcasts raw structure  
  if (data.broadcasts && data.broadcasts.length > 0) {
    const b = data.broadcasts[0];
    console.log("\n=== broadcasts[0]:", JSON.stringify(b, null, 2));
  }

  // Check news raw structure
  if (data.news) {
    console.log("\n=== news type:", typeof data.news);
    console.log("news keys:", Object.keys(data.news));
    if (data.news.articles) {
      const a = data.news.articles[0];
      console.log("news.articles[0] keys:", Object.keys(a));
      console.log("news.articles[0].images:", a.images ? a.images[0] : 'no images');
      console.log("news.articles[0].links:", a.links);
    }
  }

  // Check videos raw structure
  if (data.videos && data.videos.length > 0) {
    const v = data.videos[0];
    console.log("\n=== videos[0] keys:", Object.keys(v));
    console.log("videos[0].links:", JSON.stringify(v.links, null, 2));
    console.log("videos[0].thumbnail:", v.thumbnail);
    if (v.images) console.log("videos[0].images:", v.images[0]);
  }

  // Check leaders raw structure
  if (data.leaders && data.leaders.length > 0) {
    const l = data.leaders[0];
    console.log("\n=== leaders[0] keys:", Object.keys(l));
    console.log("leaders[0].team:", JSON.stringify(l.team, null, 2));
    if (l.leaders && l.leaders[0]) {
      const cat = l.leaders[0];
      console.log("leaders[0].leaders[0] keys:", Object.keys(cat));
      if (cat.leaders && cat.leaders[0]) {
        const leader = cat.leaders[0];
        console.log("leader keys:", Object.keys(leader));
        console.log("leader.athlete headshot:", leader.athlete?.headshot);
        console.log("leader.displayValue type:", typeof leader.displayValue, "value:", leader.displayValue);
      }
    }
  }

  // Check article raw structure
  if (data.article) {
    console.log("\n=== article keys:", Object.keys(data.article));
    console.log("article.type:", typeof data.article, data.article.headline);
    if (data.article.links) console.log("article.links:", JSON.stringify(data.article.links, null, 2));
    if (data.article.story) console.log("article.story type:", typeof data.article.story, "len:", data.article.story?.length);
  }

  // Check form
  if (data.boxscore?.form) {
    console.log("\n=== form:", JSON.stringify(data.boxscore.form, null, 2));
  }

  // Check headToHeadGames
  if (data.headToHeadGames && data.headToHeadGames.length > 0) {
    console.log("\n=== headToHeadGames[0]:", JSON.stringify(data.headToHeadGames[0], null, 2));
  }
}
run();
