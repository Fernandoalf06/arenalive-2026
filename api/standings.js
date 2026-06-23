export default async function handler(req, res) {
  try {
    const response = await fetch('https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings');
    const data = await response.json();
    
    // Cache for 60 seconds
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
}
