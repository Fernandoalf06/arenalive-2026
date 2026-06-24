import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Activity } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GlobalStats() {
  const { data, error, isLoading } = useSWR('/api/stats', fetcher, {
    refreshInterval: 120000,
  });

  if (error) {
    return <div className="text-center py-10 text-destructive">Failed to load statistics</div>;
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl bg-card" />
        <Skeleton className="h-40 w-full rounded-xl bg-card" />
      </div>
    );
  }

  // The API might not return global leaders directly in stats. Let's gracefully handle it.
  const stats = data.stats || [];

  if (stats.length === 0) {
     return (
       <div className="text-center py-16 px-4 bg-card border border-border rounded-xl">
         <Activity className="w-12 h-12 text-primary/50 mx-auto mb-4" />
         <h3 className="text-xl font-bold mb-2">Tournament Leaders</h3>
         <p className="text-muted-foreground">Comprehensive tournament statistics will be available soon.</p>
       </div>
     );
  }

  return (
    <div className="space-y-6">
      {stats.map((statCategory: any, idx: number) => (
        <div key={idx} className="bg-card border border-border p-4 rounded-xl">
           <h3 className="text-primary font-bold mb-4 border-b border-primary/20 pb-2">{statCategory.name || 'Statistics'}</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {statCategory.leaders?.map((leader: any, j: number) => (
               <div key={j} className="flex items-center gap-4 bg-secondary/30 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                  <img src={leader.athlete?.headshot || 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png'} className="w-12 h-12 rounded-full object-cover border border-border" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-sm">{leader.athlete?.displayName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users size={10} /> {leader.team?.displayName}
                    </p>
                  </div>
                  <div className="text-2xl font-black text-primary">{leader.displayValue}</div>
               </div>
             ))}
           </div>
        </div>
      ))}
    </div>
  );
}
