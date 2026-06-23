import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function setup() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Creating match_cheers table...');
  await sql`
    CREATE TABLE IF NOT EXISTS match_cheers (
      event_id VARCHAR(50) PRIMARY KEY,
      home_cheers INT DEFAULT 0,
      away_cheers INT DEFAULT 0
    )
  `;
  
  console.log('Creating match_predictions table...');
  await sql`
    CREATE TABLE IF NOT EXISTS match_predictions (
      event_id VARCHAR(50) PRIMARY KEY,
      home_win INT DEFAULT 0,
      draw INT DEFAULT 0,
      away_win INT DEFAULT 0
    )
  `;

  console.log('Tables created successfully.');
}

setup().catch(console.error);
