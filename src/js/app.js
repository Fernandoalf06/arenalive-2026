import { initSpeech, speak, toggleSpeech } from './speech.js';

const DOM = {
  // Navigation
  tabBtns: document.querySelectorAll('.tab-btn'),
  views: document.querySelectorAll('.tab-content'),
  
  // Containers
  matchesContainer: document.getElementById('matches-container'),
  standingsContainer: document.getElementById('standings-container'),
  statsContainer: document.getElementById('stats-container'),
  bracketContainer: document.getElementById('bracket-container'),
  
  // Match Detail
  scoreboardView: document.getElementById('scoreboard'),
  detailView: document.getElementById('match-detail'),
  btnBack: document.getElementById('btn-back'),
  detailHeader: document.getElementById('detail-header'),
  commentaryList: document.getElementById('commentary-list'),
  matchStatsSection: document.getElementById('match-stats-section'),
  statsBars: document.getElementById('stats-bars'),
  pitchEvents: document.getElementById('pitch-events'),
  
  // Interactive & Lineups
  detailTabs: document.querySelectorAll('.detail-tab-btn'),
  detailTabContents: document.querySelectorAll('.detail-tab-content'),
  hypeHome: document.getElementById('hype-home'),
  hypeAway: document.getElementById('hype-away'),
  hypeStats: document.getElementById('hype-stats'),
  btnCheerHome: document.getElementById('btn-cheer-home'),
  btnCheerAway: document.getElementById('btn-cheer-away'),
  predHome: document.getElementById('pred-home'),
  predDraw: document.getElementById('pred-draw'),
  predAway: document.getElementById('pred-away'),
  btnPredicts: document.querySelectorAll('.btn-predict'),
  homePlayers: document.getElementById('lineup-home-players'),
  awayPlayers: document.getElementById('lineup-away-players'),
  homeBench: document.getElementById('home-bench-list'),
  awayBench: document.getElementById('away-bench-list'),
  
  // Player Modal
  playerModal: document.getElementById('player-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  playerImg: document.getElementById('player-img'),
  playerName: document.getElementById('player-name'),
  playerPos: document.getElementById('player-pos'),
  playerTeamName: document.getElementById('player-team-name'),
  radarChart: document.getElementById('radar-chart'),
  playerStatsGrid: document.getElementById('player-stats-grid'),
  
  // Templates
  tplMatchCard: document.getElementById('tpl-match-card'),
  
  // Headers
  btnTts: document.getElementById('btn-tts'),
  ttsStatusDot: document.getElementById('tts-status-dot'),
  btnPush: document.getElementById('btn-push')
};

let currentMatch = null;
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
    if (target === 'bracket' && DOM.bracketContainer.innerHTML.includes('Fetching')) {
      fetchBracket();
    }
  });
});

// Detail inner tabs
if (DOM.detailTabs) {
  DOM.detailTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.detailTabs.forEach(b => b.classList.remove('active'));
      DOM.detailTabContents.forEach(c => {
        c.classList.remove('active-detail-tab');
        c.classList.add('hidden');
      });
      btn.classList.add('active');
      const target = document.getElementById(btn.getAttribute('data-target'));
      if (target) {
        target.classList.remove('hidden');
        target.classList.add('active-detail-tab');
      }
    });
  });
}


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

    const matchVenue = clone.querySelector('.match-venue');
    if (matchVenue && match.venue) {
      matchVenue.innerHTML = `<i data-lucide="map-pin"></i> ${match.venue}`;
    }

    const goalScorersDiv = clone.querySelector('.goal-scorers');
    if (goalScorersDiv && match.goalScorers && match.goalScorers.length > 0) {
      goalScorersDiv.innerHTML = match.goalScorers.map(g => `<div><i data-lucide="goal"></i> ${g.name} ${g.clock}</div>`).join('');
    }

    const headlineDiv = clone.querySelector('.match-headline');
    if (headlineDiv && match.headline) {
      headlineDiv.innerHTML = `<i data-lucide="newspaper"></i> ${match.headline}`;
    }

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
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// MATCH DETAIL & COMMENTARY
// ==========================================
async function openMatchDetail(match) {
  currentMatch = match;
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
  await fetchCheers();
  await fetchPredictions();
  
  if (pollInterval) clearInterval(pollInterval);
  if (match.state === 'in' || match.state === 'pre') {
    pollInterval = setInterval(() => {
      fetchCommentary();
      fetchCheers();
      fetchPredictions();
    }, 30000);
  }
}

async function fetchCommentary() {
  if (!currentMatch) return;
  try {
    const res = await fetch(`/api/commentary?event=${currentMatch.id}`);
    const data = await res.json();
    renderCommentary(data.commentary, data.keyEvents);
    if (data.boxscore) {
      renderBoxscore(data.boxscore);
    }
    if (data.rosters) {
      renderLineups(data.rosters);
    }
    
    // New Feature Rendering
    renderMatchInfo(data.gameInfo, data.broadcasts);
    renderFormH2H(data.lastFiveGames, data.headToHeadGames, data.form);
    renderMedia(data.news, data.videos, data.article);
    renderMatchLeaders(data.leaders);
    renderMiniStandings(data.standings);
  } catch (err) {
    console.error('Failed to fetch commentary', err);
  }
}

async function fetchCheers() {
  if (!currentMatch) return;
  try {
    const res = await fetch(`/api/cheers?event=${currentMatch.id}`);
    const data = await res.json();
    renderCheers(data);
  } catch (err) {
    console.error('Failed to fetch cheers', err);
  }
}

async function fetchPredictions() {
  if (!currentMatch) return;
  try {
    const res = await fetch(`/api/predictions?event=${currentMatch.id}`);
    const data = await res.json();
    renderPredictions(data);
  } catch (err) {
    console.error('Failed to fetch predictions', err);
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

function renderPitchEvents(keyEventsArr, homeTeamName, awayTeamName) {
  DOM.pitchEvents.innerHTML = '';
  if (!keyEventsArr || keyEventsArr.length === 0) return;

  keyEventsArr.forEach(event => {
    let iconName = 'map-pin';
    let typeClass = 'other-event';
    const text = event.text ? event.text.toLowerCase() : '';
    const eventType = event.type ? event.type.toLowerCase() : '';
    
    if (text.includes('goal') || eventType.includes('goal')) {
      iconName = 'crosshair';
      typeClass = 'goal-event';
    } else if (text.includes('red card') || eventType.includes('red')) {
      iconName = 'square';
      typeClass = 'red-card-event';
    } else if (text.includes('yellow card') || eventType.includes('yellow')) {
      iconName = 'square';
      typeClass = 'yellow-card-event';
    } else if (text.includes('substitution') || eventType.includes('sub')) {
      iconName = 'refresh-cw';
      typeClass = 'sub-event';
    } else {
      return;
    }

    const dot = document.createElement('div');
    dot.className = `pitch-event-dot ${typeClass}`;
    dot.innerHTML = `<i data-lucide="${iconName}"></i>`;
    
    let leftPct = 50;
    if (event.team) {
      const isHome = event.team.toLowerCase().includes(homeTeamName.toLowerCase()) || 
                     homeTeamName.toLowerCase().includes(event.team.toLowerCase());
      const isAway = event.team.toLowerCase().includes(awayTeamName.toLowerCase()) || 
                     awayTeamName.toLowerCase().includes(event.team.toLowerCase());
      if (isHome) {
        leftPct = 10 + Math.random() * 35;
      } else if (isAway) {
        leftPct = 55 + Math.random() * 35;
      } else {
        leftPct = 30 + Math.random() * 40;
      }
    } else {
      leftPct = 20 + Math.random() * 60;
    }
    
    const topPct = 15 + Math.random() * 70;
    
    dot.style.left = `${leftPct}%`;
    dot.style.top = `${topPct}%`;
    dot.style.position = 'absolute';
    dot.style.transform = 'translate(-50%, -50%)';
    dot.style.cursor = 'pointer';
    dot.style.fontSize = '1.2rem';
    dot.style.zIndex = '10';
    const timeStr = event.clock ? (event.clock.includes("'") ? event.clock : event.clock + "'") : '';
    dot.title = `${timeStr ? timeStr + ' - ' : ''}${event.text}`;
    
    DOM.pitchEvents.appendChild(dot);
  });
  if (window.lucide) lucide.createIcons();
}

function renderCommentary(commentaryArr, keyEventsArr) {
  if (currentMatch) {
    renderPitchEvents(keyEventsArr, currentMatch.home.name, currentMatch.away.name);
  }

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

    let goalBadge = c.text.toLowerCase().includes('goal') ? '<span class="goal-badge"><i data-lucide="crosshair"></i></span> ' : '';

    el.innerHTML = `
      <div class="commentary-time">${c.time ? c.time : "•"}</div>
      <div class="commentary-text">${goalBadge}${c.text}</div>
    `;
    DOM.commentaryList.appendChild(el);
  }
  if (window.lucide) lucide.createIcons();
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
          <td>${entry.stats.find(s=>s.name === 'rank')?.displayValue || getStat('rank') || '-'}</td>
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
        <h3>${category.displayName || category.name}</h3>
    `;
    if (category.leaders) {
      category.leaders.slice(0, 5).forEach((leader, idx) => {
        html += `
          <div class="stat-item">
            <div class="stat-player">
              <span class="stat-rank">${idx + 1}</span>
              <div>
                <div class="stat-name">${leader.athlete.displayName}</div>
                <div class="stat-team">${leader.athlete.team?.displayName || leader.athlete.team?.name || ''}</div>
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
// PREDICTIONS & CHEERS
// ==========================================
function renderCheers(data) {
  const home = parseInt(data.home_cheers) || 0;
  const away = parseInt(data.away_cheers) || 0;
  const total = home + away || 1;
  
  const homePct = (home / total) * 100;
  const awayPct = (away / total) * 100;
  
  DOM.hypeHome.style.width = `${homePct}%`;
  DOM.hypeAway.style.width = `${awayPct}%`;
  DOM.hypeStats.textContent = `${home} - ${away}`;
}

function renderPredictions(data) {
  const h = parseInt(data.home_win) || 0;
  const d = parseInt(data.draw) || 0;
  const a = parseInt(data.away_win) || 0;
  const total = h + d + a || 1;
  
  DOM.predHome.style.width = `${(h/total)*100}%`;
  DOM.predDraw.style.width = `${(d/total)*100}%`;
  DOM.predAway.style.width = `${(a/total)*100}%`;
  
  DOM.btnPredicts[0].innerHTML = `Home (${Math.round((h/total)*100)}%)`;
  DOM.btnPredicts[1].innerHTML = `Draw (${Math.round((d/total)*100)}%)`;
  DOM.btnPredicts[2].innerHTML = `Away (${Math.round((a/total)*100)}%)`;
}

// ==========================================
// LINEUPS & RADAR
// ==========================================
function renderLineups(rosters) {
  if (!rosters || rosters.length < 2) return;
  DOM.homePlayers.innerHTML = '';
  DOM.awayPlayers.innerHTML = '';
  DOM.homeBench.innerHTML = '';
  DOM.awayBench.innerHTML = '';
  
  const hRoster = rosters[0].roster;
  const aRoster = rosters[1].roster;
  
  const plotPlayer = (player, container, bench, teamName) => {
    if (player.starter && player.formationPlace) {
      const p = parseInt(player.formationPlace);
      // Fake x/y based on formation place for simplicity 
      // 1 is GK, 2-5 are Def, etc.
      let left = 50, top = 50;
      if (p === 1) { left = 50; top = 10; }
      else if (p >= 2 && p <= 5) { left = 15 + (p-2)*20; top = 30; }
      else if (p >= 6 && p <= 8) { left = 25 + (p-6)*25; top = 60; }
      else if (p >= 9 && p <= 11) { left = 25 + (p-9)*25; top = 85; }
      else { left = 10 + Math.random()*80; top = 20 + Math.random()*60; }
      
      const dot = document.createElement('div');
      dot.className = 'player-node';
      dot.style.left = `${left}%`;
      dot.style.top = `${top}%`;
      dot.textContent = player.jersey;
      dot.innerHTML += `<span>${player.athlete.shortName}</span>`;
      dot.onclick = () => openPlayerModal(player, teamName);
      container.appendChild(dot);
    } else {
      const li = document.createElement('li');
      li.textContent = `${player.jersey} - ${player.athlete.displayName}`;
      li.onclick = () => openPlayerModal(player, teamName);
      bench.appendChild(li);
    }
  };
  
  hRoster.forEach(p => plotPlayer(p, DOM.homePlayers, DOM.homeBench, rosters[0].team.displayName));
  aRoster.forEach(p => plotPlayer(p, DOM.awayPlayers, DOM.awayBench, rosters[1].team.displayName));
}

function openPlayerModal(player, teamName) {
  DOM.playerName.textContent = player.athlete.displayName;
  DOM.playerPos.textContent = player.position.displayName;
  DOM.playerTeamName.textContent = teamName;
  DOM.playerImg.src = player.athlete.headshot ? player.athlete.headshot.href : (player.athlete.jerseyImages ? player.athlete.jerseyImages[0].href : '');
  
  DOM.playerStatsGrid.innerHTML = '';
  
  // Extract stats for radar
  const getS = (abb) => { const s = player.stats.find(x => x.abbreviation === abb); return s ? parseInt(s.displayValue) : 0; };
  const apps = getS('APP');
  const gls = getS('G') + getS('GA'); // Goals or Goals Against for GK
  const ast = getS('A') + getS('SV'); // Assists or Saves
  const sht = getS('SHOT') + getS('SHF');
  const fls = getS('FC');
  
  const statsList = [
    { label: 'Apps', val: apps },
    { label: 'G/GA', val: gls },
    { label: 'A/SV', val: ast },
    { label: 'SHT', val: sht },
    { label: 'FLS', val: fls }
  ];
  
  statsList.forEach(s => {
    DOM.playerStatsGrid.innerHTML += `<div class="p-stat-box"><div class="p-stat-val">${s.val}</div><div class="p-stat-label">${s.label}</div></div>`;
  });
  
  drawRadar(statsList.map(s => s.val));
  DOM.playerModal.classList.remove('hidden');
}

function drawRadar(values) {
  const svg = DOM.radarChart;
  svg.innerHTML = '';
  const cx = 100, cy = 100, radius = 80;
  
  // Draw background web
  for (let i = 1; i <= 4; i++) {
    const r = (radius / 4) * i;
    const pts = [];
    for (let j = 0; j < 5; j++) {
      const angle = (Math.PI * 2 * j) / 5 - Math.PI/2;
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    svg.innerHTML += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
  }
  
  // Draw values (normalize loosely)
  const maxVal = Math.max(...values, 10);
  const dataPts = [];
  values.forEach((v, j) => {
    const r = (v / maxVal) * radius;
    const angle = (Math.PI * 2 * j) / 5 - Math.PI/2;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    dataPts.push(`${px},${py}`);
    svg.innerHTML += `<circle cx="${px}" cy="${py}" r="4" fill="var(--color-primary)"/>`;
  });
  svg.innerHTML += `<polygon points="${dataPts.join(' ')}" fill="rgba(16,185,129,0.4)" stroke="var(--color-primary)" stroke-width="2"/>`;
}

DOM.btnCloseModal.addEventListener('click', () => DOM.playerModal.classList.add('hidden'));

// Cheer & Prediction Listeners
DOM.btnCheerHome.addEventListener('click', async () => {
  if (!currentMatch) return;
  DOM.btnCheerHome.disabled = true;
  const res = await fetch(`/api/cheers?event=${currentMatch.id}`, {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ teamType: 'home' })
  });
  const data = await res.json();
  renderCheers(data);
  DOM.btnCheerHome.disabled = false;
});

DOM.btnCheerAway.addEventListener('click', async () => {
  if (!currentMatch) return;
  DOM.btnCheerAway.disabled = true;
  const res = await fetch(`/api/cheers?event=${currentMatch.id}`, {
    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ teamType: 'away' })
  });
  const data = await res.json();
  renderCheers(data);
  DOM.btnCheerAway.disabled = false;
});

DOM.btnPredicts.forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!currentMatch) return;
    DOM.btnPredicts.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const pred = btn.getAttribute('data-pred');
    const res = await fetch(`/api/predictions?event=${currentMatch.id}`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ prediction: pred })
    });
    const data = await res.json();
    renderPredictions(data);
  });
});

// ==========================================
// TOURNAMENT BRACKET
// ==========================================
async function fetchBracket() {
  try {
    const res = await fetch('/api/bracket');
    const data = await res.json();
    renderBracket(data.bracket);
  } catch (err) {
    DOM.bracketContainer.innerHTML = '<div class="loader">Error loading bracket.</div>';
  }
}

function renderBracket(matches) {
  if (!matches || matches.length === 0) {
    DOM.bracketContainer.innerHTML = '<div class="loader">Knockout bracket not available yet.</div>';
    return;
  }
  
  // Group by phase
  const phases = {};
  matches.forEach(m => {
    if (!phases[m.phase]) phases[m.phase] = [];
    phases[m.phase].push(m);
  });
  
  let html = '';
  Object.keys(phases).forEach(phase => {
    html += `
      <div class="bracket-phase">
        <h3>${phase}</h3>
        <div class="bracket-matches">
    `;
    phases[phase].forEach(match => {
      html += `
        <div class="match-card" style="width: 320px; cursor: pointer" onclick="openMatchById('${match.id}')">
          <div class="match-meta">
            <span class="match-status">${match.status}</span>
            <span class="match-clock">${new Date(match.date).toLocaleDateString()}</span>
          </div>
          <div class="teams">
            <div class="team home">
              <img src="${match.home.logo}" class="team-logo" loading="lazy" />
              <span class="team-name">${match.home.name}</span>
              <span class="team-score">${match.home.score !== undefined ? match.home.score : '-'}</span>
            </div>
            <div class="team away">
              <img src="${match.away.logo}" class="team-logo" loading="lazy" />
              <span class="team-name">${match.away.name}</span>
              <span class="team-score">${match.away.score !== undefined ? match.away.score : '-'}</span>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div></div>`;
  });
  DOM.bracketContainer.innerHTML = html;
}

window.openMatchById = async (id) => {
  // Try to find in scoreboard
  const res = await fetch('/api/matches');
  const data = await res.json();
  const match = data.matches.find(m => m.id === id);
  if (match) {
    openMatchDetail(match);
  }
};

// ==========================================
// EVENT LISTENERS & INIT
// ==========================================
DOM.btnBack.addEventListener('click', () => {
  DOM.detailView.classList.add('hidden');
  document.querySelector('.tabs').style.display = 'flex';
  const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-target');
  document.getElementById(activeTab).classList.add('view-active');
  
  currentMatch = null;
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

// ==========================================
// NEW FEATURE RENDERING
// ==========================================

function renderMatchInfo(gameInfo, broadcasts) {
  const infoStrip = document.getElementById('match-info-strip');
  const broadcastStrip = document.getElementById('broadcasts-strip');
  
  if (gameInfo) {
    infoStrip.classList.remove('hidden');
    let html = '';
    if (gameInfo.venue) html += `<span><i data-lucide="map-pin"></i> ${gameInfo.venue.fullName || gameInfo.venue.displayName}</span>`;
    if (gameInfo.attendance) html += `<span><i data-lucide="users"></i> ${gameInfo.attendance.toLocaleString()}</span>`;
    if (gameInfo.officials && gameInfo.officials.length > 0) {
      const ref = gameInfo.officials.find(o => o.position && o.position.displayName === 'Referee') || gameInfo.officials[0];
      html += `<span><i data-lucide="user"></i> ${ref.fullName}</span>`;
    }
    infoStrip.innerHTML = html;
  } else {
    infoStrip.classList.add('hidden');
  }

  if (broadcasts && broadcasts.length > 0) {
    broadcastStrip.classList.remove('hidden');
    broadcastStrip.innerHTML = `<strong>Where to Watch:</strong> ` + broadcasts.map(b => {
      const icon = b.type?.shortName === 'STREAMING' ? 'monitor-play' : 'tv';
      return `<span class="broadcast-chip"><i data-lucide="${icon}"></i> ${b.media?.shortName || b.market?.type}</span>`;
    }).join('');
  } else {
    broadcastStrip.classList.add('hidden');
  }
}

function renderFormH2H(lastFiveGames, headToHeadGames, form) {
  const container = document.getElementById('form-h2h-section');
  if (!lastFiveGames?.length && !headToHeadGames?.length && !form?.length) {
    container.classList.add('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  
  let html = '<h3>Form & Head-to-Head</h3><div class="form-h2h-grid">';
  
  if (form && form.length >= 2) {
    html += '<div class="form-teams">';
    [0, 1].forEach(i => {
      const f = form[i];
      if(!f) return;
      html += `<div class="team-form"><span class="team-form-name">${f.team?.displayName || ''}</span><div class="form-circles">`;
      if (f.events) {
        f.events.forEach(e => {
          let cClass = 'form-d';
          if (e.gameResult === 'W') cClass = 'form-w';
          if (e.gameResult === 'L') cClass = 'form-l';
          html += `<div class="form-circle ${cClass}" title="${e.score} vs ${e.opponent?.abbreviation || '?'}">${e.gameResult}</div>`;
        });
      }
      html += `</div></div>`;
    });
    html += '</div>';
  }

  if (headToHeadGames && headToHeadGames.length > 0) {
    html += `<div class="h2h-summary"><h4>Past Meetings</h4><ul>`;
    headToHeadGames.slice(0, 3).forEach(g => {
       if (g.gameDate) {
         html += `<li>${new Date(g.gameDate).getFullYear()}: ${g.homeTeamScore} - ${g.awayTeamScore}</li>`;
       }
    });
    html += `</ul></div>`;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function renderMedia(news, videos, article) {
  const container = document.getElementById('media-container');
  if ((!news || news.length === 0) && (!videos || videos.length === 0) && !article) {
    container.innerHTML = '<p style="color:var(--color-text-muted); padding: 2rem; text-align: center;">No media available for this match.</p>';
    return;
  }
  
  let html = '';
  
  if (article && article.story) {
    html += `<div class="recap-section">
      <h3>Match Recap</h3>
      <h4>${article.headline}</h4>
      <div class="recap-story">${article.story.substring(0, 400)}... <a href="${article.links?.web?.href || '#'}" target="_blank">Read more</a></div>
    </div>`;
  }
  
  if (videos && videos.length > 0) {
    html += `<h3>Highlights</h3><div class="videos-grid">`;
    videos.slice(0, 2).forEach(v => {
      const link = v.links?.source?.href || v.links?.web?.href || '#';
      html += `<a href="${link}" target="_blank" class="video-card">
        <div class="video-thumb"><img src="${v.thumbnail}" alt="thumb"><div class="play-overlay"><i data-lucide="play-circle"></i></div></div>
        <div class="video-title">${v.headline}</div>
      </a>`;
    });
    html += `</div>`;
  }
  
  if (news && news.length > 0) {
    html += `<h3>Latest News</h3><div class="news-list">`;
    news.slice(0, 3).forEach(n => {
      const link = n.links?.web?.href || '#';
      html += `<a href="${link}" target="_blank" class="news-card">
        ${n.images && n.images[0] ? `<img src="${n.images[0].url}" alt="news">` : ''}
        <div class="news-content">
          <h4>${n.headline}</h4>
          <p>${n.description}</p>
        </div>
      </a>`;
    });
    html += `</div>`;
  }
  
  container.innerHTML = html;
}

function renderMatchLeaders(leaders) {
  const container = document.getElementById('match-leaders-section');
  if (!leaders || leaders.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  let hasValidLeaders = false;
  let html = `<h3>Match Leaders</h3><div class="leaders-grid">`;
  
  leaders.forEach(teamLeader => {
     if(teamLeader.leaders && teamLeader.leaders.length > 0) {
        const firstCat = teamLeader.leaders[0];
        if(firstCat.leaders && firstCat.leaders.length > 0) {
           const topPlayer = firstCat.leaders[0];
           hasValidLeaders = true;
           html += `<div class="leader-card">
             <img src="${topPlayer.athlete.headshot?.href || 'https://a.espncdn.com/i/headshots/nophoto.png'}" alt="player" loading="lazy">
             <div class="leader-info">
               <span class="l-name">${topPlayer.athlete.displayName}</span>
               <span class="l-stat">${topPlayer.displayValue} ${firstCat.displayName}</span>
             </div>
           </div>`;
        }
     }
  });
  
  html += `</div>`;
  
  if (hasValidLeaders) {
    container.classList.remove('hidden');
    container.innerHTML = html;
  } else {
    container.classList.add('hidden');
  }
}

function renderMiniStandings(standings) {
  const container = document.getElementById('mini-standings-section');
  if (!standings || !standings.groups || standings.groups.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  const group = standings.groups[0];
  
  let html = `<h3>${group.name}</h3>
    <div class="mini-standings-wrapper">
    <table class="mini-standings-table">
      <tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>`;
      
  if (group.standings && group.standings.entries) {
    group.standings.entries.forEach(e => {
       const stats = e.stats;
       const getStat = name => {
         const st = stats.find(s => s.name === name || s.abbreviation === name);
         return st ? st.displayValue : '0';
       };
       const isCurrent = currentMatch && (e.team.id === currentMatch.home.id || e.team.id === currentMatch.away.id);
       html += `<tr class="${isCurrent ? 'highlight' : ''}">
         <td class="team-cell"><img src="${e.team.logos?.[0]?.href || ''}" class="ms-logo">${e.team.abbreviation}</td>
         <td>${getStat('gamesPlayed') || getStat('GP')}</td>
         <td>${getStat('wins') || getStat('W')}</td>
         <td>${getStat('ties') || getStat('D')}</td>
         <td>${getStat('losses') || getStat('L')}</td>
         <td>${getStat('pointDifferential') || getStat('GD')}</td>
         <td><strong>${getStat('points') || getStat('P')}</strong></td>
       </tr>`;
    });
  }
  
  html += `</table></div>`;
  container.innerHTML = html;
}

async function init() {
  initSpeech();
  await fetchMatches();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
  }
  
  setInterval(fetchMatches, 60000);
  
  // Client-side fallback for Push Notifications (due to Vercel free tier limits)
  setInterval(() => {
    fetch('/api/cron/check-goals').catch(console.error);
  }, 120000); // Check every 2 minutes while app is open
  
  if (window.lucide) lucide.createIcons();
}

init();
