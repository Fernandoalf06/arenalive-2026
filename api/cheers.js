import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { event } = req.query;
  if (!event) return res.status(400).json({ error: 'Missing event id' });

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'POST') {
      const { teamType } = req.body; // 'home' or 'away'
      
      if (teamType === 'home') {
        await sql`
          INSERT INTO match_cheers (event_id, home_cheers, away_cheers)
          VALUES (${event}, 1, 0)
          ON CONFLICT (event_id) DO UPDATE SET home_cheers = match_cheers.home_cheers + 1
        `;
      } else if (teamType === 'away') {
        await sql`
          INSERT INTO match_cheers (event_id, home_cheers, away_cheers)
          VALUES (${event}, 0, 1)
          ON CONFLICT (event_id) DO UPDATE SET away_cheers = match_cheers.away_cheers + 1
        `;
      }
      
      const result = await sql`SELECT * FROM match_cheers WHERE event_id = ${event}`;
      return res.status(200).json(result[0]);
    } 
    
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM match_cheers WHERE event_id = ${event}`;
      if (result.length > 0) {
        return res.status(200).json(result[0]);
      } else {
        return res.status(200).json({ event_id: event, home_cheers: 0, away_cheers: 0 });
      }
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Cheers DB error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}
