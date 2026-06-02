import Room1 from "@/components/canvas/room-1";
import Link from "next/link";
import { Cpu, LayoutGrid, Monitor, Compass, Map } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Cpu className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-bold text-base tracking-wide bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-transparent">
              OfficeAI
            </span>
            <span className="text-[10px] text-cyan-400 font-mono block -mt-0.5 tracking-wider">
              ASSEMBLY_v1.0
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 transition-all hover:text-cyan-300"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Room 1 Workspace
          </Link>
          <Link
            href="/explorer"
            className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 transition-all hover:text-zinc-200"
          >
            <Compass className="w-3.5 h-3.5" />
            Atlas Explorer
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Left column: Engine Display */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          <Room1 />
        </section>

        {/* Right column: Specs and Architecture */}
        <section className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          {/* Module Specs Card */}
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-md">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Monitor className="w-4 h-4 text-cyan-400" />
              Engine Specifications
            </h2>
            <ul className="space-y-4 text-xs">
              <li className="flex justify-between items-start border-b border-zinc-800/60 pb-3">
                <span className="text-zinc-500 font-medium">Renderer</span>
                <span className="text-zinc-300 text-right font-mono font-semibold">HTML5 Canvas 2D API</span>
              </li>
              <li className="flex justify-between items-start border-b border-zinc-800/60 pb-3">
                <span className="text-zinc-500 font-medium">Control Interface</span>
                <span className="text-zinc-300 text-right font-mono font-semibold">WASD / Arrow Keys</span>
              </li>
              <li className="flex justify-between items-start border-b border-zinc-800/60 pb-3">
                <span className="text-zinc-500 font-medium">Collision Engine</span>
                <span className="text-zinc-300 text-right font-mono font-semibold">19x19 Walkability Matrix</span>
              </li>
              <li className="flex justify-between items-start border-b border-zinc-800/60 pb-3">
                <span className="text-zinc-500 font-medium">Target Asset</span>
                <span className="text-cyan-400 text-right font-mono font-semibold">TXjh2o.png (1254x1254px)</span>
              </li>
              <li className="flex justify-between items-start">
                <span className="text-zinc-500 font-medium">Click Target</span>
                <span className="text-purple-400 text-right font-mono font-semibold">Interactive Whiteboard</span>
              </li>
            </ul>
          </div>

          {/* Quick instructions / features list */}
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-xl">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Map className="w-3.5 h-3.5 text-purple-400" />
              Interactive Controls
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Use the <strong className="text-cyan-400">Arrow keys</strong> or <strong className="text-cyan-400">WASD</strong> to pilot the glowing retro office robot inside the office boundaries. The simulator scans the grid and blocks movement through walls, tables, and cabinets.
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hover over the <strong className="text-zinc-200">whiteboard (goals/todo board)</strong> on the top wall to see your cursor change to a pointer, then click it to view the board content!
            </p>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 px-6 py-6 text-center text-[10px] font-mono text-zinc-600 mt-auto">
        &copy; 2026 OfficeAI Platform • Built with Next.js App Router and HTML5 Canvas API
      </footer>
    </div>
  );
}

