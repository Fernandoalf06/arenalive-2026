import useSWR from 'swr';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, Activity, Play, FileText, Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MatchDetailDialog({ match, onClose }: { match: any, onClose: () => void }) {
  const { data, error, isLoading } = useSWR(match ? `/api/commentary?event=${match.id}` : null, fetcher, {
    refreshInterval: 30000,
  });

  if (!match) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    if (error || !data || !data.gameInfo) {
      return <div className="text-center py-10 text-muted-foreground">Detail pertandingan tidak tersedia saat ini.</div>;
    }

    const { gameInfo, broadcasts, lastFiveGames, headToHeadGames, article, videos, news, leaders, standings, boxscore, rosters, keyEvents } = data;

    return (
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="lineups">Lineups</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="p-4 space-y-6">
          {/* Info Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 bg-secondary/30 p-3 rounded-lg text-sm text-muted-foreground">
             {gameInfo.venue?.fullName && (
               <div className="flex items-center gap-2"><MapPin size={16} className="text-primary"/> {gameInfo.venue.fullName}</div>
             )}
             {gameInfo.attendance && (
               <div className="flex items-center gap-2"><Users size={16} className="text-primary"/> {gameInfo.attendance.toLocaleString()}</div>
             )}
          </div>

          {/* Broadcasts */}
          {broadcasts?.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {broadcasts.map((b: any, i: number) => (
                <Badge key={i} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 flex gap-1">
                  <Tv size={12}/> {String(b.market || '')} {Array.isArray(b.names) ? b.names.join(', ') : ''}
                </Badge>
              ))}
            </div>
          )}

          {/* Form & H2H */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Form */}
             <div className="bg-card border border-border p-4 rounded-xl">
               <h4 className="text-primary font-bold mb-3 border-b border-primary/20 pb-2">Recent Form</h4>
               <div className="space-y-3">
                 {lastFiveGames?.map((teamForm: any, i: number) => (
                   <div key={i} className="flex justify-between items-center">
                     <span className="font-semibold text-sm">{String(teamForm.team || 'Team')}</span>
                     <div className="flex gap-1">
                       {(Array.isArray(teamForm.form) ? teamForm.form : []).map((f: string, j: number) => (
                         <span key={j} className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold text-white ${f==='W' ? 'bg-primary shadow-[0_0_5px_rgba(16,185,129,0.5)]' : f==='D' ? 'bg-yellow-500' : 'bg-destructive'}`}>
                           {String(f)}
                         </span>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             {/* H2H */}
             {headToHeadGames?.length > 0 && (
               <div className="bg-card border border-border p-4 rounded-xl">
                 <h4 className="text-primary font-bold mb-3 border-b border-primary/20 pb-2">Head-to-Head</h4>
                 <div className="space-y-2 text-sm text-muted-foreground">
                   {headToHeadGames.map((g: any, i: number) => (
                     <div key={i} className="flex justify-between border-b border-border/50 pb-1 last:border-0">
                       <span>{g.date ? new Date(g.date).getFullYear() : '?'}</span>
                       <span className="font-medium text-foreground">{String(g.homeTeam || '')} {String(g.homeScore || '0')} - {String(g.awayScore || '0')} {String(g.awayTeam || '')}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
          
          {/* Mini Standings */}
          {standings?.groups?.[0]?.standings?.entries && (
            <div className="bg-card border border-border p-4 rounded-xl overflow-x-auto">
              <h4 className="text-primary font-bold mb-3 border-b border-primary/20 pb-2">{standings.groups[0].name || 'Group Standings'}</h4>
              <table className="w-full text-sm text-left">
                <thead className="text-muted-foreground bg-secondary/30">
                  <tr>
                    <th className="p-2 rounded-tl-lg">Team</th>
                    <th className="p-2">GP</th>
                    <th className="p-2">W</th>
                    <th className="p-2">D</th>
                    <th className="p-2">L</th>
                    <th className="p-2">GD</th>
                    <th className="p-2 rounded-tr-lg">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.groups[0].standings.entries.map((entry: any, i: number) => {
                    const getStat = (name: string) => entry.stats?.find((s:any) => s.name === name)?.displayValue || '0';
                    const isPlaying = entry.team?.id === match.home?.id || entry.team?.id === match.away?.id;
                    return (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${isPlaying ? 'bg-primary/10' : ''}`}>
                        <td className="p-2 flex items-center gap-2">
                          <img src={entry.team?.logos?.[0]?.href} alt="" className="w-5 h-5 object-contain" />
                          <span className="font-semibold">{entry.team?.displayName}</span>
                        </td>
                        <td className="p-2">{getStat('gamesPlayed')}</td>
                        <td className="p-2">{getStat('wins')}</td>
                        <td className="p-2">{getStat('ties')}</td>
                        <td className="p-2">{getStat('losses')}</td>
                        <td className="p-2">{getStat('pointDifferential')}</td>
                        <td className="p-2 font-bold text-primary">{getStat('points')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="p-4 space-y-6">
          {/* Boxscore Stats */}
          {boxscore?.length === 2 && (
            <div className="bg-card border border-border p-4 rounded-xl space-y-4">
              <h4 className="text-primary font-bold mb-3 border-b border-primary/20 pb-2">Match Stats</h4>
              <div className="flex justify-between text-sm font-bold px-2 mb-2">
                <span>{String(boxscore[0]?.team?.abbreviation || 'HOME')}</span>
                <span>{String(boxscore[1]?.team?.abbreviation || 'AWAY')}</span>
              </div>
              {boxscore[0]?.statistics?.map((stat: any, i: number) => {
                const homeValStr = String(stat.displayValue || '0');
                const awayValStr = String(boxscore[1]?.statistics?.find((s:any) => s.name === stat.name)?.displayValue || '0');
                const homeVal = parseFloat(homeValStr) || 0;
                const awayVal = parseFloat(awayValStr) || 0;
                const total = homeVal + awayVal;
                const homePercent = total > 0 ? (homeVal / total) * 100 : 50;
                const awayPercent = total > 0 ? (awayVal / total) * 100 : 50;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{homeValStr}</span>
                      <span className="uppercase tracking-wider">{String(stat.label || stat.name || '')}</span>
                      <span>{awayValStr}</span>
                    </div>
                    <div className="flex h-2 w-full rounded-full overflow-hidden bg-secondary">
                      <div style={{ width: `${homePercent}%` }} className="bg-primary" />
                      <div style={{ width: `${awayPercent}%` }} className="bg-blue-500" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Leaders */}
          {leaders?.length > 0 && (
            <div className="bg-card border border-border p-4 rounded-xl">
              <h4 className="text-primary font-bold mb-4 border-b border-primary/20 pb-2">Top Performers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {leaders.map((teamLeaders: any, i: number) => (
                  <div key={i} className="space-y-4">
                    <div className="font-bold flex items-center gap-2">
                      {teamLeaders.team?.logo && <img src={String(teamLeaders.team.logo)} className="w-5 h-5 object-contain"/>}
                      {String(teamLeaders.team?.displayName || 'Team')}
                    </div>
                    {teamLeaders.leaders?.map((cat: any, j: number) => {
                      const leader = cat.leaders?.[0];
                      if (!leader) return null;
                      return (
                        <div key={j} className="flex items-center gap-3 bg-secondary/20 p-2 rounded-lg">
                          <img src={String(leader.athlete?.headshot || 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png')} className="w-10 h-10 rounded-full object-cover border border-border" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase">{String(cat.displayName || '')}</p>
                            <p className="font-semibold text-sm truncate">{String(leader.athlete?.displayName || 'Unknown Player')}</p>
                          </div>
                          <div className="text-lg font-bold text-primary">{String(leader.displayValue || '')}</div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="lineups" className="p-4 space-y-6">
          {keyEvents?.length > 0 && (
            <div className="bg-card border border-border p-4 rounded-xl">
              <h4 className="text-primary font-bold mb-3 border-b border-primary/20 pb-2">Key Events</h4>
              <div className="space-y-3">
                {keyEvents.map((ev: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm border-b border-border/50 pb-2 last:border-0">
                    <div className="font-bold text-primary min-w-[40px]">{String(ev.clock || '')}</div>
                    <div>
                      <p className="font-medium">{String(ev.text || '')}</p>
                      <p className="text-xs text-muted-foreground">{String(ev.type || '')} {ev.team ? `• ${String(ev.team)}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rosters?.length === 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rosters.map((teamRoster: any, i: number) => (
                <div key={i} className="bg-card border border-border p-4 rounded-xl">
                  <h4 className="font-bold mb-3 border-b border-border pb-2 flex items-center gap-2">
                    {String(teamRoster.team?.displayName || 'Team')}
                  </h4>
                  <div className="space-y-2">
                    {teamRoster.roster?.map((player: any, j: number) => (
                      <div key={j} className="flex justify-between items-center text-sm border-b border-border/20 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs w-4">{String(player.jersey || '')}</span>
                          <span>{String(player.athlete?.displayName || '')}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{String(player.position?.abbreviation || '')}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              Lineups are not available yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="media" className="p-4 space-y-6">
          {/* Article */}
          {article && (
            <div className="bg-card border border-border p-4 rounded-xl">
              <h4 className="text-lg font-bold mb-2">{String(article.headline || '')}</h4>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-4">{String(article.story || '')}</p>
              {article.link && (
                <a href={String(article.link)} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline">Read Full Article</a>
              )}
            </div>
          )}

          {/* Videos */}
          {videos?.length > 0 && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {videos.map((v: any, i: number) => (
                 <a key={i} href={String(v.link || '#')} target="_blank" rel="noreferrer" className="group block relative rounded-xl overflow-hidden border border-border">
                   {v.thumbnail && <img src={String(v.thumbnail)} alt={String(v.headline || '')} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                     <Play className="text-white opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all group-hover:text-primary" size={32} />
                   </div>
                   <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent p-2">
                     <p className="text-xs text-white font-medium truncate">{String(v.headline || '')}</p>
                   </div>
                 </a>
               ))}
             </div>
          )}
          
          {/* News */}
          {news?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-primary font-bold border-b border-primary/20 pb-2">Latest News</h4>
              {news.map((n: any, i: number) => (
                <a key={i} href={String(n.link || '#')} target="_blank" rel="noreferrer" className="flex gap-3 bg-card border border-border p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  {n.image && <img src={String(n.image)} alt={String(n.headline || '')} className="w-16 h-16 object-cover rounded-md" />}
                  <div>
                    <h5 className="font-semibold text-sm mb-1">{String(n.headline || '')}</h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">{String(n.description || '')}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Dialog open={!!match} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-card/50 sticky top-0 z-10">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <img src={String(match?.home?.logo || '')} alt={String(match?.home?.name || '')} className="w-12 h-12 object-contain" />
                <span className="text-xs mt-1 font-bold">{String(match?.home?.abbreviation || '')}</span>
              </div>
              <div className="text-3xl font-extrabold font-mono tracking-tighter">
                {match?.home?.score !== undefined ? String(match.home.score) : '-'} <span className="text-muted-foreground font-normal mx-1">:</span> {match?.away?.score !== undefined ? String(match.away.score) : '-'}
              </div>
              <div className="flex flex-col items-center">
                <img src={String(match?.away?.logo || '')} alt={String(match?.away?.name || '')} className="w-12 h-12 object-contain" />
                <span className="text-xs mt-1 font-bold">{String(match?.away?.abbreviation || '')}</span>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            <Badge variant={match.state === 'in' ? 'destructive' : 'secondary'} className={match.state === 'in' ? 'animate-pulse' : ''}>
              {String(match.status || '')} {match.clock ? `• ${String(match.clock)}` : ''}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
