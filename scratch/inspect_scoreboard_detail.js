async function inspect() {
  try {
    const sbRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const sbData = await sbRes.json();
    if (sbData.events && sbData.events.length > 0) {
      const event = sbData.events[0];
      const comp = event.competitions[0];
      
      console.log('=== Event Venue ===');
      console.log(JSON.stringify(event.venue, null, 2));
      
      console.log('=== Competition Broadcasts ===');
      console.log(JSON.stringify(comp.broadcasts, null, 2));
      
      console.log('=== Competition GEO Broadcasts ===');
      console.log(JSON.stringify(comp.geoBroadcasts, null, 2));
      
      console.log('=== Competition Odds ===');
      console.log(JSON.stringify(comp.odds, null, 2));
      
      console.log('=== Competition Notes ===');
      console.log(JSON.stringify(comp.notes, null, 2));
      
      console.log('=== Competition Details ===');
      if (comp.details) {
        console.log(JSON.stringify(comp.details.slice(0, 3), null, 2));
      }
      
      console.log('=== Competition Headlines ===');
      console.log(JSON.stringify(comp.headlines, null, 2));
      
      console.log('=== Competition Attendance ===');
      console.log(comp.attendance);
      
      console.log('=== Competition Format ===');
      console.log(JSON.stringify(comp.format, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}
inspect();
