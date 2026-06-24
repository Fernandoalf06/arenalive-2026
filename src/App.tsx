import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Volume2 } from 'lucide-react';
import MatchList from '@/components/matches/MatchList';
import GlobalStandings from '@/components/standings/GlobalStandings';
import GlobalStats from '@/components/stats/GlobalStats';
import KnockoutBracket from '@/components/bracket/KnockoutBracket';

function App() {
  const [activeTab, setActiveTab] = useState('matches');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-extrabold tracking-tight">
          ArenaLive <span className="text-primary">2026</span>
        </div>
        <div className="flex gap-4">
          <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Notifications" title="Notifications">
            <Bell size={20} />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Sound settings" title="Sound settings">
            <Volume2 size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <Tabs defaultValue="matches" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-card border border-border">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Live & Upcoming</h2>
              <div className="bg-destructive/20 text-destructive text-xs font-bold px-2 py-1 rounded animate-pulse">
                LIVE
              </div>
            </div>
            <MatchList />
          </TabsContent>

          <TabsContent value="standings" className="mt-0">
            <h2 className="text-2xl font-bold mb-6">Group Stage Standings</h2>
            <GlobalStandings />
          </TabsContent>

          <TabsContent value="bracket" className="mt-0">
            <h2 className="text-2xl font-bold mb-6">Knockout Bracket</h2>
            <KnockoutBracket />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <h2 className="text-2xl font-bold mb-6">Tournament Leaders</h2>
            <GlobalStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
