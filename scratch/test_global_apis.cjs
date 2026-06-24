async function check() {
  console.log("Checking Standings...");
  try {
    const sRes = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings');
    const sData = await sRes.json();
    console.log("Standings length:", sData.children?.length);
    if (sData.children?.length > 0) {
       console.log("Sample group:", sData.children[0].name, sData.children[0].standings?.entries?.length, "teams");
    }
  } catch (e) {
    console.log("Failed standings", e.message);
  }

  console.log("\nChecking Stats/Leaders...");
  try {
    // There might not be a direct leaders endpoint, but let's try
    // Sometimes it's /statistics or /leaders
    const stRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/statistics');
    if(stRes.ok) {
       const stData = await stRes.json();
       console.log("Stats Object keys:", Object.keys(stData));
    } else {
       console.log("Stats endpoint returned", stRes.status);
    }
  } catch (e) {
    console.log("Failed stats", e.message);
  }

  try {
    const lRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/leaders');
    if(lRes.ok) {
       const lData = await lRes.json();
       console.log("Leaders Object keys:", Object.keys(lData));
    } else {
       console.log("Leaders endpoint returned", lRes.status);
    }
  } catch (e) {}
}

check().catch(console.error);
