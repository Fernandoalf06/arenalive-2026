# ArenaLive 2026 ⚽

ArenaLive 2026 is an ultra-lightweight, real-time Progressive Web App (PWA) designed to track the 2026 FIFA World Cup matches directly from your browser. It features a stunning dark-mode UI, live score updates, and an automated text-to-speech engine that reads live play-by-play commentary directly to you.

![ArenaLive 2026](/public/icons/icon-192.png)

## Features

- **Real-Time Scoreboard:** Automatically syncs with ESPN's live backend to bring you the latest scores, match status, and clock updates.
- **Live Play-by-Play:** View in-depth match commentary and key events (goals, cards, substitutions) as they happen.
- **Audio Narration:** Enable Text-to-Speech (TTS) to have the live match events read aloud to you using your device's native voice synthesizer. 
- **Push Notifications:** Stay updated with background notifications for key match events.
- **Installable PWA:** Add the app directly to your mobile or desktop Home Screen for a native app experience without app store downloads.

## Tech Stack

- **Frontend:** HTML, CSS (Vanilla), JavaScript
- **Build Tool:** Vite
- **Backend API:** Vercel Serverless Functions (Node.js)
- **Database:** Neon Serverless Postgres (for Push Subscriptions)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your-neon-postgres-url"
   VAPID_PUBLIC_KEY="your-vapid-public-key"
   VAPID_PRIVATE_KEY="your-vapid-private-key"
   VAPID_SUBJECT="mailto:your-email@example.com"
   ```
   *(Note: You can generate VAPID keys using `npx web-push generate-vapid-keys`)*

3. **Run the local server:**
   For local development with serverless functions, use Vercel CLI:
   ```bash
   npx vercel dev
   ```

## Deployment

The application is deployed securely via **Vercel**. 
When deploying, ensure your Environment Variables are configured in the Vercel Dashboard to enable the backend API routes for Push Notifications.
