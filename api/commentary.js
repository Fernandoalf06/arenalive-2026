export default async function handler(req, res) {
  const { event } = req.query;
  if (!event) {
    return res.status(400).json({ error: 'Missing event id' });
  }

  try {
    const summaryUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${event}`;
    const response = await fetch(summaryUrl);
    const data = await response.json();

    // Extract commentary
    const commentary = data.commentary ? data.commentary.map(c => ({
      time: c.time,
      text: c.text
    })) : [];

    // Extract key events (goals, cards, subs)
    const keyEvents = data.keyEvents ? data.keyEvents.map(e => ({
      id: e.id,
      text: e.text,
      clock: e.clock ? e.clock.displayValue : '',
      type: e.type ? (typeof e.type === 'string' ? e.type : e.type.text || 'Unknown') : 'Unknown',
      team: e.team ? (typeof e.team === 'string' ? e.team : e.team.displayName || null) : null
    })) : [];

    // Extract boxscore stats
    const boxscore = data.boxscore ? data.boxscore.teams : null;
    
    // Extract rosters
    const rosters = data.rosters || [];
    
    // Extract predictor
    const predictor = data.predictor || null;

    // Extract game info
    const gameInfo = data.gameInfo || null;

    // Transform lastFiveGames: ESPN returns {team: object, events: [{gameResult, ...}]}
    // We need: {team: string, form: ['W','D','L',...]}
    const lastFiveGames = (data.lastFiveGames || []).map(lfg => ({
      team: typeof lfg.team === 'string' ? lfg.team : (lfg.team?.displayName || 'Unknown'),
      form: (lfg.events || []).map(e => e.gameResult || '?')
    }));

    // Transform headToHeadGames: ESPN returns [{team: object, events: [{score, gameDate, ...}]}]
    // We flatten to an array of individual past matches
    const headToHeadGames = [];
    if (data.headToHeadGames) {
      for (const h2h of data.headToHeadGames) {
        for (const evt of (h2h.events || [])) {
          const scores = (evt.score || '0-0').split('-');
          headToHeadGames.push({
            date: evt.gameDate || '',
            homeTeam: h2h.team?.displayName || 'Team',
            homeScore: scores[0] || '0',
            awayScore: scores[1] || '0',
            awayTeam: evt.opponent?.displayName || 'Opponent',
          });
        }
      }
    }

    // Transform broadcasts: ESPN returns {type: object, market: object, media: object}
    // We need: {market: string, names: [string]}
    const broadcasts = (data.broadcasts || []).map(b => ({
      market: typeof b.market === 'string' ? b.market : (b.market?.type || b.region || 'Global'),
      names: b.names || (b.media ? [b.media.shortName || b.media.name || b.media.callLetters || 'Unknown'] : []),
      type: typeof b.type === 'string' ? b.type : (b.type?.shortName || 'TV')
    }));

    // Transform news: ESPN returns {header, link, articles: [...]}
    // We need: array of {headline, description, image (string URL), link (string URL)}
    const newsArticles = data.news?.articles || [];
    const news = newsArticles.map(a => ({
      headline: a.headline || '',
      description: a.description || '',
      image: a.images?.[0]?.url || null,
      link: a.links?.web?.href || a.links?.mobile?.href || '#'
    }));

    // Transform videos: ESPN has images[] not thumbnail
    const videos = (data.videos || []).map(v => ({
      headline: v.headline || v.title || '',
      thumbnail: v.thumbnail || v.images?.[0]?.url || v.posterImages?.default?.href || null,
      link: v.links?.web?.href || v.links?.mobile?.href || '#'
    }));

    // Transform article
    const rawArticle = data.article || null;
    const article = rawArticle ? {
      headline: rawArticle.headline || '',
      story: typeof rawArticle.story === 'string' ? rawArticle.story : (rawArticle.description || ''),
      link: rawArticle.links?.web?.href || rawArticle.links?.mobile?.href || null,
      image: rawArticle.images?.[0]?.url || null
    } : null;

    // Transform leaders
    const leaders = (data.leaders || []).map(teamLeader => ({
      team: {
        displayName: typeof teamLeader.team === 'string' ? teamLeader.team : (teamLeader.team?.displayName || 'Unknown'),
        logo: typeof teamLeader.team === 'string' ? null : (teamLeader.team?.logo || teamLeader.team?.logos?.[0]?.href || null),
      },
      leaders: (teamLeader.leaders || []).map(cat => ({
        displayName: cat.displayName || cat.name || 'Stat',
        leaders: (cat.leaders || []).map(l => ({
          displayValue: typeof l.displayValue === 'string' ? l.displayValue 
            : (l.mainStat?.value || l.summary || ''),
          athlete: {
            displayName: l.athlete?.displayName || l.athlete?.fullName || 'Unknown Player',
            headshot: l.athlete?.headshot?.href || l.athlete?.headshot || null,
          }
        }))
      }))
    }));

    // Standings (pass through safely)
    const standings = data.standings || null;
    const form = data.boxscore?.form || [];

    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20');
    res.status(200).json({ 
      commentary, keyEvents, boxscore, rosters, predictor,
      gameInfo, lastFiveGames, headToHeadGames, broadcasts, 
      news, videos, article, leaders, standings, form
    });
  } catch (error) {
    console.error('Error fetching commentary:', error);
    res.status(500).json({ error: 'Failed to fetch commentary' });
  }
}
