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

      console.log('=== gameInfo Keys ===', Object.keys(sumData.gameInfo || {}));
      if (sumData.gameInfo) {
        console.log('Venue:', sumData.gameInfo.venue ? { name: sumData.gameInfo.venue.fullName, address: sumData.gameInfo.venue.address } : 'None');
        console.log('Weather:', sumData.gameInfo.weather ? { displayValue: sumData.gameInfo.weather.displayValue, condition: sumData.gameInfo.weather.conditionId } : 'None');
        console.log('Attendance:', sumData.gameInfo.attendance);
        console.log('Officials:', sumData.gameInfo.officials ? sumData.gameInfo.officials.map(o => ({ name: o.displayName, position: o.position?.displayName })) : 'None');
      }

      console.log('=== lastFiveGames Keys ===', sumData.lastFiveGames ? Object.keys(sumData.lastFiveGames) : 'None');
      if (sumData.lastFiveGames) {
        console.log('lastFiveGames details:', sumData.lastFiveGames.map(teamData => ({
          teamId: teamData.teamId,
          lastFive: teamData.lastFive?.map(g => ({
            gameId: g.gameId,
            score: g.score,
            opponent: g.opponent?.displayName,
            result: g.result
          }))
        })));
      }

      console.log('=== headToHeadGames ===');
      if (sumData.headToHeadGames) {
        console.log('Count:', sumData.headToHeadGames.length);
        console.log('Sample headToHead:', sumData.headToHeadGames.map(g => ({
          gameId: g.gameId,
          score: g.score,
          winner: g.winner,
          date: g.date,
          teams: g.teams?.map(t => t.displayName)
        })));
      } else {
        console.log('No headToHeadGames');
      }

      console.log('=== leaders ===');
      if (sumData.leaders) {
        console.log(JSON.stringify(sumData.leaders.map(l => ({
          name: l.name,
          displayName: l.displayName,
          leaders: l.leaders?.map(item => ({
            value: item.value,
            displayValue: item.displayValue,
            athlete: item.athlete ? { name: item.athlete.displayName, position: item.athlete.position?.abbreviation, logo: item.athlete.teamLogoUrl } : null
          }))
        })), null, 2));
      }

      console.log('=== broadcasts ===');
      console.log(sumData.broadcasts);

      console.log('=== pickcenter / odds ===');
      console.log('odds keys:', sumData.odds ? Object.keys(sumData.odds) : 'None');
      console.log('pickcenter keys:', sumData.pickcenter ? Object.keys(sumData.pickcenter) : 'None');
      if (sumData.odds) {
        console.log('odds sample:', JSON.stringify(sumData.odds, null, 2));
      }
      if (sumData.pickcenter) {
        console.log('pickcenter sample:', JSON.stringify(sumData.pickcenter.slice(0, 2), null, 2));
      }

      console.log('=== news / videos ===');
      if (sumData.news && sumData.news.articles) {
        console.log('News Headlines:', sumData.news.articles.map(a => a.headline));
      }
      if (sumData.videos) {
        console.log('Video Headlines:', sumData.videos.map(v => ({ headline: v.headline, duration: v.duration, links: v.links?.source?.href })));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
