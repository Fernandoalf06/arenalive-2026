import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GlobalStandings() {
  const { data, error, isLoading } = useSWR('/api/standings', fetcher, {
    refreshInterval: 120000,
  });

  if (error) {
    return <div className="text-center py-10 text-destructive">Failed to load standings</div>;
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl bg-card" />
        ))}
      </div>
    );
  }

  const groups = data.children || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group: any, idx: number) => (
          <div key={idx} className="bg-card border border-border p-4 rounded-xl overflow-x-auto shadow-sm">
            <h3 className="text-primary font-bold mb-4 border-b border-primary/20 pb-2">{group.name}</h3>
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground bg-secondary/30">
                <tr>
                  <th className="p-2 rounded-tl-lg">Team</th>
                  <th className="p-2 text-center">P</th>
                  <th className="p-2 text-center">W</th>
                  <th className="p-2 text-center">D</th>
                  <th className="p-2 text-center">L</th>
                  <th className="p-2 text-center">GD</th>
                  <th className="p-2 text-center font-bold text-primary rounded-tr-lg">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.standings?.entries?.map((entry: any, i: number) => {
                  const getStat = (name: string) => entry.stats.find((s:any) => s.name === name)?.displayValue || '0';
                  // Top 2 usually qualify
                  const isQualifying = i < 2;
                  
                  return (
                    <tr key={i} className={`border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors`}>
                      <td className="p-2 flex items-center gap-2">
                        <div className={`w-1 h-full absolute left-0 top-0 bottom-0 ${isQualifying ? 'bg-primary' : ''}`} />
                        <img src={entry.team.logos?.[0]?.href} alt={entry.team.abbreviation} className="w-5 h-5 object-contain" />
                        <span className="font-semibold truncate max-w-[100px] sm:max-w-[150px]" title={entry.team.displayName}>
                          {entry.team.displayName}
                        </span>
                      </td>
                      <td className="p-2 text-center">{getStat('gamesPlayed')}</td>
                      <td className="p-2 text-center">{getStat('wins')}</td>
                      <td className="p-2 text-center">{getStat('ties')}</td>
                      <td className="p-2 text-center">{getStat('losses')}</td>
                      <td className="p-2 text-center">{getStat('pointDifferential')}</td>
                      <td className="p-2 text-center font-bold text-primary">{getStat('points')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
