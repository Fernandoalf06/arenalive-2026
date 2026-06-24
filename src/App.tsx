import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Volume2 } from 'lucide-react';
import MatchList from '@/components/matches/MatchList';

function App() {
  const [activeTab, setActiveTab] = useState('matches');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-extrabold tracking-tight">
          ArenaLive <span className="text-primary">2026</span>
        </div>
        <div className="flex gap-4">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Bell size={20} />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors">
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

          <TabsContent value="standings">
            <h2 className="text-2xl font-bold mb-6">Group Stage Standings</h2>
            <div className="text-center text-muted-foreground py-10">Standings coming soon...</div>
          </TabsContent>

          <TabsContent value="bracket">
            <h2 className="text-2xl font-bold mb-6">Knockout Bracket</h2>
            <div className="text-center text-muted-foreground py-10">Bracket coming soon...</div>
          </TabsContent>

          <TabsContent value="stats">
            <h2 className="text-2xl font-bold mb-6">Tournament Leaders</h2>
            <div className="text-center text-muted-foreground py-10">Stats coming soon...</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
