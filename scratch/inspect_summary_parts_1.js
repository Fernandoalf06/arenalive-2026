async function inspect() {
  try {
    const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const sbData = await sbRes.json();
    if (sbData.events && sbData.events.length > 0) {
      const event = sbData.events[0];
      const eventId = event.id;
      const sumRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
      const sumData = await sumRes.json();

      console.log('=== gameInfo ===');
      if (sumData.gameInfo) {
        console.log('Venue:', sumData.gameInfo.venue ? { name: sumData.gameInfo.venue.fullName, city: sumData.gameInfo.venue.address?.city, capacity: sumData.gameInfo.venue.capacity } : 'None');
        console.log('Weather:', sumData.gameInfo.weather ? { displayValue: sumData.gameInfo.weather.displayValue, temp: sumData.gameInfo.weather.temperature, wind: sumData.gameInfo.weather.windSpeed, link: sumData.gameInfo.weather.link } : 'None');
        console.log('Attendance:', sumData.gameInfo.attendance);
        console.log('Officials:', sumData.gameInfo.officials ? sumData.gameInfo.officials.map(o => ({ name: o.displayName, position: o.position?.displayName })) : 'None');
      }

      console.log('=== lastFiveGames ===');
      if (sumData.lastFiveGames) {
        console.log(JSON.stringify(sumData.lastFiveGames.map(teamData => ({
          team: teamData.team?.displayName || teamData.teamId,
          lastFive: teamData.lastFive?.map(g => ({
            score: g.score,
            opponent: g.opponent?.displayName,
            result: g.result,
            date: g.date
          }))
        })), null, 2));
      }

      console.log('=== headToHeadGames ===');
      if (sumData.headToHeadGames) {
        console.log(JSON.stringify(sumData.headToHeadGames.map(g => ({
          score: g.score,
          winner: g.winner,
          date: g.date,
          teams: g.teams?.map(t => ({ name: t.displayName, score: t.score, winner: t.winner }))
        })), null, 2));
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
            athlete: item.athlete ? { name: item.athlete.displayName, position: item.athlete.position?.abbreviation } : null
          }))
        })), null, 2));
      }

      console.log('=== broadcasts ===');
      console.log(sumData.broadcasts);
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
