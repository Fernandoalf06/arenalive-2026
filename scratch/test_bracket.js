import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  const data = await fetchUrl('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20221201-20221231');
  if (data.events) {
    const kMatch = data.events.find(e => e.competitions[0].type && e.competitions[0].type.abbreviation !== 'STD'); // something not standard
    console.log("Sample event name:", data.events[0].name);
    if(kMatch) {
       console.log("Knockout match found:", kMatch.name);
    }
  }
}

test();
