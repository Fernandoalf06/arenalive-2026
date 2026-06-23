async function inspect() {
  try {
    const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const sbData = await sbRes.json();
    if (sbData.events && sbData.events.length > 0) {
      const event = sbData.events[0];
      const eventId = event.id;
      const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
      const sumData = await sumRes.json();

      console.log('=== Article (story excerpt) ===');
      if (sumData.article) {
        console.log('Headline:', sumData.article.headline);
        console.log('Description:', sumData.article.description);
        console.log('Story first 500 chars:', sumData.article.story?.substring(0, 500));
        console.log('Byline:', sumData.article.byline);
        console.log('Images:', sumData.article.images?.map(img => ({ caption: img.caption, url: img.url })));
      }

      console.log('=== Videos ===');
      if (sumData.videos) {
        sumData.videos.forEach((v, i) => {
          console.log(`Video ${i+1}:`, {
            headline: v.headline,
            description: v.description,
            duration: v.duration,
            thumbnail: v.thumbnail,
            links: v.links?.source?.href || v.links?.web?.href || v.links?.mobile?.href
          });
        });
      }

      console.log('=== Boxscore Form ===');
      if (sumData.boxscore && sumData.boxscore.form) {
        console.log(JSON.stringify(sumData.boxscore.form, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
