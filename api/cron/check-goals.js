import { neon } from '@neondatabase/serverless';
import webpush from 'web-push';

export default async function handler(req, res) {
  // Only allow GET requests for cron, but you can also secure it via headers if needed
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Set VAPID details
    webpush.setVapidDetails(
      'mailto:test@example.com',
      process.env.VITE_VAPID_PUBLIC_KEY || 'BL-M5zT196AJv0v2UdKGA17c_5VPxE7WO5_JyemAhQ3GmqEvWa2tP5D4SVF5NJYnGIaxG1ad20s_9ZRZbJie_kE',
      process.env.VAPID_PRIVATE_KEY
    );

    // 1. Fetch current scoreboard from ESPN
    const espnRes = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard');
    const data = await espnRes.json();
    
    if (!data.events || data.events.length === 0) {
      return res.status(200).json({ message: 'No live events' });
    }

    const notificationsToSend = [];

    // 2. Check each match
    for (const event of data.events) {
      const id = event.id;
      const comp = event.competitions[0];
      const homeTeam = comp.competitors.find(c => c.homeAway === 'home');
      const awayTeam = comp.competitors.find(c => c.homeAway === 'away');
      const status = comp.status.type.state;
      const homeScore = parseInt(homeTeam.score) || 0;
      const awayScore = parseInt(awayTeam.score) || 0;

      // Skip pre-match
      if (status === 'pre') continue;

      // Get previous state from DB
      const result = await sql`SELECT * FROM match_states WHERE id = ${id}`;
      const prev = result.length > 0 ? result[0] : null;

      let goalScored = false;
      let notificationMsg = '';

      if (!prev) {
        // First time seeing this match start
        await sql`INSERT INTO match_states (id, home_score, away_score, status) VALUES (${id}, ${homeScore}, ${awayScore}, ${status})`;
      } else {
        // Match exists, check for changes
        if (homeScore > prev.home_score || awayScore > prev.away_score) {
          goalScored = true;
          notificationMsg = `⚽ GOAL! ${homeTeam.team.name} ${homeScore} - ${awayScore} ${awayTeam.team.name}`;
        } else if (status === 'post' && prev.status !== 'post') {
          goalScored = true;
          notificationMsg = `🏁 FULL TIME: ${homeTeam.team.name} ${homeScore} - ${awayScore} ${awayTeam.team.name}`;
        }
        
        // Update DB
        if (goalScored || prev.status !== status) {
          await sql`UPDATE match_states SET home_score = ${homeScore}, away_score = ${awayScore}, status = ${status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${id}`;
        }
      }

      if (goalScored) {
        notificationsToSend.push(notificationMsg);
      }
    }

    // 3. Send Push Notifications if any goal
    if (notificationsToSend.length > 0) {
      const subs = await sql`SELECT subscription_json FROM push_subscriptions`;
      
      for (const msg of notificationsToSend) {
        const payload = JSON.stringify({ title: 'ArenaLive 2026', body: msg });
        for (const subRow of subs) {
          const sub = subRow.subscription_json;
          try {
            await webpush.sendNotification(sub, payload);
          } catch (err) {
            console.error('Push error:', err.statusCode);
            if (err.statusCode === 410) {
              // Subscription expired, remove from DB
              await sql`DELETE FROM push_subscriptions WHERE subscription_json::text = ${JSON.stringify(sub)}`;
            }
          }
        }
      }
    }

    res.status(200).json({ success: true, sent: notificationsToSend.length });
  } catch (error) {
    console.error('Cron error:', error);
    res.status(500).json({ error: 'Cron execution failed' });
  }
}
