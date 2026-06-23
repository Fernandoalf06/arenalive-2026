import { initSpeech, speak, toggleSpeech } from './speech.js';

const DOM = {
  // Navigation
  tabBtns: document.querySelectorAll('.tab-btn'),
  views: document.querySelectorAll('.tab-content'),
  
  // Containers
  matchesContainer: document.getElementById('matches-container'),
  standingsContainer: document.getElementById('standings-container'),
  statsContainer: document.getElementById('stats-container'),
  
  // Match Detail
  scoreboardView: document.getElementById('scoreboard'),
  detailView: document.getElementById('match-detail'),
  btnBack: document.getElementById('btn-back'),
  detailHeader: document.getElementById('detail-header'),
  commentaryList: document.getElementById('commentary-list'),
  matchStatsSection: document.getElementById('match-stats-section'),
  statsBars: document.getElementById('stats-bars'),
  pitchEvents: document.getElementById('pitch-events'),
  
  // Templates
  tplMatchCard: document.getElementById('tpl-match-card'),
  
  // Headers
  btnTts: document.getElementById('btn-tts'),
  ttsStatusDot: document.getElementById('tts-status-dot'),
  btnPush: document.getElementById('btn-push')
};

let currentMatchId = null;
let pollInterval = null;
let knownCommentary = new Set();
let favorites = JSON.parse(localStorage.getItem('arenalive_favorites') || '[]');

// Sound effect for goal
const goalAudio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); // Placeholder short click/beep if real cheer isn't available. Since we need a valid mp3, we'll use a short silence and rely on Haptics and TTS mainly, but we'll try to play it.

// ==========================================
// TABS NAVIGATION
// ==========================================
DOM.tabBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    DOM.tabBtns.forEach(b => b.classList.remove('active'));
    DOM.views.forEach(v => v.classList.remove('view-active'));
    
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    document.getElementById(target).classList.add('view-active');
    
    // Lazy load
    if (target === 'standings' && DOM.standingsContainer.innerHTML.includes('Fetching')) {
      fetchStandings();
    }
    if (target === 'stats' && DOM.statsContainer.innerHTML.includes('Fetching')) {
      fetchStats();
    }
  });
});

// ==========================================
// FAVORITES LOGIC
// ==========================================
function toggleFavorite(teamName, btnElement, cardElement) {
  if (favorites.includes(teamName)) {
    favorites = favorites.filter(t => t !== teamName);
    btnElement.classList.remove('active');
    cardElement.classList.remove('is-favorite');
  } else {
    favorites.push(teamName);
    btnElement.classList.add('active');
    cardElement.classList.add('is-favorite');
  }
  localStorage.setItem('arenalive_favorites', JSON.stringify(favorites));
  // Optionally re-sort the scoreboard
}

// ==========================================
// MATCHES & SCOREBOARD
// ==========================================
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
    DOM.matchesContainer.innerHTML = '<div class="loader">No matches found.</div>';
    return;
  }

  // Sort matches so favorites are at the top
  matches.sort((a, b) => {
    const aFav = favorites.includes(a.home.name) || favorites.includes(a.away.name);
    const bFav = favorites.includes(b.home.name) || favorites.includes(b.away.name);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  matches.forEach(match => {
    const clone = DOM.tplMatchCard.content.cloneNode(true);
    const card = clone.querySelector('.match-card');
    const btnFav = clone.querySelector('.btn-favorite');
    
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

    const isFav = favorites.includes(match.home.name) || favorites.includes(match.away.name);
    if (isFav) {
      card.classList.add('is-favorite');
      btnFav.classList.add('active');
    }

    btnFav.addEventListener('click', (e) => {
      e.stopPropagation();
      // toggle the home team as favorite for simplicity, or we could ask which one
      toggleFavorite(match.home.name, btnFav, card);
      toggleFavorite(match.away.name, btnFav, card); // Just favorite both in this match context to ensure it stays pinned
    });

    card.querySelector('.btn-view').addEventListener('click', () => openMatchDetail(match));
    DOM.matchesContainer.appendChild(clone);
  });
}

// ==========================================
// MATCH DETAIL & COMMENTARY
// ==========================================
async function openMatchDetail(match) {
  currentMatchId = match.id;
  // Hide all tabs, show detail view
  DOM.views.forEach(v => v.classList.remove('view-active'));
  document.querySelector('.tabs').style.display = 'none';
  DOM.detailView.classList.remove('hidden');
  
  DOM.detailHeader.innerHTML = `
    <div class="match-meta" style="justify-content: center; color: var(--color-primary); margin-bottom: 1rem;">
      ${match.status} &bull; ${match.clock || '0\''}
    </div>
    <div class="score-display">
      <div style="text-align:center"><img src="${match.home.logo}" class="team-logo" alt="${match.home.name}"><div style="font-size:0.8rem">${match.home.name}</div></div>
      <span class="score-text">${match.home.score !== undefined ? match.home.score : 0} - ${match.away.score !== undefined ? match.away.score : 0}</span>
      <div style="text-align:center"><img src="${match.away.logo}" class="team-logo" alt="${match.away.name}"><div style="font-size:0.8rem">${match.away.name}</div></div>
    </div>
  `;

  DOM.commentaryList.innerHTML = '<div class="loader">Fetching events...</div>';
  DOM.matchStatsSection.classList.add('hidden');
  knownCommentary.clear();
  
  await fetchCommentary();
  
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
    if (data.boxscore) {
      renderBoxscore(data.boxscore);
    }
  } catch (err) {
    console.error('Failed to fetch commentary', err);
  }
}

function renderBoxscore(teams) {
  if (!teams || teams.length < 2) return;
  DOM.matchStatsSection.classList.remove('hidden');
  DOM.statsBars.innerHTML = '';
  
  const homeStats = teams[0].statistics;
  const awayStats = teams[1].statistics;
  
  if (!homeStats || !awayStats) return;

  const statNames = ['possessionPct', 'shotsSummary', 'foulsCommitted', 'wonCorners'];
  const labels = ['Possession', 'Shots', 'Fouls', 'Corners'];

  statNames.forEach((key, idx) => {
    const hStat = homeStats.find(s => s.name === key);
    const aStat = awayStats.find(s => s.name === key);
    if (!hStat || !aStat) return;

    let hVal = parseFloat(hStat.displayValue) || 0;
    let aVal = parseFloat(aStat.displayValue) || 0;
    let total = hVal + aVal;
    if (total === 0) total = 1;

    let hPct = (hVal / total) * 100;
    let aPct = (aVal / total) * 100;

    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <div class="stat-labels">
        <span>${hStat.displayValue}</span>
        <span class="stat-label-title">${labels[idx]}</span>
        <span>${aStat.displayValue}</span>
      </div>
      <div class="stat-bar-container">
        <div class="stat-bar-home" style="width: ${hPct}%"></div>
        <div class="stat-bar-away" style="width: ${aPct}%"></div>
      </div>
    `;
    DOM.statsBars.appendChild(row);
  });
}

function renderCommentary(commentaryArr, keyEventsArr) {
  DOM.commentaryList.innerHTML = '';
  
  if (!commentaryArr || commentaryArr.length === 0) {
    DOM.commentaryList.innerHTML = '<div class="loader">No commentary available yet.</div>';
    return;
  }

  for (let i = 0; i < commentaryArr.length; i++) {
    const c = commentaryArr[i];
    const el = document.createElement('div');
    el.className = 'commentary-item';
    
    const textHash = c.text;
    if (!knownCommentary.has(textHash)) {
      knownCommentary.add(textHash);
      
      // If it's a new event after initial load
      if (knownCommentary.size > commentaryArr.length) {
        if (i === 0) speak(c.text); // TTS
        
        // Haptic & Audio for Goal
        if (c.text.toLowerCase().includes('goal')) {
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
          goalAudio.play().catch(e => console.log('Audio play blocked:', e));
        }
      }
    }

    let goalBadge = c.text.toLowerCase().includes('goal') ? '<span style="font-size:1.5rem">⚽</span> ' : '';

    el.innerHTML = `
      <div class="commentary-time">${c.time ? c.time : "•"}</div>
      <div class="commentary-text">${goalBadge}${c.text}</div>
    `;
    DOM.commentaryList.appendChild(el);
  }
}

// ==========================================
// STANDINGS
// ==========================================
async function fetchStandings() {
  try {
    const res = await fetch('/api/standings');
    const data = await res.json();
    renderStandings(data.children);
  } catch (err) {
    DOM.standingsContainer.innerHTML = '<div class="loader">Error loading standings.</div>';
  }
}

function renderStandings(groups) {
  if (!groups || groups.length === 0) {
    DOM.standingsContainer.innerHTML = '<div class="loader">Standings not available.</div>';
    return;
  }
  
  let html = '';
  groups.forEach(group => {
    html += `
      <div class="group-table">
        <h3>${group.name}</h3>
        <table class="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>MP</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
    `;
    const standings = group.standings.entries;
    standings.forEach(entry => {
      const stats = entry.stats;
      const getStat = (name) => { const s = stats.find(x => x.name === name); return s ? s.displayValue : '0'; };
      
      html += `
        <tr>
          <td>${getStat('rankChange') || entry.stats.find(s=>s.name === 'rank')?.displayValue || '-'}</td>
          <td>
            <div class="standings-team">
              <img src="${entry.team.logos?.[0]?.href || ''}" class="standings-logo" loading="lazy">
              ${entry.team.abbreviation || entry.team.name}
            </div>
          </td>
          <td>${getStat('gamesPlayed')}</td>
          <td>${getStat('wins')}</td>
          <td>${getStat('ties')}</td>
          <td>${getStat('losses')}</td>
          <td>${getStat('pointDifferential')}</td>
          <td style="font-weight:bold; color:var(--color-primary)">${getStat('points')}</td>
        </tr>
      `;
    });
    html += `</tbody></table></div>`;
  });
  DOM.standingsContainer.innerHTML = html;
}

// ==========================================
// TOURNAMENT STATS
// ==========================================
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    renderStats(data.stats);
  } catch (err) {
    DOM.statsContainer.innerHTML = '<div class="loader">Error loading statistics.</div>';
  }
}

function renderStats(statsArray) {
  if (!statsArray || statsArray.length === 0) {
    DOM.statsContainer.innerHTML = '<div class="loader">Statistics not available yet.</div>';
    return;
  }
  
  let html = '';
  statsArray.forEach(category => {
    html += `
      <div class="stat-category">
        <h3>${category.name}</h3>
    `;
    if (category.leaders) {
      category.leaders.slice(0, 5).forEach((leader, idx) => {
        html += `
          <div class="stat-item">
            <div class="stat-player">
              <span class="stat-rank">${idx + 1}</span>
              <div>
                <div class="stat-name">${leader.athlete.displayName}</div>
                <div class="stat-team">${leader.team.displayName}</div>
              </div>
            </div>
            <div class="stat-value">${leader.displayValue}</div>
          </div>
        `;
      });
    }
    html += `</div>`;
  });
  DOM.statsContainer.innerHTML = html;
}

// ==========================================
// EVENT LISTENERS & INIT
// ==========================================
DOM.btnBack.addEventListener('click', () => {
  DOM.detailView.classList.add('hidden');
  document.querySelector('.tabs').style.display = 'flex';
  const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-target');
  document.getElementById(activeTab).classList.add('view-active');
  
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
        applicationServerKey: 'BL-M5zT196AJv0v2UdKGA17c_5VPxE7WO5_JyemAhQ3GmqEvWa2tP5D4SVF5NJYnGIaxG1ad20s_9ZRZbJie_kE'
      });
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ subscription: sub })
      });
      alert('Push Notifications enabled successfully! You will receive alerts for live goals.');
    } catch (e) {
      console.error('Push error', e);
      alert('Failed to enable push notifications. Check browser permissions.');
    }
  }
});

async function init() {
  initSpeech();
  await fetchMatches();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
  
  setInterval(fetchMatches, 60000);
}

init();
