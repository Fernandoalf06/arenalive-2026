import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Goal, Newspaper } from 'lucide-react';
import { useState } from 'react';
import MatchDetailDialog from './MatchDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MatchList() {
  const { data, error, isLoading } = useSWR('/api/matches', fetcher, {
    refreshInterval: 60000,
  });
  
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('arenalive_favorites') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFav = (teamName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let newFavs = [...favorites];
    if (newFavs.includes(teamName)) {
      newFavs = newFavs.filter(t => t !== teamName);
    } else {
      newFavs.push(teamName);
    }
    setFavorites(newFavs);
    localStorage.setItem('arenalive_favorites', JSON.stringify(newFavs));
  };

  if (error) return <div className="text-destructive text-center py-10">Failed to load matches</div>;
  
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-48 w-full rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  const matches = data.matches || [];
  
  const sortedMatches = [...matches].sort((a, b) => {
    const aFav = favorites.includes(a.home.name) || favorites.includes(a.away.name);
    const bFav = favorites.includes(b.home.name) || favorites.includes(b.away.name);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMatches.map((match: any) => {
          const isFav = favorites.includes(match.home.name) || favorites.includes(match.away.name);
          const isLive = match.state === 'in';
          
          return (
            <Card 
              key={match.id} 
              className={`overflow-hidden cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/20 ${isFav ? 'border-primary/50 bg-primary/5' : 'bg-card/50'}`}
              onClick={() => setSelectedMatch(match)}
            >
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-3 border-b border-border/50 bg-card/80">
                  <div className="flex items-center gap-2">
                    <Badge variant={isLive ? "destructive" : "secondary"} className={isLive ? "animate-pulse" : ""}>
                      {match.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{match.clock}</span>
                  </div>
                  <button 
                    onClick={(e) => toggleFav(match.home.name, e)}
                    className={`p-1.5 rounded-full transition-colors ${isFav ? 'text-yellow-500 bg-yellow-500/10' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    <Star size={16} fill={isFav ? "currentColor" : "none"} />
                  </button>
                </div>
                
                {match.venue && (
                  <div className="text-xs text-muted-foreground text-center py-1.5 bg-secondary/30 flex items-center justify-center gap-1">
                    <MapPin size={12} /> {match.venue}
                  </div>
                )}

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={match.home.logo} alt={match.home.name} className="w-8 h-8 object-contain" />
                      <span className="font-semibold text-lg">{match.home.name}</span>
                    </div>
                    <span className={`text-2xl font-bold ${match.home.winner ? 'text-primary' : ''}`}>
                      {match.home.score !== undefined ? match.home.score : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={match.away.logo} alt={match.away.name} className="w-8 h-8 object-contain" />
                      <span className="font-semibold text-lg">{match.away.name}</span>
                    </div>
                    <span className={`text-2xl font-bold ${match.away.winner ? 'text-primary' : ''}`}>
                      {match.away.score !== undefined ? match.away.score : '-'}
                    </span>
                  </div>
                </div>

                {(match.goalScorers?.length > 0 || match.headline) && (
                  <div className="bg-secondary/20 p-3 text-xs flex flex-col gap-1.5">
                    {match.goalScorers?.map((g: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-primary">
                        <Goal size={12} /> {g.name} <span className="text-muted-foreground opacity-70">{g.clock}</span>
                      </div>
                    ))}
                    {match.headline && (
                      <div className="flex items-center gap-1.5 text-muted-foreground italic mt-1 border-t border-border/50 pt-1">
                        <Newspaper size={12} /> {match.headline}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      <MatchDetailDialog match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </>
  );
}
