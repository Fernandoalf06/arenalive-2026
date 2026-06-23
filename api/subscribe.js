import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscription } = req.body;
  if (!subscription) {
    return res.status(400).json({ error: 'Missing subscription object' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const subJson = JSON.stringify(subscription);
    
    // Insert ignoring duplicates (unique constraint on subscription_json)
    await sql`
      INSERT INTO push_subscriptions (subscription_json)
      VALUES (${subJson})
      ON CONFLICT (subscription_json) DO NOTHING
    `;
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
}
