import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

async function createTable() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS match_states (
        id VARCHAR(255) PRIMARY KEY,
        home_score INT DEFAULT 0,
        away_score INT DEFAULT 0,
        status VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Table match_states created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
}

createTable();
