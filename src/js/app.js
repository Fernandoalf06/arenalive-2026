import { initSpeech, speak, toggleSpeech } from './speech.js';

const DOM = {
  scoreboardView: document.getElementById('scoreboard'),
  detailView: document.getElementById('match-detail'),
  matchesContainer: document.getElementById('matches-container'),
  btnBack: document.getElementById('btn-back'),
  detailHeader: document.getElementById('detail-header'),
  commentaryList: document.getElementById('commentary-list'),
  tplMatchCard: document.getElementById('tpl-match-card'),
  btnTts: document.getElementById('btn-tts'),
  ttsStatusDot: document.getElementById('tts-status-dot'),
  btnPush: document.getElementById('btn-push')
};

let currentMatchId = null;
let pollInterval = null;
let knownCommentary = new Set(); // To prevent duplicate TTS

async function fetchMatches() {
  try {
    const res = await fetch('/api/matches');
    const data = await res.json();
    renderMatches(data.matches);
  } catch (err) {
    console.error('Failed to fetch matches', err);
    DOM.matchesContainer.innerHTML = '<div class="loader">Error loading matches. Retrying...</div>';
  }
}

function renderMatches(matches) {
  DOM.matchesContainer.innerHTML = '';
  if (!matches || matches.length === 0) {
    DOM.matchesContainer.innerHTML = '<div class="loader">No matches found for today.</div>';
    return;
  }

  matches.forEach(match => {
    const clone = DOM.tplMatchCard.content.cloneNode(true);
    const card = clone.querySelector('.match-card');
    
    clone.querySelector('.match-status').textContent = match.status;
    clone.querySelector('.match-clock').textContent = match.clock || '';
    
    if (match.state === 'in') {
      clone.querySelector('.match-status').classList.add('live');
      document.getElementById('live-indicator').classList.remove('hidden');
    }

    const homeTeam = clone.querySelector('.team.home');
    homeTeam.querySelector('.team-logo').src = match.home.logo;
    homeTeam.querySelector('.team-name').textContent = match.home.name;
    homeTeam.querySelector('.team-score').textContent = match.home.score !== undefined ? match.home.score : '-';

    const awayTeam = clone.querySelector('.team.away');
    awayTeam.querySelector('.team-logo').src = match.away.logo;
    awayTeam.querySelector('.team-name').textContent = match.away.name;
    awayTeam.querySelector('.team-score').textContent = match.away.score !== undefined ? match.away.score : '-';

    card.querySelector('.btn-view').addEventListener('click', () => openMatchDetail(match));
    DOM.matchesContainer.appendChild(clone);
  });
}

async function openMatchDetail(match) {
  currentMatchId = match.id;
  DOM.scoreboardView.classList.add('hidden');
  DOM.detailView.classList.remove('hidden');
  
  DOM.detailHeader.innerHTML = `
    <div class="match-meta" style="justify-content: center; color: var(--color-primary); margin-bottom: 1rem;">
      ${match.status} &bull; ${match.clock || '0\''}
    </div>
    <div class="score-display">
      <img src="${match.home.logo}" class="team-logo" alt="${match.home.name}">
      <span class="score-text">${match.home.score !== undefined ? match.home.score : 0} - ${match.away.score !== undefined ? match.away.score : 0}</span>
      <img src="${match.away.logo}" class="team-logo" alt="${match.away.name}">
    </div>
  `;

  DOM.commentaryList.innerHTML = '<div class="loader">Fetching events...</div>';
  knownCommentary.clear();
  
  await fetchCommentary();
  
  // Poll every 30s
  if (pollInterval) clearInterval(pollInterval);
  if (match.state === 'in' || match.state === 'pre') {
    pollInterval = setInterval(fetchCommentary, 30000);
  }
}

async function fetchCommentary() {
  if (!currentMatchId) return;
  try {
    const res = await fetch(`/api/commentary?event=${currentMatchId}`);
    const data = await res.json();
    renderCommentary(data.commentary, data.keyEvents);
  } catch (err) {
    console.error('Failed to fetch commentary', err);
  }
}

function renderCommentary(commentaryArr, keyEventsArr) {
  DOM.commentaryList.innerHTML = '';
  
  if (!commentaryArr || commentaryArr.length === 0) {
    DOM.commentaryList.innerHTML = '<div class="loader">No commentary available yet.</div>';
    return;
  }

  // Iterate backwards so newest is at the top
  for (let i = 0; i < commentaryArr.length; i++) {
    const c = commentaryArr[i];
    const el = document.createElement('div');
    el.className = 'commentary-item';
    
    // Attempt TTS for new items
    const textHash = c.text;
    if (!knownCommentary.has(textHash)) {
      knownCommentary.add(textHash);
      // Only speak if it's the very first time we see it after initial load
      // For a real app we'd need better tracking, but here we just speak the newest if it arrives
      if (i === 0 && knownCommentary.size > 1) {
        speak(c.text);
      }
    }

    el.innerHTML = `
      <div class="commentary-time">${c.time ? c.time : "•"}</div>
      <div class="commentary-text">${c.text}</div>
    `;
    DOM.commentaryList.appendChild(el);
  }
}

// Event Listeners
DOM.btnBack.addEventListener('click', () => {
  DOM.detailView.classList.add('hidden');
  DOM.scoreboardView.classList.remove('hidden');
  currentMatchId = null;
  if (pollInterval) clearInterval(pollInterval);
});

DOM.btnTts.addEventListener('click', () => {
  const isEnabled = toggleSpeech();
  if (isEnabled) {
    DOM.ttsStatusDot.classList.remove('disabled');
    speak('Audio narration enabled. You will hear live match events.');
  } else {
    DOM.ttsStatusDot.classList.add('disabled');
  }
});

DOM.btnPush.addEventListener('click', async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // Replace with your VAPID public key
        applicationServerKey: 'BL-M5zT196AJv0v2UdKGA17c_5VPxE7WO5_JyemAhQ3GmqEvWa2tP5D4SVF5NJYnGIaxG1ad20s_9ZRZbJie_kE'
      });
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ subscription: sub })
      });
      alert('Push Notifications enabled successfully!');
    } catch (e) {
      console.error('Push error', e);
      alert('Failed to enable push notifications.');
    }
  }
});

// App Init
async function init() {
  initSpeech();
  await fetchMatches();
  
  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
  
  // Auto-refresh matches every 60s
  setInterval(fetchMatches, 60000);
}

init();
