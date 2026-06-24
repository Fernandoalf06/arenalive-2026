import { Trophy } from 'lucide-react';

// This is a beautiful static/interactive UI representation of the Knockout stage.
// As the tournament progresses and API endpoints expose bracket data, we will hook it up.
export default function KnockoutBracket() {
  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-[800px] bg-card border border-border p-6 rounded-2xl shadow-xl relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-10 relative z-10">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          <h2 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            Road to the Final
          </h2>
          <p className="text-muted-foreground mt-2">The knockout phase bracket will be generated here once the group stages conclude.</p>
        </div>

        {/* Mock Bracket Visual Structure */}
        <div className="flex justify-center items-stretch gap-8 relative z-10 opacity-60">
           {/* Round of 32 (Left) */}
           <div className="flex flex-col justify-around gap-4">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1 w-32">
                   <div className="bg-secondary/50 border border-border/50 rounded p-2 text-xs font-bold text-center">Group {String.fromCharCode(65+i*2)} Winner</div>
                   <div className="bg-secondary/50 border border-border/50 rounded p-2 text-xs font-bold text-center">Group {String.fromCharCode(66+i*2)} Runner-up</div>
                </div>
             ))}
           </div>

           {/* Round of 16 (Left) */}
           <div className="flex flex-col justify-around gap-12 border-l-2 border-primary/20 pl-4">
             {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-card border-2 border-primary/30 rounded p-3 text-xs font-bold text-center w-32 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  TBD
                </div>
             ))}
           </div>

           {/* Semi Final (Left) */}
           <div className="flex flex-col justify-around gap-24 border-l-2 border-primary/40 pl-4">
               <div className="bg-primary/20 border-2 border-primary rounded-lg p-4 text-sm font-bold text-center w-36 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  Finalist 1
               </div>
           </div>

           {/* FINAL */}
           <div className="flex flex-col justify-center items-center px-8 border-l-2 border-r-2 border-yellow-500/50">
               <div className="bg-gradient-to-b from-yellow-500/20 to-transparent border-2 border-yellow-500 rounded-xl p-6 text-center w-48 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                  <h4 className="text-yellow-500 font-black uppercase mb-2 tracking-widest">Final Match</h4>
                  <p className="text-xs text-muted-foreground">July 19, 2026</p>
                  <p className="text-xs font-semibold mt-1">MetLife Stadium</p>
               </div>
           </div>

           {/* Semi Final (Right) */}
           <div className="flex flex-col justify-around gap-24 border-r-2 border-blue-400/40 pr-4">
               <div className="bg-blue-500/20 border-2 border-blue-400 rounded-lg p-4 text-sm font-bold text-center w-36 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  Finalist 2
               </div>
           </div>

           {/* Round of 16 (Right) */}
           <div className="flex flex-col justify-around gap-12 border-r-2 border-blue-400/20 pr-4">
             {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-card border-2 border-blue-400/30 rounded p-3 text-xs font-bold text-center w-32 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  TBD
                </div>
             ))}
           </div>

           {/* Round of 32 (Right) */}
           <div className="flex flex-col justify-around gap-4">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1 w-32">
                   <div className="bg-secondary/50 border border-border/50 rounded p-2 text-xs font-bold text-center">Group {String.fromCharCode(73+i*2)} Winner</div>
                   <div className="bg-secondary/50 border border-border/50 rounded p-2 text-xs font-bold text-center">Group {String.fromCharCode(74+i*2)} Runner-up</div>
                </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}
