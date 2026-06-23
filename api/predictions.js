import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { event } = req.query;
  if (!event) return res.status(400).json({ error: 'Missing event id' });

  try {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'POST') {
      const { prediction } = req.body; // 'home_win', 'draw', 'away_win'
      
      let updateSql;
      if (prediction === 'home_win') {
        updateSql = sql`
          INSERT INTO match_predictions (event_id, home_win, draw, away_win)
          VALUES (${event}, 1, 0, 0)
          ON CONFLICT (event_id) DO UPDATE SET home_win = match_predictions.home_win + 1
        `;
      } else if (prediction === 'draw') {
        updateSql = sql`
          INSERT INTO match_predictions (event_id, home_win, draw, away_win)
          VALUES (${event}, 0, 1, 0)
          ON CONFLICT (event_id) DO UPDATE SET draw = match_predictions.draw + 1
        `;
      } else if (prediction === 'away_win') {
        updateSql = sql`
          INSERT INTO match_predictions (event_id, home_win, draw, away_win)
          VALUES (${event}, 0, 0, 1)
          ON CONFLICT (event_id) DO UPDATE SET away_win = match_predictions.away_win + 1
        `;
      } else {
        return res.status(400).json({ error: 'Invalid prediction type' });
      }
      
      await updateSql;
      const result = await sql`SELECT * FROM match_predictions WHERE event_id = ${event}`;
      return res.status(200).json(result[0]);
    }
    
    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM match_predictions WHERE event_id = ${event}`;
      if (result.length > 0) {
        return res.status(200).json(result[0]);
      } else {
        return res.status(200).json({ event_id: event, home_win: 0, draw: 0, away_win: 0 });
      }
    }

    res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Predictions DB error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}
